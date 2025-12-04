import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { computed } from 'zustand-computed-state';
import { gSheetStorage } from '@/utils/zustand/gsheet-storage';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';
import type { StoreState, Account, Transaction, RecurringTransaction, GeneratedTransaction } from './types';

const computeState = (state: StoreState) => ({
  // Computed: Get all transactions for expected view (including pending recurring)
  expectedTransactions: (): Transaction[] => {
    const approved = state.transactions.filter(t => t.approved);
    const generated = state.generatedTransactions
      .filter(g => !g.skipped)
      .map(g => {
        const recurring = state.recurringTransactions.find(r => r.id === g.recurringId);
        if (!recurring) return null;

        return {
          id: g.transactionId,
          type: recurring.type,
          amount: recurring.amount,
          description: recurring.description,
          accountId: recurring.accountId,
          toAccountId: recurring.toAccountId,
          date: g.dueDate,
          category: recurring.category,
          isRecurring: true,
          recurringId: recurring.id,
          approved: g.approved,
          createdAt: g.dueDate,
        } as Transaction;
      })
      .filter((t): t is Transaction => t !== null);

    return [...approved, ...generated].sort((a, b) => a.date - b.date);
  },

  // Computed: Get only approved/actual transactions
  actualTransactions: (): Transaction[] => {
    return state.transactions
      .filter(t => t.approved)
      .sort((a, b) => a.date - b.date);
  },

  // Computed: Calculate account balances
  accountBalances: (): Record<string, number> => {
    const balances: Record<string, number> = {};

    state.accounts.forEach(account => {
      balances[account.id] = account.balance;
    });

    const transactions = state.viewMode === 'expected'
      ? computeState(state).expectedTransactions()
      : computeState(state).actualTransactions();

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        balances[transaction.accountId] = (balances[transaction.accountId] || 0) + transaction.amount;
      } else if (transaction.type === 'expense') {
        balances[transaction.accountId] = (balances[transaction.accountId] || 0) - transaction.amount;
      } else if (transaction.type === 'transfer' && transaction.toAccountId) {
        balances[transaction.accountId] = (balances[transaction.accountId] || 0) - transaction.amount;
        balances[transaction.toAccountId] = (balances[transaction.toAccountId] || 0) + transaction.amount;
      }
    });

    return balances;
  },

  // Computed: Get pending approvals count
  pendingApprovalsCount: (): number => {
    return state.generatedTransactions.filter(g => !g.approved && !g.skipped).length;
  },
});

