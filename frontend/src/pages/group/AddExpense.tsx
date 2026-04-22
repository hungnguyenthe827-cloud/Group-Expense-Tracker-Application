import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      alert("Vui lòng nhập đầy đủ");
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

      {/* HEADER */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 cursor-pointer text-indigo-600"
      >
        <ArrowLeft size={18} />
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
      <div className="bg-white p-6 rounded-2xl shadow max-w-lg mx-auto space-y-4">

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