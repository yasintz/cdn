import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStore } from './store';
import { Dashboard } from './components/Dashboard';
import { AccountsView } from './components/AccountsView';
import { TransactionsView } from './components/TransactionsView';
import { RecurringView } from './components/RecurringView';
import { ApprovalsView } from './components/ApprovalsView';

export function Component() {
  const { viewMode, setViewMode, pendingApprovalsCount } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Tracker</h1>
          <p className="text-muted-foreground">
            Track your income, expenses, and financial goals
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="view-mode">Expected</Label>
            <Switch
              id="view-mode"
              checked={viewMode === 'actual'}
              onCheckedChange={(checked) => setViewMode(checked ? 'actual' : 'expected')}
            />
            <Label htmlFor="view-mode">Actual</Label>
          </div>

          {pendingApprovalsCount() > 0 && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('approvals')}
              className="relative"
            >
              Approvals
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {pendingApprovalsCount()}
              </span>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {pendingApprovalsCount() > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                {pendingApprovalsCount()}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Dashboard />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountsView />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsView />
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <RecurringView />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <ApprovalsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
