import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import GoogleButton from "../../components/common/GoogleButton";


type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const fakeUser = {
      id: "1",
      name: "Trang",
      email: data.email,
    };

    const fakeToken = "abc123";

    setAuth(fakeUser, fakeToken);
    navigate("/dashboard");
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" name="email" register={register} required />
        <Input label="Password" name="password" type="password" register={register} required />

        <Button type="submit">Login</Button>
      </form>
        <GoogleButton />
      <p style={{ marginTop: "10px" }}>
        Don't have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => navigate("/register")}
        >
          Register
        </span>
      </p>
    </div>
  );
}
// TODO: replace with loginApi when backend ready