import { useForm } from "react-hook-form";
import { createExpense } from "../../services/expenseService";
import Card from "../../components/common/Card";
import toast from "react-hot-toast";

type FormData = {
  description: string;
  amount: number;
};

export default function AddExpense() {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await createExpense(data);
      toast.success("Expense added!");
      reset();

      window.location.reload();

    } catch {
      toast.error("Add failed");
    }
  };

  return (
    <Card>
      <h3>Add Expense</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("description")} placeholder="Description" />
        <input type="number" {...register("amount")} placeholder="Amount" />
        <button type="submit">Add</button>
      </form>
    </Card>
  );
}