import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Plus, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Trash2, Check } from 'lucide-react';
import type { TransactionType } from '../types';
import dayjs from 'dayjs';

export function TransactionsView() {
  const {
    accounts,
    viewMode,
    expectedTransactions,
    actualTransactions,
    createTransaction,
    deleteTransaction,
    approveTransaction,
  } = useStore();

  const transactions = viewMode === 'expected' ? expectedTransactions() : actualTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    description: '',
    accountId: '',
    toAccountId: '',
    date: dayjs().format('YYYY-MM-DD'),
    category: '',
    approved: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      accountId: formData.accountId,
      toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
      date: dayjs(formData.date).valueOf(),
      category: formData.category || undefined,
      isRecurring: false,
      approved: formData.approved,
    });
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      accountId: accounts[0]?.id || '',
      toAccountId: '',
      date: dayjs().format('YYYY-MM-DD'),
      category: '',
      approved: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
      case 'expense':
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAccountName = (id: string) => {
    return accounts.find(a => a.id === id)?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            Viewing {viewMode === 'expected' ? 'expected' : 'actual'} transactions
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
          else if (formData.accountId === '' && accounts.length > 0) {
            setFormData({ ...formData, accountId: accounts[0].id });
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={accounts.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
              <DialogDescription>
                Add a new one-time transaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value: TransactionType) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountId">
                      {formData.type === 'transfer' ? 'From Account' : 'Account'}
                    </Label>
                    <Select value={formData.accountId} onValueChange={(value) => setFormData({ ...formData, accountId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'transfer' && (
                    <div className="space-y-2">
                      <Label htmlFor="toAccountId">To Account</Label>
                      <Select value={formData.toAccountId} onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.filter(a => a.id !== formData.accountId).map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.type !== 'transfer' && (
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Food, Salary"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="approved"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="approved">Mark as approved (counts in actual view)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Transaction</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Create an account first to add transactions</p>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No transactions yet</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="capitalize">{transaction.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{transaction.description}</div>
                        {transaction.isRecurring && (
                          <Badge variant="outline" className="mt-1">Recurring</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.type === 'transfer' && transaction.toAccountId
                        ? `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId)}`
                        : getAccountName(transaction.accountId)}
                    </TableCell>
                    <TableCell>{transaction.category || '-'}</TableCell>
                    <TableCell className="text-right">
                      <span className={
                        transaction.type === 'income'
                          ? 'text-green-600 font-semibold'
                          : transaction.type === 'expense'
                          ? 'text-red-600 font-semibold'
                          : ''
                      }>
                        {transaction.type === 'income' && '+'}
                        {transaction.type === 'expense' && '-'}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {transaction.approved ? (
                        <Badge variant="default">Approved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!transaction.approved && !transaction.isRecurring && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveTransaction(transaction.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {!transaction.isRecurring && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
