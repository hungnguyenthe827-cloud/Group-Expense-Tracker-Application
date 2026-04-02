import { useEffect, useState } from "react";
import { getExpenses } from "../../services/expenseService";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Error from "../../components/common/Error";

type Expense = {
  id: string;
  description: string;
  amount: number;
};

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await getExpenses();
      setExpenses(res.data);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>Expenses</h2>

      {expenses.map((e) => (
        <Card key={e.id}>
          <p>{e.description}</p>
          <strong>{e.amount} VND</strong>
        </Card>
      ))}
    </div>
  );
}