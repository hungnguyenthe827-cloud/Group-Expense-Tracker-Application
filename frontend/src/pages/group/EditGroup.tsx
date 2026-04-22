import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditGroup() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const groups = JSON.parse(localStorage.getItem("groups") || "[]");

  useEffect(() => {
    const group = groups.find((g: any) => g.id == id);
    if (group) {
      setGroupName(group.name);
      setMembers(group.members);
    }
  }, [id]);

  const handleAdd = () => {
    if (input.trim()) {
      setMembers([...members, input]);
      setInput("");
    }
  };

  const handleRemove = (i: number) => {
    setMembers(members.filter((_, index) => index !== i));
  };

  const handleSave = () => {
    const updated = groups.map((g: any) =>
      g.id == id ? { ...g, name: groupName, members } : g
    );

    localStorage.setItem("groups", JSON.stringify(updated));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">Edit Group</h2>

        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-3 border rounded-xl mb-4"
        />

        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border rounded-xl"
            placeholder="Add member"
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 rounded-xl"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {members.map((m, i) => (
            <div key={i} className="bg-gray-200 px-3 py-1 rounded-full">
              {m}
              <button
                onClick={() => handleRemove(i)}
                className="ml-2 text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
        >
          Save Changes
        </button>

      </div>
    </div>
  );
}