import { theme } from "../../styles/theme";

type Props = {
  children: React.ReactNode;
};

export default function Card({ children }: Props) {
  return (
    <div
      style={{
        background: theme.colors.card,
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        marginBottom: "16px",
      }}
    >
      {children}
    </div>
  );
}