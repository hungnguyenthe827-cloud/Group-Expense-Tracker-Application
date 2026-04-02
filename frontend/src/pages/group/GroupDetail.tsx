import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { formatVND } from "../../utils/formatCurrency";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const found = groups.find((g: any) => g.id == id);
    if (found) setGroup(found);
  }, [id]);

  const handleAddExpense = () => {
    if (!description || !amount || !payer) return;

    const newExpense = {
      id: Date.now(),
      description,
      amount: Number(amount),
      payer,
      category,
      date: new Date().toLocaleDateString(),
    };

    const groups = JSON.parse(localStorage.getItem("groups") || "[]");

    const updatedGroups = groups.map((g: any) => {
      if (g.id == group.id) {
        return {
          ...g,
          expenses: [...g.expenses, newExpense],
        };
      }
      return g;
    });

    localStorage.setItem("groups", JSON.stringify(updatedGroups));

    setGroup({
      ...group,
      expenses: [...group.expenses, newExpense],
    });

    setDescription("");
    setAmount("");
    setPayer("");
    setCategory("");
  };

  if (!group) return <div className="p-6">Loading...</div>;

  const total = group.expenses.reduce(
    (sum: number, e: any) => sum + e.amount,
    0
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 cursor-pointer text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back
      </div>

      <h1 className="text-2xl font-bold mb-4">{group.name}</h1>

      {/* MEMBERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <h3 className="font-semibold mb-2">Members</h3>

        <div className="flex flex-wrap gap-2">
          {group.members.map((m: string, i: number) => (
            <span
              key={i}
              className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <p className="text-gray-400">Total</p>
        <h2 className="text-xl font-bold text-indigo-600">
          {formatVND(total)}
        </h2>
      </div>

      {/* ADD EXPENSE */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">

        <input
          placeholder="Description"
          className="w-full border p-2 mb-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          className="w-full border p-2 mb-2 rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          placeholder="Payer"
          className="w-full border p-2 mb-2 rounded"
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
        />

        <input
          placeholder="Category"
          className="w-full border p-2 mb-2 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button
          onClick={handleAddExpense}
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          Add Expense
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-2">Expenses</h3>

        {group.expenses.map((e: any) => (
          <div key={e.id} className="flex justify-between border-b py-2">
            <div>
              <p>{e.description}</p>
              <p className="text-xs text-gray-400">
                {e.payer} • {e.date}
              </p>
            </div>
            <span>{formatVND(e.amount)}</span>
          </div>
        ))}
      </div>

    </div>
  );
}