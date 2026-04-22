import { useForm } from "react-hook-form";
import { createGroup } from "../../services/groupService";
import Card from "../../components/common/Card";
import toast from "react-hot-toast";

type FormData = {
  name: string;
};

export default function CreateGroup() {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await createGroup(data.name);
      toast.success("Group created!");
      reset();

      // reload page tạm thời (step 10 sẽ tối ưu)
      window.location.reload();

    } catch (err) {
      toast.error("Create failed");
    }
  };

  return (
    <Card>
      <h3>Create Group</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("name")} placeholder="Group name" />
        <button type="submit">Create</button>
      </form>
    </Card>
  );
}