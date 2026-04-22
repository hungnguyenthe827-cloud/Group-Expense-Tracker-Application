import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatVND } from "../../utils/formatCurrency";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const currentUser = localStorage.getItem("user") || "You";

  // EDIT STATE
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editRawAmount, setEditRawAmount] = useState(0);
  const [editPayer, setEditPayer] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const found = groups.find((g: any) => String(g.id) === String(id));

    if (found) {
      setGroup({
        ...found,
        members: found.members || [],
        expenses: found.expenses || [],
      });
    }
  }, [id]);

  if (!group) return <div className="p-6">Loading...</div>;

  const expenses = group.expenses || [];

  // TOTAL
  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  // SPLIT LOGIC
  const balances: any = {};
  group.members.forEach((m: string) => (balances[m] = 0));

  expenses.forEach((e: any) => {
    const split = e.amount / group.members.length;

    group.members.forEach((m: string) => {
      if (m === e.payer) {
        balances[m] += e.amount - split;
      } else {
        balances[m] -= split;
      }
    });
  });

  const youOwe = balances[currentUser] || 0;

  // ICON
  const getIcon = (c: string) => {
    switch (c) {
      case "food":
        return "🍜";
      case "travel":
        return "✈️";
      case "shopping":
        return "🛍️";
      case "hotel":
        return "🏨";
      case "drink":
        return "🍹";
      default:
        return "📦";
    }
  };

  // OPEN EDIT
  const openEdit = (e: any) => {
    setEditingExpense(e);
    setEditDesc(e.description);
    setEditRawAmount(e.amount);
    setEditAmount(e.amount.toLocaleString("vi-VN"));
    setEditPayer(e.payer);
    setEditCategory(e.category);

    setEditDate(
      new Date(e.date.split("/").reverse().join("-"))
        .toISOString()
        .split("T")[0]
    );
  };

  // FORMAT AMOUNT
  const handleEditAmount = (val: string) => {
    const num = val.replace(/\D/g, "");

    if (!num) {
      setEditAmount("");
      setEditRawAmount(0);
      return;
    }

    const parsed = Number(num);
    setEditRawAmount(parsed);
    setEditAmount(parsed.toLocaleString("vi-VN"));
  };

  // SAVE EDIT
  const handleSaveEdit = () => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");

    const updated = groups.map((g: any) => {
      if (String(g.id) === String(id)) {
        return {
          ...g,
          expenses: g.expenses.map((exp: any) =>
            exp.id === editingExpense.id
              ? {
                  ...exp,
                  description: editDesc,
                  amount: editRawAmount,
                  payer: editPayer,
                  category: editCategory,
                  date: new Date(editDate).toLocaleDateString("vi-VN"),
                }
              : exp
          ),
        };
      }
      return g;
    });

    localStorage.setItem("groups", JSON.stringify(updated));

    setGroup(
      updated.find((g: any) => String(g.id) === String(id))
    );

    setEditingExpense(null);
  };

  // DELETE
  const handleDelete = (expenseId: number) => {
    if (!confirm("Delete this expense?")) return;

    const groups = JSON.parse(localStorage.getItem("groups") || "[]");

    const updated = groups.map((g: any) => {
      if (String(g.id) === String(id)) {
        return {
          ...g,
          expenses: g.expenses.filter(
            (e: any) => e.id !== expenseId
          ),
        };
      }
      return g;
    });

    localStorage.setItem("groups", JSON.stringify(updated));

    setGroup(
      updated.find((g: any) => String(g.id) === String(id))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 cursor-pointer text-indigo-600"
        >
          <ArrowLeft size={20} />
          Back
        </div>

        <h1 className="font-semibold">{group.name}</h1>
        <div></div>
      </div>

      <div className="px-6 py-8 max-w-5xl mx-auto">

        {/* SUMMARY */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Total</p>
            <h2 className="text-2xl font-bold text-indigo-600">
              {formatVND(total)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">You Owe</p>
            <h2
              className={`text-2xl font-bold ${
                youOwe < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {formatVND(youOwe)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Members</p>
            <h2>{group.members.length}</h2>
          </div>

        </div>

        {/* EXPENSE LIST */}
        <div className="space-y-4 mb-10">

          {expenses.map((e: any) => (
            <div
              key={e.id}
              className="bg-white p-5 rounded-2xl shadow flex justify-between items-center"
            >
              <div
                onClick={() => openEdit(e)}
                className="flex items-center gap-4 cursor-pointer"
              >
                <div className="text-2xl">
                  {getIcon(e.category)}
                </div>

                <div>
                  <p className="font-semibold">{e.description}</p>
                  <p className="text-sm text-gray-400">
                    {e.payer} • {e.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold">
                  {formatVND(e.amount)}
                </span>

                <button
                  onClick={() => handleDelete(e.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* WHO OWES */}
        <div>
          <h3 className="font-semibold mb-4">
            Who’s Owed What
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(balances).map(([name, val]: any) => (
              <div
                key={name}
                className="bg-white p-4 rounded-xl shadow flex justify-between"
              >
                <p>{name}</p>

                <span
                  className={
                    val < 0 ? "text-red-500" : "text-green-500"
                  }
                >
                  {formatVND(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ADD */}
      <button
        onClick={() => navigate(`/group/${id}/add-expense`)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-full"
      >
        + Add Expense
      </button>

      {/* 🔥 EDIT MODAL */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white p-6 rounded-2xl w-full max-w-md">

            <h2 className="font-semibold mb-4">Edit Expense</h2>

            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              value={editAmount}
              onChange={(e) => handleEditAmount(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            />

            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            />

            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full border p-3 rounded mb-3"
            >
              <option value="food">Food</option>
              <option value="travel">Travel</option>
              <option value="shopping">Shopping</option>
              <option value="hotel">Hotel</option>
            </select>

            <select
              value={editPayer}
              onChange={(e) => setEditPayer(e.target.value)}
              className="w-full border p-3 rounded mb-4"
            >
              {group.members.map((m: string, i: number) => (
                <option key={i}>{m}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingExpense(null)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-indigo-600 text-white py-2 rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}