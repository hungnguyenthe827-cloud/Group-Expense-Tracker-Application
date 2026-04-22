import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateGroup() {
  const navigate = useNavigate();

  const [groupName, setGroupName] = useState("");

  // 🔥 CATEGORY
  const [category, setCategory] = useState("Trip");
  const [categoryIcon, setCategoryIcon] = useState("✈️");

  const [editingCategory, setEditingCategory] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [members, setMembers] = useState<string[]>([]);
  const [inputMember, setInputMember] = useState("");

  // 🔥 EMOJI LIST
  const emojis = [
    "✈️","🍜","🍻","🏠","🛍️","🚗","🎉","🏝️",
    "📚","🎬","💼","🍕","☕","🎮","🏨","🚀"
  ];

  const handleAddMember = () => {
    if (inputMember.trim() !== "") {
      setMembers([...members, inputMember]);
      setInputMember("");
    }
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!groupName) return alert("Enter group name");

    const newGroup = {
      id: Date.now(),
      name: groupName,
      category,
      icon: categoryIcon, // 🔥 IMPORTANT
      members,
      expenses: []
    };

    const existing = JSON.parse(localStorage.getItem("groups") || "[]");

    localStorage.setItem(
      "groups",
      JSON.stringify([...existing, newGroup])
    );

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate(-1)}>← Back</button>

        <h1 className="text-xl font-bold text-indigo-600">
          Create Group
        </h1>

        <button
          onClick={handleCreate}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl"
        >
          Create
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* GROUP NAME */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className="w-full px-4 py-3 border rounded-xl"
          />
        </div>

        {/* 🔥 CATEGORY EDIT */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="mb-4 font-semibold">Category</h2>

          <div className="flex items-center gap-3">

            {/* ICON */}
            <div
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl cursor-pointer"
            >
              {categoryIcon}
            </div>

            {/* TITLE */}
            {editingCategory ? (
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => setEditingCategory(false)}
                autoFocus
                className="border px-3 py-2 rounded"
              />
            ) : (
              <div
                onDoubleClick={() => setEditingCategory(true)}
                className="text-lg font-medium cursor-pointer"
              >
                {category}
              </div>
            )}

          </div>

          {/* 🔥 EMOJI PICKER */}
          {showEmojiPicker && (
            <div className="grid grid-cols-8 gap-3 mt-4 bg-gray-50 p-4 rounded-xl">
              {emojis.map((e, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setCategoryIcon(e);
                    setShowEmojiPicker(false);
                  }}
                  className="text-2xl cursor-pointer hover:scale-110"
                >
                  {e}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MEMBERS */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="mb-4 font-semibold">Members</h2>

          <div className="flex gap-2 mb-4">
            <input
              value={inputMember}
              onChange={(e) => setInputMember(e.target.value)}
              placeholder="Enter name..."
              className="flex-1 border px-4 py-2 rounded"
            />

            <button
              onClick={handleAddMember}
              className="bg-indigo-600 text-white px-4 rounded"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {members.map((m, i) => (
              <div
                key={i}
                className="bg-gray-100 px-3 py-1 rounded-full flex gap-2"
              >
                {m}
                <button onClick={() => handleRemoveMember(i)}>✕</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}