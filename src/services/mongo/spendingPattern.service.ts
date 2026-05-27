import { SpendingPattern } from "../../models/mongo/SpendingPattern.js";

export interface ExpenseTransaction {
  category: string;
  amount: number;
  type: "income" | "expense";
}

interface GeneratePatternsInput {
  userId: string;
  transactions: ExpenseTransaction[];
  month: number;
  year: number;
}

export const spendingPatternService = {
  list(userId: string) {
    return SpendingPattern.find({ userId }).sort({ year: -1, month: -1 }).lean();
  },

  async generate({ userId, transactions, month, year }: GeneratePatternsInput) {
    const expenses = transactions.filter((item) => item.type === "expense");
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const byCategory = new Map<string, { totalSpent: number; count: number }>();

    for (const expense of expenses) {
      const existing = byCategory.get(expense.category) ?? {
        totalSpent: 0,
        count: 0,
      };
      existing.totalSpent += expense.amount;
      existing.count += 1;
      byCategory.set(expense.category, existing);
    }

    const patterns = [...byCategory.entries()].map(([category, values]) => {
      const share = total ? (values.totalSpent / total) * 100 : 0;
      const roundedShare = Math.round(share);
      const riskLevel = share > 40 ? "high" : share > 25 ? "medium" : "low";

      return {
        userId,
        category,
        totalSpent: values.totalSpent,
        transactionCount: values.count,
        month,
        year,
        pattern: `${category} representa ${roundedShare}% de tus egresos del mes.`,
        riskLevel,
      };
    });

    return Promise.all(
      patterns.map((pattern) =>
        SpendingPattern.findOneAndUpdate(
          {
            userId,
            category: pattern.category,
            month,
            year,
          },
          pattern,
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );
  },
};
