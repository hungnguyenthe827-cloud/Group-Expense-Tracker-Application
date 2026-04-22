import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Link2, Search, Users, Wallet } from "lucide-react";
import { getCurrentUser } from "../../utils/currentUser";

const CATEGORIES = [
  { label: "Trip",     icon: "✈️",  color: "from-indigo-600 to-violet-700", bg: "bg-indigo-50",  text: "text-indigo-700",  desc: "Plan your next adventure." },
  { label: "Food",     icon: "🍜",  color: "from-orange-400 to-rose-500",   bg: "bg-orange-50",  text: "text-orange-700",  desc: "Track dining & takeouts." },
  { label: "Home",     icon: "🏠",  color: "from-teal-500 to-emerald-600",  bg: "bg-teal-50",    text: "text-teal-700",    desc: "Split household bills." },
  { label: "Party",    icon: "🎉",  color: "from-pink-500 to-fuchsia-600",  bg: "bg-pink-50",    text: "text-pink-700",    desc: "Celebrate together." },
  { label: "Shopping", icon: "🛍️",  color: "from-yellow-400 to-amber-500",  bg: "bg-yellow-50",  text: "text-yellow-700",  desc: "Share shopping costs." },
  { label: "Work",     icon: "💼",  color: "from-slate-600 to-gray-700",    bg: "bg-slate-50",   text: "text-slate-700",   desc: "Office & team expenses." },
];

const SUGGESTED = [
  { name: "Trang", email: "trang@example.com", avatar: "T", color: "bg-violet-500" },
  { name: "Ly",    email: "ly@example.com",    avatar: "L", color: "bg-emerald-500" },
  { name: "Hưng",  email: "hung@example.com",  avatar: "H", color: "bg-rose-500" },
  { name: "Minh",  email: "minh@example.com",  avatar: "M", color: "bg-amber-500" },
];

export default function CreateGroup() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [groupName, setGroupName]       = useState("");
  const [category, setCategory]         = useState(CATEGORIES[0]);
  const [members, setMembers]           = useState<string[]>([]);
  const [inputMember, setInputMember]   = useState("");
  const [memberError, setMemberError]   = useState("");
  const [budget, setBudget]             = useState("");
  const [rawBudget, setRawBudget]       = useState(0);

  const handleBudget = (val: string) => {
    const num = val.replace(/\D/g, "");
    setRawBudget(Number(num));
    setBudget(num ? Number(num).toLocaleString("vi-VN") : "");
  };

  const handleAddMember = (name: string = inputMember) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) { setMemberError("Already added."); return; }
    setMembers([...members, trimmed]);
    setInputMember("");
    setMemberError("");
  };

  const handleRemoveMember = (index: number) =>
    setMembers(members.filter((_, i) => i !== index));

  const handleCreate = () => {
    if (!groupName.trim()) return alert("Please enter a group name.");
    const normalizedMembers = Array.from(new Set([currentUser, ...members].filter(Boolean)));
    const newGroup = {
      id: Date.now(),
      name: groupName.trim(),
      category: category.label,
      icon: category.icon,
      members: normalizedMembers,
      expenses: [],
      budget: rawBudget,
      messages: [],
    };
    const existing = JSON.parse(localStorage.getItem("groups") || "[]");
    localStorage.setItem("groups", JSON.stringify([...existing, newGroup]));
    navigate("/dashboard");
  };

  const filteredSuggested = SUGGESTED.filter(
    (s) =>
      !members.includes(s.name) &&
      (inputMember === "" ||
        s.name.toLowerCase().includes(inputMember.toLowerCase()) ||
        s.email.toLowerCase().includes(inputMember.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 px-10 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 transition w-24">
          Cancel
        </button>
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Create Group</h1>
        <div className="w-24 flex justify-end">
          <button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition shadow-sm">
            Create
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-10 py-10">
        <div className="grid grid-cols-5 gap-8">

          {/* LEFT */}
          <div className="col-span-3 space-y-6">

            {/* GROUP NAME */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 block">Group Name</label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Camping Trip, House Bills…"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>

            {/* CATEGORY */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 block">Group Category</label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition
                      ${category.label === cat.label ? `${cat.bg} ${cat.text} border-current shadow-sm` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* BUDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={16} className="text-indigo-500" />
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Budget (Optional)</label>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₫</span>
                <input
                  value={budget}
                  onChange={(e) => handleBudget(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Set a total budget to track spending progress in your group.</p>
            </div>

            {/* ADD MEMBERS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-indigo-600">Add Members</h2>
                <button className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition">
                  <Link2 size={13} />
                  Invite via link
                </button>
              </div>

              <div className="relative mb-5">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={inputMember}
                  onChange={(e) => { setInputMember(e.target.value); setMemberError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                  placeholder="Search friends by name or email..."
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              {memberError && <p className="text-red-500 text-xs mb-3">{memberError}</p>}

              {members.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Added ({members.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-2 rounded-full">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                          {m.charAt(0).toUpperCase()}
                        </div>
                        {m}
                        <button onClick={() => handleRemoveMember(i)} className="text-indigo-400 hover:text-indigo-700 transition ml-1">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredSuggested.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Suggested</p>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredSuggested.map((s, i) => (
                      <button key={i} onClick={() => handleAddMember(s.name)}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 transition text-left">
                        <div className={`w-10 h-10 rounded-full ${s.color} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                          {s.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate">{s.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {inputMember.trim() && !SUGGESTED.find(s => s.name.toLowerCase() === inputMember.toLowerCase()) && (
                <button onClick={() => handleAddMember()}
                  className="mt-4 w-full border-2 border-dashed border-indigo-300 text-indigo-600 text-sm py-3 rounded-xl hover:bg-indigo-50 transition">
                  + Add "<span className="font-semibold">{inputMember.trim()}</span>"
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-2 space-y-6">
            <div className={`rounded-2xl bg-gradient-to-br ${category.color} p-8 flex flex-col justify-end shadow-lg min-h-56`}>
              <div className="text-5xl mb-4">{category.icon}</div>
              <p className="text-white font-bold text-xl leading-snug mb-1">{category.desc}</p>
              <p className="text-white/60 text-xs uppercase tracking-widest">Selected: {category.label}</p>
            </div>

            {(rawBudget > 0 || members.length > 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                {rawBudget > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Budget</p>
                    <p className="text-2xl font-bold text-indigo-600">₫{rawBudget.toLocaleString("vi-VN")}</p>
                  </div>
                )}
                {members.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Members</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {members.slice(0, 5).map((m, i) => (
                          <div key={i} className="w-9 h-9 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center border-2 border-white" style={{ zIndex: members.length - i }}>
                            {m.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {members.length > 5 && (
                          <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 text-xs font-bold flex items-center justify-center border-2 border-white">
                            +{members.length - 5}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{members.length} member{members.length > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-100 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-indigo-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm mb-2">Group Dynamics</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Groups allow you to split balances across multiple people effortlessly. Set a budget to track how much you've spent together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
