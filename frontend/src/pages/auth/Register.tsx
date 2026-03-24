import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log("Register Data:", data);

    // MOCK
    alert("Register success (mock)");
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Name" name="name" register={register} />
        <Input label="Email" name="email" register={register} />
        <Input label="Password" name="password" type="password" register={register} />

        <Button type="submit">Register</Button>
      </form>
    </div>
  );
}