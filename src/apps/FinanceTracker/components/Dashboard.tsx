import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '../store';
import dayjs from 'dayjs';
import { formatCurrency } from '../utils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export function Dashboard() {
  const { accounts, viewMode, accountBalances, expectedTransactions, actualTransactions } = useStore();

  const transactions = viewMode === 'expected' ? expectedTransactions() : actualTransactions();
  const balances = accountBalances();

  const projections = useMemo(() => {
    const now = dayjs();
    const endOfWeek = now.endOf('week');
    const endOfMonth = now.endOf('month');

    // Calculate total current balance
    const currentBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);

    // Calculate balance at end of week
    const weekTransactions = transactions.filter(t =>
      dayjs(t.date).isAfter(now) && dayjs(t.date).isBefore(endOfWeek)
    );
    const weekChange = weekTransactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
    const endOfWeekBalance = currentBalance + weekChange;

    // Calculate balance at end of month
    const monthTransactions = transactions.filter(t =>
      dayjs(t.date).isAfter(now) && dayjs(t.date).isBefore(endOfMonth)
    );
    const monthChange = monthTransactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
    const endOfMonthBalance = currentBalance + monthChange;

    // Calculate this week's income/expenses
    const thisWeekStart = now.startOf('week');
    const thisWeekTransactions = transactions.filter(t =>
      dayjs(t.date).isAfter(thisWeekStart) && dayjs(t.date).isBefore(endOfWeek)
    );
    const thisWeekIncome = thisWeekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const thisWeekExpenses = thisWeekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate this month's income/expenses
    const thisMonthStart = now.startOf('month');
    const thisMonthTransactions = transactions.filter(t =>
      dayjs(t.date).isAfter(thisMonthStart) && dayjs(t.date).isBefore(endOfMonth)
    );
    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const thisMonthExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      currentBalance,
      endOfWeekBalance,
      endOfMonthBalance,
      weekChange,
      monthChange,
      thisWeekIncome,
      thisWeekExpenses,
      thisMonthIncome,
      thisMonthExpenses,
    };
  }, [transactions, balances]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projections.currentBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">End of Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projections.endOfWeekBalance)}</div>
            <div className="flex items-center text-xs mt-1">
              {projections.weekChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={projections.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {projections.weekChange >= 0 ? '+' : ''}{formatCurrency(projections.weekChange)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">End of Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projections.endOfMonthBalance)}</div>
            <div className="flex items-center text-xs mt-1">
              {projections.monthChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={projections.monthChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                {projections.monthChange >= 0 ? '+' : ''}{formatCurrency(projections.monthChange)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>
              {dayjs().startOf('week').format('MMM D')} - {dayjs().endOf('week').format('MMM D, YYYY')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Income</span>
              <span className="font-semibold text-green-600">+{formatCurrency(projections.thisWeekIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="font-semibold text-red-600">-{formatCurrency(projections.thisWeekExpenses)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Net</span>
              <span className={`font-bold ${projections.thisWeekIncome - projections.thisWeekExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projections.thisWeekIncome - projections.thisWeekExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>
              {dayjs().format('MMMM YYYY')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Income</span>
              <span className="font-semibold text-green-600">+{formatCurrency(projections.thisMonthIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="font-semibold text-red-600">-{formatCurrency(projections.thisMonthExpenses)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Net</span>
              <span className={`font-bold ${projections.thisMonthIncome - projections.thisMonthExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(projections.thisMonthIncome - projections.thisMonthExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts Overview</CardTitle>
          <CardDescription>Current balances by account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accounts.map(account => (
              <div key={account.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{account.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(balances[account.id] || 0)}</div>
                </div>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No accounts yet. Create one in the Accounts tab.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
