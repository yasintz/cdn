export type TransactionType = 'income' | 'expense' | 'transfer';
export type Frequency = 'weekly' | 'monthly' | 'once';
export type ViewMode = 'expected' | 'actual';

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment' | 'other';
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  accountId: string;
  toAccountId?: string; // For transfers
  date: number; // timestamp
  category?: string;
  isRecurring: boolean;
  recurringId?: string; // Reference to recurring transaction if this is generated from one
  approved: boolean;
  createdAt: number;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  accountId: string;
  toAccountId?: string; // For transfers
  frequency: 'weekly' | 'monthly';
  startDate: number; // timestamp
  endDate?: number; // Optional end date
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  category?: string;
  autoApprove: boolean; // Whether to auto-approve generated instances
  createdAt: number;
}

export interface GeneratedTransaction {
  id: string;
  recurringId: string;
  transactionId: string;
  dueDate: number;
  approved: boolean;
  skipped: boolean;
}

export interface StoreState {
  accounts: Account[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  generatedTransactions: GeneratedTransaction[];
  viewMode: ViewMode;

  // Account actions
  createAccount: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction actions
  createTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  approveTransaction: (id: string) => void;

  // Recurring transaction actions
  createRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;

  // Generated transaction actions
  approveGeneratedTransaction: (id: string) => void;
  skipGeneratedTransaction: (id: string) => void;
  bulkApproveGenerated: (ids: string[]) => void;

  // View actions
  setViewMode: (mode: ViewMode) => void;

  // Utility actions
  generateRecurringTransactions: (untilDate: number) => void;
}
