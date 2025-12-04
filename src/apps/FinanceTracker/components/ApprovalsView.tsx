import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Check, X, CheckCheck, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft } from 'lucide-react';
import type { TransactionType } from '../types';

export function ApprovalsView() {
  const {
    accounts,
    generatedTransactions,
    recurringTransactions,
    approveGeneratedTransaction,
    skipGeneratedTransaction,
    bulkApproveGenerated,
  } = useStore();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const pendingTransactions = generatedTransactions
    .filter(g => !g.approved && !g.skipped)
    .sort((a, b) => a.dueDate - b.dueDate);

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === pendingTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingTransactions.map(t => t.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to approve ${selectedIds.length} transaction${selectedIds.length !== 1 ? 's' : ''}?`)) {
      bulkApproveGenerated(selectedIds);
      setSelectedIds([]);
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
          <h2 className="text-2xl font-bold">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve recurring transactions
          </p>
        </div>
        {selectedIds.length > 0 && (
          <Button onClick={handleBulkApprove}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Approve {selectedIds.length} Selected
          </Button>
        )}
      </div>

      {pendingTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Check className="h-12 w-12 text-green-500 mb-4" />
            <p className="text-lg font-medium mb-2">All caught up!</p>
            <p className="text-muted-foreground">No pending approvals at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''} waiting for approval
                </CardDescription>
              </div>
              {pendingTransactions.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleToggleAll}>
                  {selectedIds.length === pendingTransactions.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === pendingTransactions.length && pendingTransactions.length > 0}
                      onCheckedChange={handleToggleAll}
                    />
                  </TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.map((generated) => {
                  const recurring = recurringTransactions.find(r => r.id === generated.recurringId);
                  if (!recurring) return null;

                  return (
                    <TableRow key={generated.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(generated.id)}
                          onCheckedChange={() => handleToggleSelection(generated.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(generated.dueDate)}</div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {recurring.frequency}
                          </Badge>
                        </div>
                      </TableCell>
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
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveGeneratedTransaction(generated.id)}
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Skip this occurrence?')) {
                                skipGeneratedTransaction(generated.id);
                                setSelectedIds(prev => prev.filter(id => id !== generated.id));
                              }
                            }}
                            title="Skip"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How Approvals Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Recurring transactions generate instances that need approval before they count as "actual"</p>
          <p>• Approve transactions to include them in your actual balance and transaction history</p>
          <p>• Skip transactions if they didn't occur (e.g., missed a paycheck or skipped a payment)</p>
          <p>• Bulk approve multiple transactions at once using the checkboxes</p>
          <p>• Set "Auto-approve" on recurring transactions to skip manual approval</p>
        </CardContent>
      </Card>
    </div>
  );
}