export const useStore = create<StoreState>()(
  computed(
    immer(
      persist(
        (set, get) => ({
          accounts: [],
          transactions: [],
          recurringTransactions: [],
          generatedTransactions: [],
          viewMode: 'expected',

          // Account actions
          createAccount: (account) => {
            set((state) => {
              state.accounts.push({
                ...account,
                id: nanoid(),
                createdAt: Date.now(),
              });
            });
          },

          updateAccount: (id, updates) => {
            set((state) => {
              const account = state.accounts.find(a => a.id === id);
              if (account) {
                Object.assign(account, updates);
              }
            });
          },

          deleteAccount: (id) => {
            set((state) => {
              state.accounts = state.accounts.filter(a => a.id !== id);
              // Also remove transactions related to this account
              state.transactions = state.transactions.filter(
                t => t.accountId !== id && t.toAccountId !== id
              );
            });
          },

          // Transaction actions
          createTransaction: (transaction) => {
            set((state) => {
              const newTransaction: Transaction = {
                ...transaction,
                id: nanoid(),
                createdAt: Date.now(),
              };
              state.transactions.push(newTransaction);

              // Update account balance if approved
              if (newTransaction.approved) {
                const account = state.accounts.find(a => a.id === newTransaction.accountId);
                if (account) {
                  if (newTransaction.type === 'income') {
                    account.balance += newTransaction.amount;
                  } else if (newTransaction.type === 'expense') {
                    account.balance -= newTransaction.amount;
                  } else if (newTransaction.type === 'transfer' && newTransaction.toAccountId) {
                    account.balance -= newTransaction.amount;
                    const toAccount = state.accounts.find(a => a.id === newTransaction.toAccountId);
                    if (toAccount) {
                      toAccount.balance += newTransaction.amount;
                    }
                  }
                }
              }
            });
          },

          updateTransaction: (id, updates) => {
            set((state) => {
              const transaction = state.transactions.find(t => t.id === id);
              if (transaction) {
                Object.assign(transaction, updates);
              }
            });
          },

          deleteTransaction: (id) => {
            set((state) => {
              const transaction = state.transactions.find(t => t.id === id);
              if (transaction && transaction.approved) {
                // Reverse the balance changes
                const account = state.accounts.find(a => a.id === transaction.accountId);
                if (account) {
                  if (transaction.type === 'income') {
                    account.balance -= transaction.amount;
                  } else if (transaction.type === 'expense') {
                    account.balance += transaction.amount;
                  } else if (transaction.type === 'transfer' && transaction.toAccountId) {
                    account.balance += transaction.amount;
                    const toAccount = state.accounts.find(a => a.id === transaction.toAccountId);
                    if (toAccount) {
                      toAccount.balance -= transaction.amount;
                    }
                  }
                }
              }
              state.transactions = state.transactions.filter(t => t.id !== id);
            });
          },

          approveTransaction: (id) => {
            set((state) => {
              const transaction = state.transactions.find(t => t.id === id);
              if (transaction && !transaction.approved) {
                transaction.approved = true;

                // Update account balance
                const account = state.accounts.find(a => a.id === transaction.accountId);
                if (account) {
                  if (transaction.type === 'income') {
                    account.balance += transaction.amount;
                  } else if (transaction.type === 'expense') {
                    account.balance -= transaction.amount;
                  } else if (transaction.type === 'transfer' && transaction.toAccountId) {
                    account.balance -= transaction.amount;
                    const toAccount = state.accounts.find(a => a.id === transaction.toAccountId);
                    if (toAccount) {
                      toAccount.balance += transaction.amount;
                    }
                  }
                }
              }
            });
          },

          // Recurring transaction actions
          createRecurringTransaction: (recurring) => {
            set((state) => {
              state.recurringTransactions.push({
                ...recurring,
                id: nanoid(),
                createdAt: Date.now(),
              });
            });
            // Generate instances for the next 3 months
            const threeMonthsFromNow = dayjs().add(3, 'month').valueOf();
            get().generateRecurringTransactions(threeMonthsFromNow);
          },

          updateRecurringTransaction: (id, updates) => {
            set((state) => {
              const recurring = state.recurringTransactions.find(r => r.id === id);
              if (recurring) {
                Object.assign(recurring, updates);
              }
            });
            // Regenerate instances
            const threeMonthsFromNow = dayjs().add(3, 'month').valueOf();
            get().generateRecurringTransactions(threeMonthsFromNow);
          },

          deleteRecurringTransaction: (id) => {
            set((state) => {
              state.recurringTransactions = state.recurringTransactions.filter(r => r.id !== id);
              // Remove generated transactions for this recurring transaction
              state.generatedTransactions = state.generatedTransactions.filter(
                g => g.recurringId !== id
              );
            });
          },

          // Generated transaction actions
          approveGeneratedTransaction: (id) => {
            set((state) => {
              const generated = state.generatedTransactions.find(g => g.id === id);
              if (generated && !generated.approved) {
                generated.approved = true;

                // Create an actual transaction
                const recurring = state.recurringTransactions.find(r => r.id === generated.recurringId);
                if (recurring) {
                  const newTransaction: Transaction = {
                    id: generated.transactionId,
                    type: recurring.type,
                    amount: recurring.amount,
                    description: recurring.description,
                    accountId: recurring.accountId,
                    toAccountId: recurring.toAccountId,
                    date: generated.dueDate,
                    category: recurring.category,
                    isRecurring: true,
                    recurringId: recurring.id,
                    approved: true,
                    createdAt: Date.now(),
                  };
                  state.transactions.push(newTransaction);

                  // Update account balance
                  const account = state.accounts.find(a => a.id === newTransaction.accountId);
                  if (account) {
                    if (newTransaction.type === 'income') {
                      account.balance += newTransaction.amount;
                    } else if (newTransaction.type === 'expense') {
                      account.balance -= newTransaction.amount;
                    } else if (newTransaction.type === 'transfer' && newTransaction.toAccountId) {
                      account.balance -= newTransaction.amount;
                      const toAccount = state.accounts.find(a => a.id === newTransaction.toAccountId);
                      if (toAccount) {
                        toAccount.balance += newTransaction.amount;
                      }
                    }
                  }
                }
              }
            });
          },

          skipGeneratedTransaction: (id) => {
            set((state) => {
              const generated = state.generatedTransactions.find(g => g.id === id);
              if (generated) {
                generated.skipped = true;
              }
            });
          },

          bulkApproveGenerated: (ids) => {
            ids.forEach(id => {
              get().approveGeneratedTransaction(id);
            });
          },

          // View actions
          setViewMode: (mode) => {
            set((state) => {
              state.viewMode = mode;
            });
          },

          // Utility actions
          generateRecurringTransactions: (untilDate) => {
            set((state) => {
              const now = Date.now();

              state.recurringTransactions.forEach(recurring => {
                // Clear existing future generated transactions for this recurring
                state.generatedTransactions = state.generatedTransactions.filter(
                  g => g.recurringId !== recurring.id || g.dueDate < now
                );

                let currentDate = dayjs(recurring.startDate);
                const endDate = recurring.endDate ? dayjs(recurring.endDate) : dayjs(untilDate);

                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                  let dueDate: dayjs.Dayjs | null = null;

                  if (recurring.frequency === 'weekly' && recurring.dayOfWeek !== undefined) {
                    dueDate = currentDate.day(recurring.dayOfWeek);
                    if (dueDate.isBefore(currentDate)) {
                      dueDate = dueDate.add(1, 'week');
                    }
                  } else if (recurring.frequency === 'monthly' && recurring.dayOfMonth !== undefined) {
                    dueDate = currentDate.date(recurring.dayOfMonth);
                    if (dueDate.isBefore(currentDate)) {
                      dueDate = dueDate.add(1, 'month');
                    }
                  }

                  if (dueDate && dueDate.isAfter(now) && dueDate.isBefore(untilDate)) {
                    const dueDateTimestamp = dueDate.valueOf();

                    // Check if already generated
                    const exists = state.generatedTransactions.some(
                      g => g.recurringId === recurring.id && g.dueDate === dueDateTimestamp
                    );

                    if (!exists) {
                      const generated: GeneratedTransaction = {
                        id: nanoid(),
                        recurringId: recurring.id,
                        transactionId: nanoid(),
                        dueDate: dueDateTimestamp,
                        approved: recurring.autoApprove,
                        skipped: false,
                      };
                      state.generatedTransactions.push(generated);

                      // If auto-approve, create the transaction
                      if (recurring.autoApprove) {
                        const newTransaction: Transaction = {
                          id: generated.transactionId,
                          type: recurring.type,
                          amount: recurring.amount,
                          description: recurring.description,
                          accountId: recurring.accountId,
                          toAccountId: recurring.toAccountId,
                          date: dueDateTimestamp,
                          category: recurring.category,
                          isRecurring: true,
                          recurringId: recurring.id,
                          approved: true,
                          createdAt: Date.now(),
                        };
                        state.transactions.push(newTransaction);

                        // Update account balance
                        const account = state.accounts.find(a => a.id === newTransaction.accountId);
                        if (account) {
                          if (newTransaction.type === 'income') {
                            account.balance += newTransaction.amount;
                          } else if (newTransaction.type === 'expense') {
                            account.balance -= newTransaction.amount;
                          } else if (newTransaction.type === 'transfer' && newTransaction.toAccountId) {
                            account.balance -= newTransaction.amount;
                            const toAccount = state.accounts.find(a => a.id === newTransaction.toAccountId);
                            if (toAccount) {
                              toAccount.balance += newTransaction.amount;
                            }
                          }
                        }
                      }
                    }
                  }

                  // Move to next period
                  if (recurring.frequency === 'weekly') {
                    currentDate = currentDate.add(1, 'week');
                  } else if (recurring.frequency === 'monthly') {
                    currentDate = currentDate.add(1, 'month');
                  } else {
                    break;
                  }
                }
              });
            });
          },
        }),
        { name: 'finance-tracker' }
      )
    ),
    computeState
  )
);

gSheetStorage(
  'Finance Tracker',
  '1lyqDQFS40EQ7ObVkrJAx6NUs04Kq_LnslXbIa1pXVzU'
).handleStore(useStore);
