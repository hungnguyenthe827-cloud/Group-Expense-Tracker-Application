import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import QuickNavDrawer from "../../components/layout/QuickNavDrawer";
import { getCurrentUser } from "../../utils/currentUser";
import { buildBalanceChangedMessage, pushNotification } from "../../utils/notifications";
import { buildShareSummary, getGroupBalanceForUser } from "../../utils/groupFinancials";

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser() || "You";

  const [group, setGroup] = useState<any>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState(0);
  const [payer, setPayer] = useState("");
  const [category, setCategory] = useState("food");

  // 🔥 DATE (default today)
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  // LOAD GROUP
  useEffect(() => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");

    const found = groups.find(
      (g: any) => String(g.id) === String(id)
    );

    if (found) {
      setGroup({
        ...found,
        members: found.members || [],
        expenses: found.expenses || [],
      });

      setPayer(found.members?.[0] || "");
    }
  }, [id]);

  if (!group) return <div className="p-6">Loading...</div>;

  // FORMAT MONEY
  const handleAmount = (val: string) => {
    const num = val.replace(/\D/g, "");
    const parsed = Number(num);

    setRawAmount(parsed);
    setAmount(parsed.toLocaleString("vi-VN"));
  };

  // SAVE
  const handleSave = () => {
    if (!description || !rawAmount || !payer) {
      alert("Please fill in all required fields");
      return;
    }

    const newExpense = {
      id: Date.now(),
      description,
      amount: rawAmount,
      payer,
      category,
      date: new Date(date).toLocaleDateString("vi-VN"),
    };

    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const previousGroup = groups.find((g: any) => String(g.id) === String(id));

    const updated = groups.map((g: any) => {
      if (String(g.id) === String(id)) {
        return {
          ...g,
          expenses: [...(g.expenses || []), newExpense],
        };
      }
      return g;
    });

    localStorage.setItem("groups", JSON.stringify(updated));

    const updatedGroup = updated.find((g: any) => String(g.id) === String(id));
    const previousBalance = previousGroup ? getGroupBalanceForUser(previousGroup, currentUser) : 0;
    const nextBalance = updatedGroup ? getGroupBalanceForUser(updatedGroup, currentUser) : 0;
    const previousSummary = previousGroup ? buildShareSummary(previousGroup, currentUser) : null;
    const nextSummary = updatedGroup ? buildShareSummary(updatedGroup, currentUser) : null;

    pushNotification(currentUser, {
      type: "expense_added",
      title: `Chi tiêu mới trong ${updatedGroup?.name || "group"}`,
      message: `${payer} vừa thêm "${description}" với số tiền ${rawAmount.toLocaleString("vi-VN")} đ.`,
      groupId: updatedGroup?.id,
      groupName: updatedGroup?.name,
      actor: payer,
      amount: rawAmount,
      priority: "medium",
      actionLabel: "Xem group",
      actionRoute: `/group/${id}`,
    });

    if (Math.round(previousBalance) !== Math.round(nextBalance)) {
      pushNotification(currentUser, {
        type: "balance_changed",
        title: "Trạng thái nợ của bạn thay đổi",
        message: buildBalanceChangedMessage(nextBalance),
        groupId: updatedGroup?.id,
        groupName: updatedGroup?.name,
        amount: Math.abs(nextBalance),
        priority: "high",
        actionLabel: "Xem balance",
        actionRoute: `/group/${id}`,
      });
    }

    if (nextSummary && nextSummary.budget > 0) {
      const crossedWarning = (previousSummary?.budgetUsedPct || 0) < 80 && nextSummary.budgetUsedPct >= 80 && !nextSummary.isOverBudget;
      const crossedExceeded = !(previousSummary?.isOverBudget) && nextSummary.isOverBudget;

      if (crossedWarning) {
        pushNotification(currentUser, {
          type: "budget_warning",
          title: `Group ${updatedGroup?.name || ""} sắp chạm ngân sách`,
          message: `${Math.round(nextSummary.budgetUsedPct)}% ngân sách đã được sử dụng.`,
          groupId: updatedGroup?.id,
          groupName: updatedGroup?.name,
          priority: "medium",
          actionLabel: "Xem budget",
          actionRoute: `/group/${id}`,
        });
      }

      if (crossedExceeded) {
        pushNotification(currentUser, {
          type: "budget_exceeded",
          title: `Group ${updatedGroup?.name || ""} đã vượt ngân sách`,
          message: `Đã vượt ${Math.abs(nextSummary.budgetRemaining).toLocaleString("vi-VN")} đ so với ngân sách đã đặt.`,
          groupId: updatedGroup?.id,
          groupName: updatedGroup?.name,
          priority: "high",
          actionLabel: "Xem budget",
          actionRoute: `/group/${id}`,
        });
      }
    }

    navigate(`/group/${id}`);
  };

  // CATEGORY ICON LIST
  const categories = [
    { key: "food", icon: "🍜" },
    { key: "drink", icon: "🍹" },
    { key: "travel", icon: "✈️" },
    { key: "shopping", icon: "🛍️" },
    { key: "hotel", icon: "🏨" },
    { key: "transport", icon: "🚗" },
    { key: "gift", icon: "🎁" },
    { key: "other", icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <QuickNavDrawer currentGroupId={id} />

      {/* HEADER */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 cursor-pointer text-indigo-600 ml-16"
      >
        <ArrowLeft size={40} />
        Back
      </div>

      {/* AMOUNT TOP */}
      <div className="text-center mb-6">

  <p className="text-gray-400 text-sm mb-1">
    ENTER AMOUNT
  </p>

        <div className="text-4xl font-bold text-indigo-600">
          ₫{amount || "0"}
        </div>

      </div>

      {/* MAIN CARD */}
      <div className="bg-white p-6 rounded-2xl shadow max-w-0x1 mx-auto space-y-4">

        {/* DESCRIPTION */}
        <input
          placeholder="What was it for?"
          className="w-full border p-3 rounded-xl"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* AMOUNT INPUT */}
        <input
          value={amount}
          onChange={(e) => handleAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full border p-3 rounded-xl"
        />

        {/* DATE */}
        <div>
          <p className="text-sm text-gray-400 mb-1">Date</p>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />
        </div>

        {/* CATEGORY ICON GRID */}
        <div>
          <p className="text-sm text-gray-400 mb-2">
            What was it for?
          </p>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`text-2xl p-3 rounded-xl border ${
                  category === c.key
                    ? "bg-indigo-100 border-indigo-500"
                    : "bg-gray-50"
                }`}
              >
                {c.icon}
              </button>
            ))}
          </div>
        </div>

        {/* PAYER */}
        <select
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          className="w-full border p-3 rounded-xl"
        >
          {group.members.map((m: string, i: number) => (
            <option key={i}>{m}</option>
          ))}
        </select>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700"
        >
          Save Expense
        </button>

      </div>

    </div>
  );
}
