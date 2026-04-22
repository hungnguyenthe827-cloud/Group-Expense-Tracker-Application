import { formatVND } from "./formatCurrency";

export const SETTLED_THRESHOLD = 500;

type GroupExpense = {
  amount?: number;
  payer?: string;
};

type GroupLike = {
  members?: string[];
  expenses?: GroupExpense[];
  budget?: number;
};

export type DebtStatusKey = "owes" | "gets_back" | "settled";

export type DebtStatusMeta = {
  key: DebtStatusKey;
  title: string;
  description: string;
  accentTextClass: string;
  badgeClass: string;
  surfaceClass: string;
  amount: number;
  formattedAmount: string;
};

export function calculateGroupBalances(group: GroupLike) {
  const balances: Record<string, number> = {};
  const members = group.members || [];
  const expenses = group.expenses || [];

  members.forEach((member) => {
    balances[member] = 0;
  });

  expenses.forEach((expense) => {
    if (!members.length || !expense.amount) return;

    const splitAmount = expense.amount / members.length;

    members.forEach((member) => {
      if (member === expense.payer) {
        balances[member] += expense.amount - splitAmount;
      } else {
        balances[member] -= splitAmount;
      }
    });
  });

  return balances;
}

export function getGroupBalanceForUser(group: GroupLike, user: string) {
  const balances = calculateGroupBalances(group);
  return balances[user] || 0;
}

export function getGroupTotalSpent(group: GroupLike) {
  return (group.expenses || []).reduce((sum, expense) => sum + (expense.amount || 0), 0);
}

export function getDebtStatusMeta(balance: number): DebtStatusMeta {
  if (Math.abs(balance) <= SETTLED_THRESHOLD) {
    return {
      key: "settled",
      title: "Settled",
      description: "Your current balance difference is effectively zero.",
      accentTextClass: "text-slate-500",
      badgeClass: "bg-slate-100 text-slate-600",
      surfaceClass: "bg-slate-50 border-slate-200",
      amount: 0,
      formattedAmount: formatVND(0),
    };
  }

  if (balance > 0) {
    return {
      key: "gets_back",
      title: "You are owed",
      description: "Other members owe you money in this group.",
      accentTextClass: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700",
      surfaceClass: "bg-emerald-50 border-emerald-200",
      amount: balance,
      formattedAmount: formatVND(balance),
    };
  }

  return {
    key: "owes",
    title: "You owe",
    description: "You still need to pay money back in this group.",
    accentTextClass: "text-rose-600",
    badgeClass: "bg-rose-50 text-rose-700",
    surfaceClass: "bg-rose-50 border-rose-200",
    amount: Math.abs(balance),
    formattedAmount: formatVND(Math.abs(balance)),
  };
}

export function buildShareSummary(group: GroupLike, currentUser: string) {
  const totalSpent = getGroupTotalSpent(group);
  const balance = getGroupBalanceForUser(group, currentUser);
  const status = getDebtStatusMeta(balance);
  const budget = group.budget || 0;
  const budgetUsedPct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;

  return {
    totalSpent,
    expenseCount: (group.expenses || []).length,
    memberCount: (group.members || []).length,
    budget,
    balance,
    status,
    budgetUsedPct,
    budgetRemaining: budget > 0 ? budget - totalSpent : 0,
    isOverBudget: budget > 0 && totalSpent > budget,
  };
}
