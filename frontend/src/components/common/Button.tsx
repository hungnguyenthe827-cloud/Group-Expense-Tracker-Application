type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({ children, onClick, type = "button" }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        padding: "10px 16px",
        background: "#333",
        color: "#fff",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}