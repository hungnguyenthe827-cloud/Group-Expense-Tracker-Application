import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function CreateGroup() {
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");
  const [error, setError] = useState("");

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleCreate = () => {
    if (!groupName || !members) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const newGroup = {
      id: Date.now(),
      name: groupName,
      members: members.split(","),
      code: generateCode(),
      expenses: [],
    };

    const existingGroups =
      JSON.parse(localStorage.getItem("groups") || "[]");

    localStorage.setItem(
      "groups",
      JSON.stringify([...existingGroups, newGroup])
    );

    navigate(`/group/${newGroup.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">

      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 cursor-pointer text-indigo-600"
      >
        <ArrowLeft size={18} />
        Back
      </div>

      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">

        <h2 className="text-xl font-bold mb-4">
          Create New Group
        </h2>

        <input
          placeholder="Group name"
          className="w-full border p-3 rounded-xl mb-3"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          placeholder="Members (email, email...)"
          className="w-full border p-3 rounded-xl mb-3"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-2">{error}</p>
        )}

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white py-2 rounded-xl"
        >
          Save Group
        </button>
      </div>
    </div>
  );
}