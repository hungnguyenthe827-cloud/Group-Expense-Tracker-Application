import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, LogOut, Users, Trash2, Share2, TrendingUp, TrendingDown, X, Copy, Check, Pin, PinOff, Archive, ArchiveRestore } from "lucide-react";
import { useState, useEffect } from "react";
import type { MouseEvent } from "react";
import { formatVND } from "../../utils/formatCurrency";

const CATEGORY_COLORS: Record<string, string> = {
  Trip: "from-indigo-500 to-violet-600",
  Food: "from-orange-400 to-rose-500",
  Home: "from-teal-500 to-emerald-600",
  Party: "from-pink-500 to-fuchsia-600",
  Shopping: "from-yellow-400 to-amber-500",
  Work: "from-slate-500 to-gray-600",
};
const CATEGORY_BG: Record<string, string> = {
  Trip:"bg-indigo-50 text-indigo-700", Food:"bg-orange-50 text-orange-700",
  Home:"bg-teal-50 text-teal-700", Party:"bg-pink-50 text-pink-700",
  Shopping:"bg-yellow-50 text-yellow-700", Work:"bg-slate-50 text-slate-700",
};
const ALL_CATEGORIES = ["All","Trip","Food","Home","Party","Shopping","Work"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [page, setPage]           = useState<"dashboard"|"groups"|"analytics">("dashboard");
  const [groups, setGroups]       = useState<any[]>([]);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [shareGroup, setShareGroup]   = useState<any>(null);
  const [copied, setCopied]           = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const currentUser = localStorage.getItem("user") || "You";

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("groups") || "[]");
    setGroups(data);
  }, [page]);

  const saveGroups = (updated: any[]) => {
    setGroups(updated);
    localStorage.setItem("groups", JSON.stringify(updated));
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/"); };

  const handleDeleteGroup = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Delete this group?")) return;
    saveGroups(groups.filter((g: any) => g.id !== id));
  };

  // ── PIN ──────────────────────────────────────────────────────
  const handleTogglePin = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    saveGroups(groups.map((g: any) => g.id === id ? { ...g, pinned: !g.pinned } : g));
  };

  // ── ARCHIVE ──────────────────────────────────────────────────
  const handleToggleArchive = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    const target = groups.find((g: any) => g.id === id);
    if (!target) return;
    if (!target.archived && !window.confirm(`Archive "${target.name}"? It will be hidden from active groups.`)) return;
    saveGroups(groups.map((g: any) => g.id === id ? { ...g, archived: !g.archived, pinned: false } : g));
  };

  // Search + filter — split active / archived
  const activeGroups   = groups.filter(g => !g.archived);
  const archivedGroups = groups.filter(g =>  g.archived);

  const filteredGroups = (showArchived ? archivedGroups : activeGroups).filter(g => {
    const matchSearch = search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || g.category === filterCat;
    return matchSearch && matchCat;
  });

  // Pinned always first
  const sortedFiltered = showArchived
    ? filteredGroups
    : [...filteredGroups].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const dashboardFilteredGroups = activeGroups.filter(g => 
    search === "" ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.category || "").toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // Summary calculations
  const totalOwed = groups.reduce((sum, g) => {
    const balances: Record<string,number> = {};
    (g.members || []).forEach((m: string) => (balances[m] = 0));
    (g.expenses || []).forEach((e: any) => {
      if (!g.members?.length) return;
      const split = e.amount / g.members.length;
      g.members.forEach((m: string) => {
        if (m === e.payer) balances[m] += e.amount - split;
        else balances[m] -= split;
      });
    });
    return sum + (balances[currentUser] || 0);
  }, 0);

  const getGroupBalance = (g: any) => {
    const balances: Record<string,number> = {};
    (g.members || []).forEach((m: string) => (balances[m] = 0));
    (g.expenses || []).forEach((e: any) => {
      if (!g.members?.length) return;
      const split = e.amount / g.members.length;
      g.members.forEach((m: string) => {
        if (m === e.payer) balances[m] += e.amount - split;
        else balances[m] -= split;
      });
    });
    return balances[currentUser] || 0;
  };

  const totalSpent = groups.reduce((s, g) => s + (g.expenses || []).reduce((a: number, e: any) => a + e.amount, 0), 0);

  // Analytics data
  const expensesByCategory = groups.reduce((acc: Record<string,number>, g) => {
    (g.expenses || []).forEach((e: any) => {
      const cat = e.category || "other";
      acc[cat] = (acc[cat] || 0) + e.amount;
    });
    return acc;
  }, {});

  const monthlyData = (() => {
    const map: Record<string, number> = {};
    groups.forEach(g => {
      (g.expenses || []).forEach((e: any) => {
        const parts = e.date?.split("/");
        if (!parts || parts.length < 3) return;
        const key = `${parts[1]}/${parts[2]}`;
        map[key] = (map[key] || 0) + e.amount;
      });
    });
    return Object.entries(map).sort().slice(-6);
  })();
  const maxMonthly = Math.max(...monthlyData.map(([,v]) => v), 1);

  const handleShare = (g: any) => setShareGroup(g);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/group/${shareGroup.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recentActivity = groups
    .flatMap(g => (g.expenses || []).map((e: any) => ({ ...e, groupName: g.name, groupId: g.id })))
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (e.description || "").toLowerCase().includes(q) ||
             (e.groupName || "").toLowerCase().includes(q) ||
             (e.category || "").toLowerCase().includes(q) ||
             (e.payer || "").toLowerCase().includes(q);
    })
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const getExpenseIcon = (c: string) => ({ food:"🍜", travel:"✈️", shopping:"🛍️", hotel:"🏨", drink:"🍹", transport:"🚗", gift:"🎁" }[c] || "📦");

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-sm border-r border-gray-100 p-6 flex flex-col fixed h-full">
        <h2 className="text-2xl font-bold text-indigo-600 mb-10 tracking-tight">PayShare</h2>

        <nav className="flex flex-col gap-1">
          {[
            { key:"dashboard", icon:"🏠", label:"Dashboard" },
            { key:"groups",    icon:"👥", label:"Groups" },
            { key:"analytics", icon:"📊", label:"Analytics" },
          ].map(item => (
            <button key={item.key} onClick={() => setPage(item.key as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-left
                ${page === item.key ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate("/create-group")}
          className="mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
          <Plus size={16} /> New Group
        </button>

        <div className="mt-auto pt-6 border-t space-y-2">
          <div className="flex items-center gap-2 text-gray-500 px-2 py-2 rounded-xl text-sm cursor-pointer hover:bg-gray-50">
            <Users size={16} /> Help
          </div>
          <div onClick={handleLogout} className="flex items-center gap-2 text-red-500 px-2 py-2 rounded-xl text-sm cursor-pointer hover:bg-red-50">
            <LogOut size={16} /> Logout
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-64 p-8">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search groups, expenses..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none text-sm bg-white"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Bell className="text-gray-400 cursor-pointer hover:text-gray-600" size={20} />
            <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer">
              {currentUser.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════ DASHBOARD ══ */}
        {page === "dashboard" && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Net Balance</p>
                <h2 className={`text-2xl font-bold ${totalOwed >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalOwed >= 0 ? "+" : ""}{formatVND(totalOwed)}
                </h2>
                <p className="text-xs text-gray-400 mt-1">{totalOwed >= 0 ? "You're owed money" : "You owe money"}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Groups</p>
                <h2 className="text-2xl font-bold text-gray-800">{groups.length}</h2>
                <p className="text-xs text-gray-400 mt-1">Active groups</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Spent</p>
                <h2 className="text-2xl font-bold text-indigo-600">{formatVND(totalSpent)}</h2>
                <p className="text-xs text-gray-400 mt-1">Across all groups</p>
              </div>
            </div>

            {/* Groups quick view */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Groups</h3>
                <button onClick={() => setPage("groups")} className="text-sm text-indigo-600 hover:underline">View all</button>
              </div>
              {dashboardFilteredGroups.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center text-gray-400 border border-dashed border-gray-200">
                  <p className="text-4xl mb-3">{search ? "🔍" : "👥"}</p>
                  <p className="mb-3">{search ? `No groups match "${search}"` : "No groups yet"}</p>
                  {!search && <button onClick={() => navigate("/create-group")} className="text-indigo-600 hover:underline text-sm">Create your first group</button>}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {dashboardFilteredGroups.slice(0,6).map((g: any) => {
                    const bal = getGroupBalance(g);
                    const spent = (g.expenses || []).reduce((s: number, e: any) => s + e.amount, 0);
                    const pct = g.budget > 0 ? Math.min((spent / g.budget) * 100, 100) : 0;
                    return (
                      <div key={g.id} onClick={() => navigate(`/group/${g.id}`)}
                        className={`bg-white p-5 rounded-2xl shadow-sm border hover:shadow-md transition cursor-pointer relative group
                          ${g.pinned ? "border-amber-300 ring-1 ring-amber-100" : "border-gray-100"}`}>
                        <button onClick={e => handleDeleteGroup(g.id, e)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-gray-300 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[g.category] || "from-gray-400 to-gray-500"} flex items-center justify-center text-xl`}>
                            {g.icon || "📦"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="font-semibold text-gray-800 text-sm">{g.name}</h4>
                              {g.pinned && <Pin size={11} className="text-amber-500" />}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_BG[g.category] || "bg-gray-100 text-gray-500"}`}>{g.category || "General"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{g.members?.length || 0} members</span>
                          <span className={bal < 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                            {bal > 0 ? "+" : ""}{formatVND(bal)}
                          </span>
                        </div>
                        {g.budget > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-400" : "bg-indigo-400"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
                {recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">{search ? `No activity matching "${search}"` : "No activity yet."}</div>
                ) : recentActivity.map((e: any) => (
                  <div key={e.id} onClick={() => navigate(`/group/${e.groupId}`)}
                    className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">{getExpenseIcon(e.category)}</div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{e.description}</p>
                        <p className="text-xs text-gray-400">{e.payer} · {e.groupName} · {e.date}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-700">{formatVND(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════ GROUPS PAGE ══ */}
        {page === "groups" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Groups</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeGroups.length} active · {archivedGroups.length} archived
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Archive toggle */}
                <button
                  onClick={() => setShowArchived(v => !v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition
                    ${showArchived ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {showArchived ? <><ArchiveRestore size={14} /> Show Active</> : <><Archive size={14} /> Archived ({archivedGroups.length})</>}
                </button>
                <button onClick={() => navigate("/create-group")} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                  <Plus size={15} /> New Group
                </button>
              </div>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {ALL_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition border
                    ${filterCat === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Pinned section label */}
            {!showArchived && sortedFiltered.some(g => g.pinned) && (
              <div className="flex items-center gap-2 mb-3">
                <Pin size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">Pinned</span>
              </div>
            )}

            {sortedFiltered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                <p className="text-4xl mb-3">{showArchived ? "🗄️" : "🔍"}</p>
                <p>{showArchived ? "No archived groups." : `No groups found${search ? ` for "${search}"` : ""}.`}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {sortedFiltered.map((g: any) => {
                  const bal   = getGroupBalance(g);
                  const spent = (g.expenses || []).reduce((s: number, e: any) => s + e.amount, 0);
                  const pct   = g.budget > 0 ? Math.min((spent / g.budget) * 100, 100) : 0;
                  return (
                    <div key={g.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition
                      ${g.pinned ? "border-amber-300 ring-1 ring-amber-200" : "border-gray-100"}
                      ${g.archived ? "opacity-75" : ""}`}>
                      {/* gradient top */}
                      <div className={`h-2 bg-gradient-to-r ${CATEGORY_COLORS[g.category] || "from-gray-300 to-gray-400"}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/group/${g.id}`)}>
                            <div className="text-2xl">{g.icon || "📦"}</div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-gray-800">{g.name}</h4>
                                {g.pinned && <Pin size={11} className="text-amber-500" />}
                                {g.archived && <Archive size={11} className="text-gray-400" />}
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_BG[g.category] || "bg-gray-100 text-gray-500"}`}>{g.category || "General"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {/* PIN button */}
                            {!g.archived && (
                              <button
                                onClick={e => handleTogglePin(g.id, e)}
                                title={g.pinned ? "Unpin" : "Pin to top"}
                                className={`p-1.5 rounded-lg transition
                                  ${g.pinned ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-300 hover:text-amber-500 hover:bg-amber-50"}`}>
                                {g.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                              </button>
                            )}
                            {/* ARCHIVE button */}
                            <button
                              onClick={e => handleToggleArchive(g.id, e)}
                              title={g.archived ? "Restore group" : "Archive group"}
                              className={`p-1.5 rounded-lg transition
                                ${g.archived ? "text-indigo-500 bg-indigo-50 hover:bg-indigo-100" : "text-gray-300 hover:text-amber-600 hover:bg-amber-50"}`}>
                              {g.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                            </button>
                            <button onClick={e => handleShare(g)} className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Share2 size={14} /></button>
                            <button onClick={e => handleDeleteGroup(g.id, e)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm mb-3">
                          <div className="flex -space-x-1">
                            {(g.members || []).slice(0,4).map((m: string, i: number) => (
                              <div key={i} className="w-6 h-6 rounded-full bg-indigo-400 text-white text-xs flex items-center justify-center font-bold border border-white">
                                {m.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {g.members?.length > 4 && <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center border border-white">+{g.members.length-4}</div>}
                          </div>
                          <span className={`font-bold text-sm ${bal < 0 ? "text-red-500" : bal > 0 ? "text-green-500" : "text-gray-400"}`}>
                            {bal > 0 ? "+" : ""}{formatVND(bal)}
                          </span>
                        </div>

                        <div className="text-xs text-gray-400 flex justify-between mb-2">
                          <span>Total: {formatVND(spent)}</span>
                          {g.budget > 0 && <span>Budget: {formatVND(g.budget)}</span>}
                        </div>

                        {g.budget > 0 && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${pct}%` }} />
                          </div>
                        )}

                        {/* Status badge */}
                        <div className="mt-3">
                          {bal < -1000 ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full">
                              <TrendingDown size={11} /> You owe {formatVND(Math.abs(bal))}
                            </span>
                          ) : bal > 1000 ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                              <TrendingUp size={11} /> You get {formatVND(bal)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full">✅ Settled</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════ ANALYTICS ══ */}
        {page === "analytics" && (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Analytics</h2>

            <div className="grid grid-cols-3 gap-5 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Spent</p>
                <h2 className="text-2xl font-bold text-indigo-600">{formatVND(totalSpent)}</h2>
                <p className="text-xs text-gray-400 mt-1">Across {groups.length} groups</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Avg per Group</p>
                <h2 className="text-2xl font-bold text-gray-800">{formatVND(groups.length ? totalSpent / groups.length : 0)}</h2>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Net Balance</p>
                <h2 className={`text-2xl font-bold ${totalOwed >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {totalOwed >= 0 ? "+" : ""}{formatVND(totalOwed)}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Monthly bar chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-5">Monthly Spending</h3>
                {monthlyData.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm">No data yet</div>
                ) : (
                  <div className="flex items-end gap-3 h-40">
                    {monthlyData.map(([month, val]) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-indigo-600">{formatVND(val).replace("₫","").trim()}</span>
                        <div className="w-full rounded-t-lg bg-indigo-500 transition-all" style={{ height: `${(val / maxMonthly) * 120}px` }} />
                        <span className="text-xs text-gray-400">{month}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-700 mb-5">Spending by Category</h3>
                {Object.keys(expensesByCategory).length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm">No data yet</div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(expensesByCategory)
                      .sort(([,a],[,b]) => b - a)
                      .map(([cat, val]) => {
                        const pct = totalSpent > 0 ? (val / totalSpent) * 100 : 0;
                        const icons: Record<string,string> = { food:"🍜", travel:"✈️", shopping:"🛍️", hotel:"🏨", drink:"🍹", transport:"🚗", gift:"🎁", other:"📦" };
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="flex items-center gap-1.5 text-gray-700 font-medium">
                                {icons[cat] || "📦"} {cat}
                              </span>
                              <span className="text-gray-500">{formatVND(val)} <span className="text-gray-300">({Math.round(pct)}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Group comparison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-5">Group Comparison</h3>
              {groups.length === 0 ? (
                <div className="text-center text-gray-400 py-6 text-sm">No groups yet</div>
              ) : (
                <div className="space-y-3">
                  {groups.map(g => {
                    const spent = (g.expenses || []).reduce((s: number, e: any) => s + e.amount, 0);
                    const pct   = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;
                    return (
                      <div key={g.id} className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition" onClick={() => navigate(`/group/${g.id}`)}>
                        <div className="text-xl w-8 text-center">{g.icon || "📦"}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{g.name}</span>
                            <span className="text-gray-500">{formatVND(spent)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[g.category] || "from-gray-400 to-gray-500"}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{Math.round(pct)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ── SHARE MODAL ── */}
      {shareGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            {/* preview header */}
            <div className={`bg-gradient-to-r ${CATEGORY_COLORS[shareGroup.category] || "from-gray-400 to-gray-500"} p-6`}>
              <div className="text-4xl mb-2">{shareGroup.icon || "📦"}</div>
              <h3 className="text-white font-bold text-lg">{shareGroup.name}</h3>
              <p className="text-white/70 text-sm">{shareGroup.category} · {shareGroup.members?.length || 0} members</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Spent</p>
                  <p className="font-bold text-gray-800 text-sm">{formatVND((shareGroup.expenses||[]).reduce((s:number,e:any)=>s+e.amount,0))}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Expenses</p>
                  <p className="font-bold text-gray-800 text-sm">{shareGroup.expenses?.length || 0} items</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCopyLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition
                    ${copied ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Link</>}
                </button>
                <button onClick={() => setShareGroup(null)} className="flex-1 border py-2.5 rounded-xl text-sm hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
