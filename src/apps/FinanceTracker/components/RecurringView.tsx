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
import { Plus, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Trash2, RefreshCw } from 'lucide-react';
import type { TransactionType, Frequency } from '../types';
import dayjs from 'dayjs';

export function RecurringView() {
  const {
    accounts,
    recurringTransactions,
    createRecurringTransaction,
    deleteRecurringTransaction,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    description: '',
    accountId: '',
    toAccountId: '',
    frequency: 'monthly' as Frequency,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: '',
    dayOfWeek: '0',
    dayOfMonth: '1',
    category: '',
    autoApprove: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecurringTransaction({
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      accountId: formData.accountId,
      toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
      frequency: formData.frequency === 'once' ? 'monthly' : formData.frequency,
      startDate: dayjs(formData.startDate).valueOf(),
      endDate: formData.endDate ? dayjs(formData.endDate).valueOf() : undefined,
      dayOfWeek: formData.frequency === 'weekly' ? parseInt(formData.dayOfWeek) : undefined,
      dayOfMonth: formData.frequency === 'monthly' ? parseInt(formData.dayOfMonth) : undefined,
      category: formData.category || undefined,
      autoApprove: formData.autoApprove,
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
      frequency: 'monthly',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: '',
      dayOfWeek: '0',
      dayOfMonth: '1',
      category: '',
      autoApprove: false,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring transaction? All pending instances will be removed.')) {
      deleteRecurringTransaction(id);
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

  const getFrequencyDescription = (recurring: typeof recurringTransactions[0]) => {
    if (recurring.frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Weekly on ${days[recurring.dayOfWeek || 0]}`;
    } else if (recurring.frequency === 'monthly') {
      return `Monthly on day ${recurring.dayOfMonth}`;
    }
    return recurring.frequency;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recurring Transactions</h2>
          <p className="text-muted-foreground">Set up automatic income, expenses, and transfers</p>
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
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Recurring Transaction</DialogTitle>
              <DialogDescription>
                Set up a recurring income, expense, or transfer
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
                    placeholder="e.g., Monthly salary, Rent payment"
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
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value: Frequency) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="dayOfMonth">Day of Month (1-31)</Label>
                    <Input
                      id="dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoApprove"
                    checked={formData.autoApprove}
                    onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="autoApprove">
                    Auto-approve instances (automatically counts in actual view)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Recurring</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Create an account first to add recurring transactions</p>
          </CardContent>
        </Card>
      ) : recurringTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No recurring transactions yet</p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recurring Transactions</CardTitle>
            <CardDescription>
              {recurringTransactions.length} recurring transaction{recurringTransactions.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Auto-Approve</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recurringTransactions.map((recurring) => (
                  <TableRow key={recurring.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(recurring.type)}
                        <span className="capitalize">{recurring.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{recurring.description}</div>
                        {recurring.category && (
                          <Badge variant="outline" className="mt-1">{recurring.category}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {recurring.type === 'transfer' && recurring.toAccountId
                        ? `${getAccountName(recurring.accountId)} → ${getAccountName(recurring.toAccountId)}`
                        : getAccountName(recurring.accountId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" />
                        {getFrequencyDescription(recurring)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(recurring.startDate)}</TableCell>
                    <TableCell className="text-right">
                      <span className={
                        recurring.type === 'income'
                          ? 'text-green-600 font-semibold'
                          : recurring.type === 'expense'
                          ? 'text-red-600 font-semibold'
                          : ''
                      }>
                        {recurring.type === 'income' && '+'}
                        {recurring.type === 'expense' && '-'}
                        {formatCurrency(recurring.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {recurring.autoApprove ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(recurring.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
