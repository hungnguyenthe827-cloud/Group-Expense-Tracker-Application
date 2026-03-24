type Props = {
  label: string;
  type?: string;
  register: any;
  name: string;
  required?: boolean;
};

export default function Input({
  label,
  type = "text",
  register,
  name,
  required,
}: Props) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label>{label}</label>
      <input
        type={type}
        {...register(name, { required })}
        style={{ display: "block", padding: "8px", width: "100%" }}
      />
    </div>
  );
}