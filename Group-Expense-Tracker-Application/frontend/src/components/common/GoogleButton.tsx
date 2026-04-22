export default function GoogleButton() {
  const handleGoogleLogin = () => {
    console.log("Google login clicked");
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "10px",
        background: "#fff",
        border: "1px solid #ccc",
        cursor: "pointer",
      }}
    >
      Continue with Google
    </button>
  );
}