import { db } from "@/lib/db";
import { protectPage } from "@/lib/protect";
import { ExpenseApprovalList } from "@/components/finance/expense-approval";

export default async function ApproveExpensePage() {
  await protectPage(["admin"]);

  // Fetch Pending Expenses
  const pendingExpenses = await db.expense.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
        order: { select: { orderNo: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Approve Expenses</h1>
        <p className="text-slate-500">Review claims submitted by staff.</p>
      </div>

      <ExpenseApprovalList expenses={pendingExpenses} />
    </div>
  );
}