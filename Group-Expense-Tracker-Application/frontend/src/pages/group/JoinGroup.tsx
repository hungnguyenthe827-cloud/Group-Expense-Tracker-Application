import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../utils/currentUser";

export default function JoinGroup() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleJoin = () => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");

    const found = groups.find((g: any) => g.code === code);

    if (!found) {
      setError("Group code không tồn tại");
      return;
    }

    if (!currentUser) {
      setError("Không tìm thấy người dùng hiện tại");
      return;
    }

    if (!found.members.includes(currentUser)) {
      found.members.push(currentUser);
    }

    const updated = groups.map((g: any) =>
      g.id === found.id ? found : g
    );

    localStorage.setItem("groups", JSON.stringify(updated));

    navigate(`/group/${found.id}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="bg-white p-6 rounded-2xl shadow w-96">

        <h2 className="text-xl font-bold mb-4">
          Join Group
        </h2>

        <input
          placeholder="Enter group code"
          className="w-full border p-3 rounded-xl mb-3"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <button
          onClick={handleJoin}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl"
        >
          Join
        </button>
      </div>
    </div>
  );
}
