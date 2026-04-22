type Props = {
  message: string;
};

export default function Error({ message }: Props) {
  return (
    <div style={{ color: "red", padding: "10px" }}>
      {message}
    </div>
  );
}