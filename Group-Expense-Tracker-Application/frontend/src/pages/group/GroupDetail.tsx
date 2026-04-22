import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft, Trash2, UserPlus, Users, Pencil, X,
  MoreHorizontal, MoreVertical, Send, MessageCircle, TrendingUp,
  ArrowRight, History, Plus, AlertTriangle, CheckCircle, Edit3, Archive, ArchiveRestore
} from "lucide-react";
import { formatVND } from "../../utils/formatCurrency";
import { buildShareSummary, calculateGroupBalances, getDebtStatusMeta, getGroupBalanceForUser } from "../../utils/groupFinancials";
import { getCurrentUser } from "../../utils/currentUser";
import QuickNavDrawer from "../../components/layout/QuickNavDrawer";
import { buildBalanceChangedMessage, pushNotification } from "../../utils/notifications";

// ── Debt simplification ───────────────────────────────────────
function simplifyDebts(balances: Record<string, number>) {
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];
  Object.entries(balances).forEach(([name, bal]) => {
    if (bal > 0.5) creditors.push({ name, amount: bal });
    if (bal < -0.5) debtors.push({ name, amount: -bal });
  });
  const txns: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    txns.push({ from: debtors[i].name, to: creditors[j].name, amount: Math.round(pay) });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (debtors[i].amount < 0.5) i++;
    if (creditors[j].amount < 0.5) j++;
  }
  return txns;
}

// ── Types ─────────────────────────────────────────────────────
type HistoryEntry = {
  id: number;
  type: "expense_added" | "expense_edited" | "expense_deleted" | "adjustment" | "budget_exceeded" | "budget_ok";
  label: string;
  amount?: number;
  oldAmount?: number;
  total: number;      // total spent at this moment
  budget: number;
  ts: string;         // formatted timestamp
};

const MEMBER_COLORS = ["bg-violet-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-pink-500", "bg-teal-500", "bg-orange-500"];
const ICONS_MAP: Record<string, string> = { food: "🍜", travel: "✈️", shopping: "🛍️", hotel: "🏨", drink: "🍹", transport: "🚗", gift: "🎁" };

// ── Helpers ───────────────────────────────────────────────────
const now = () => new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"expenses" | "balance" | "chat" | "history">("expenses");
  const currentUser = getCurrentUser() || "You";

  // 3-dot menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Members
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [memberError, setMemberError] = useState("");
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [editingMemberIdx, setEditingMemberIdx] = useState<number | null>(null);
  const [editingMemberName, setEditingMemberName] = useState("");
  const [editMemberError, setEditMemberError] = useState("");

  // Edit expense
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editRawAmount, setEditRawAmount] = useState(0);
  const [editPayer, setEditPayer] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDate, setEditDate] = useState("");

  // Chat
  const [chatMsg, setChatMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Load ─────────────────────────────────────────────────────
  useEffect(() => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const found = groups.find((g: any) => String(g.id) === String(id));
    if (found) setGroup({
      ...found,
      members: found.members || [],
      expenses: found.expenses || [],
      messages: found.messages || [],
      history: found.history || [],
      budget: found.budget || 0,
      adjustment: found.adjustment || 0,   // manual ± added to total
    });
  }, [id]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [group?.messages, activeTab]);

  if (!group) return <div className="p-6 text-gray-400">Loading...</div>;

  // ── Derived ───────────────────────────────────────────────────
  const expenses = group.expenses || [];
  const history: HistoryEntry[] = group.history || [];
  const budget = group.budget || 0;
  const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const budgetPct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;
  const overBudget = budget > 0 && total > budget;

  const balances = calculateGroupBalances(group);
  const youOwe = balances[currentUser] || 0;
  const currentUserStatus = getDebtStatusMeta(youOwe);
  const transactions = simplifyDebts(balances);

  const getIcon = (c: string) => ICONS_MAP[c] || "📦";
  const memberColor = (name: string) => MEMBER_COLORS[group.members.indexOf(name) % MEMBER_COLORS.length] || "bg-indigo-500";

  // ── Save helper ───────────────────────────────────────────────
  const saveGroups = (updated: any[]) => {
    localStorage.setItem("groups", JSON.stringify(updated));
    setGroup(updated.find((g: any) => String(g.id) === String(id)));
  };

  const notifyBudgetTransitions = (previousGroup: any, nextGroup: any) => {
    const previousSummary = previousGroup ? buildShareSummary(previousGroup, currentUser) : null;
    const nextSummary = nextGroup ? buildShareSummary(nextGroup, currentUser) : null;

    if (!nextSummary || nextSummary.budget <= 0) return;

    const crossedWarning = (previousSummary?.budgetUsedPct || 0) < 80 && nextSummary.budgetUsedPct >= 80 && !nextSummary.isOverBudget;
    const crossedExceeded = !(previousSummary?.isOverBudget) && nextSummary.isOverBudget;

    if (crossedWarning) {
      pushNotification(currentUser, {
        type: "budget_warning",
        title: `Group ${nextGroup.name} sắp chạm ngân sách`,
        message: `${Math.round(nextSummary.budgetUsedPct)}% ngân sách đã được sử dụng.`,
        groupId: nextGroup.id,
        groupName: nextGroup.name,
        priority: "medium",
        actionLabel: "Xem budget",
        actionRoute: `/group/${id}`,
      });
    }

    if (crossedExceeded) {
      pushNotification(currentUser, {
        type: "budget_exceeded",
        title: `Group ${nextGroup.name} đã vượt ngân sách`,
        message: `Đã vượt ${Math.abs(nextSummary.budgetRemaining).toLocaleString("vi-VN")} đ so với ngân sách đã đặt.`,
        groupId: nextGroup.id,
        groupName: nextGroup.name,
        priority: "high",
        actionLabel: "Xem budget",
        actionRoute: `/group/${id}`,
      });
    }
  };

  const updateGroup = (patch: Partial<any>, newEntry?: HistoryEntry) => {
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    saveGroups(groups.map((g: any) => {
      if (String(g.id) !== String(id)) return g;
      const newHistory = newEntry ? [...(g.history || []), newEntry] : (g.history || []);
      return { ...g, ...patch, history: newHistory };
    }));
  };

  // ── Add expense (hook into history) ──────────────────────────
  // We intercept delete & edit to log history

  const handleDelete = (expenseId: number) => {
    if (!confirm("Delete this expense?")) return;
    const exp = expenses.find((e: any) => e.id === expenseId);
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const previousGroup = groups.find((g: any) => String(g.id) === String(id));
    const newExpenses = (group.expenses || []).filter((e: any) => e.id !== expenseId);
    const newTotal = newExpenses.reduce((s: number, e: any) => s + e.amount, 0);
    const wasOver = budget > 0 && total > budget;
    const nowOver = budget > 0 && newTotal > budget;

    const entry: HistoryEntry = {
      id: Date.now(), type: "expense_deleted",
      label: `🗑️ Deleted "${exp?.description || "expense"}"`,
      amount: exp?.amount, total: newTotal, budget, ts: now(),
    };
    const extra: HistoryEntry[] = [];
    if (wasOver && !nowOver) extra.push({ id: Date.now() + 1, type: "budget_ok", label: "✅ Back within budget", total: newTotal, budget, ts: now() });

    const updatedGroups = groups.map((g: any) => String(g.id) !== String(id) ? g : {
      ...g, expenses: newExpenses, history: [...(g.history || []), entry, ...extra],
    });

    saveGroups(updatedGroups);

    const updatedGroup = updatedGroups.find((g: any) => String(g.id) === String(id));
    const previousBalance = previousGroup ? getGroupBalanceForUser(previousGroup, currentUser) : 0;
    const nextBalance = updatedGroup ? getGroupBalanceForUser(updatedGroup, currentUser) : 0;

    pushNotification(currentUser, {
      type: "expense_deleted",
      title: `Đã xóa chi tiêu trong ${updatedGroup?.name || "group"}`,
      message: `"${exp?.description || "expense"}" đã bị xóa khỏi group.`,
      groupId: updatedGroup?.id,
      groupName: updatedGroup?.name,
      amount: exp?.amount,
      priority: "medium",
      actionLabel: "Xem group",
      actionRoute: `/group/${id}`,
    });

    if (Math.round(previousBalance) !== Math.round(nextBalance)) {
      pushNotification(currentUser, {
        type: "balance_changed",
        title: "Trạng thái nợ của bạn thay đổi",
        message: buildBalanceChangedMessage(nextBalance),
        groupId: updatedGroup?.id,
        groupName: updatedGroup?.name,
        amount: Math.abs(nextBalance),
        priority: "high",
        actionLabel: "Xem balance",
        actionRoute: `/group/${id}`,
      });
    }

    notifyBudgetTransitions(previousGroup, updatedGroup);
  };

  // ── Edit expense ──────────────────────────────────────────────
  const openEdit = (e: any) => {
    setEditingExpense(e);
    setEditDesc(e.description);
    setEditRawAmount(e.amount);
    setEditAmount(e.amount.toLocaleString("vi-VN"));
    setEditPayer(e.payer);
    setEditCategory(e.category);
    try {
      const parts = e.date.split("/");
      if (parts.length === 3) setEditDate(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`);
      else setEditDate(new Date(e.date).toISOString().split("T")[0]);
    } catch { setEditDate(""); }
  };

  const handleEditAmountInput = (val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) { setEditAmount(""); setEditRawAmount(0); return; }
    setEditRawAmount(Number(num));
    setEditAmount(Number(num).toLocaleString("vi-VN"));
  };

  const handleSaveEdit = () => {
    if (!editDesc.trim() || !editRawAmount) { alert("Please fill all fields"); return; }
    const oldAmount = editingExpense.amount;
    const newExpenses = (group.expenses || []).map((exp: any) =>
      exp.id === editingExpense.id
        ? { ...exp, description: editDesc, amount: editRawAmount, payer: editPayer, category: editCategory, date: new Date(editDate).toLocaleDateString("vi-VN") }
        : exp
    );
    const newTotal = newExpenses.reduce((s: number, e: any) => s + e.amount, 0);
    const wasOver = budget > 0 && total > budget;
    const nowOver = budget > 0 && newTotal > budget;

    const entry: HistoryEntry = {
      id: Date.now(), type: "expense_edited",
      label: `✏️ Edited "${editDesc}"`,
      amount: editRawAmount, oldAmount, total: newTotal, budget, ts: now(),
    };
    const extra: HistoryEntry[] = [];
    if (!wasOver && nowOver) extra.push({ id: Date.now() + 1, type: "budget_exceeded", label: "⚠️ Budget exceeded!", total: newTotal, budget, ts: now() });
    if (wasOver && !nowOver) extra.push({ id: Date.now() + 1, type: "budget_ok", label: "✅ Back within budget", total: newTotal, budget, ts: now() });

    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    const previousGroup = groups.find((g: any) => String(g.id) === String(id));
    const updatedGroups = groups.map((g: any) => String(g.id) !== String(id) ? g : {
      ...g, expenses: newExpenses, history: [...(g.history || []), entry, ...extra],
    });
    saveGroups(updatedGroups);
    const updatedGroup = updatedGroups.find((g: any) => String(g.id) === String(id));
    const previousBalance = previousGroup ? getGroupBalanceForUser(previousGroup, currentUser) : 0;
    const nextBalance = updatedGroup ? getGroupBalanceForUser(updatedGroup, currentUser) : 0;

    pushNotification(currentUser, {
      type: "expense_updated",
      title: `Chi tiêu đã được cập nhật trong ${updatedGroup?.name || "group"}`,
      message: `"${editDesc}" đã được chỉnh sửa thành ${formatVND(editRawAmount)}.`,
      groupId: updatedGroup?.id,
      groupName: updatedGroup?.name,
      amount: editRawAmount,
      priority: "medium",
      actionLabel: "Xem group",
      actionRoute: `/group/${id}`,
    });

    if (Math.round(previousBalance) !== Math.round(nextBalance)) {
      pushNotification(currentUser, {
        type: "balance_changed",
        title: "Trạng thái nợ của bạn thay đổi",
        message: buildBalanceChangedMessage(nextBalance),
        groupId: updatedGroup?.id,
        groupName: updatedGroup?.name,
        amount: Math.abs(nextBalance),
        priority: "high",
        actionLabel: "Xem balance",
        actionRoute: `/group/${id}`,
      });
    }

    notifyBudgetTransitions(previousGroup, updatedGroup);
    setEditingExpense(null);
  };

  // ── Members ───────────────────────────────────────────────────
  const handleAddMember = () => {
    const name = newMemberName.trim();
    if (!name) { setMemberError("Please enter a name."); return; }
    if (group.members.includes(name)) { setMemberError("Already exists."); return; }
    updateGroup({ members: [...group.members, name] });
    pushNotification(currentUser, {
      type: "member_joined",
      title: `Thành viên mới trong ${group.name}`,
      message: `${name} đã được thêm vào group.`,
      groupId: group.id,
      groupName: group.name,
      actor: name,
      priority: "low",
      actionLabel: "Xem group",
      actionRoute: `/group/${id}`,
    });
    setNewMemberName(""); setMemberError(""); setShowAddMember(false);
  };

  const handleSaveEditMember = () => {
    const name = editingMemberName.trim();
    if (!name) { setEditMemberError("Cannot be empty."); return; }
    if (group.members.some((m: string, i: number) => m === name && i !== editingMemberIdx)) { setEditMemberError("Already exists."); return; }
    const oldName = group.members[editingMemberIdx!];
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    saveGroups(groups.map((g: any) => String(g.id) !== String(id) ? g : {
      ...g,
      members: g.members.map((m: string, i: number) => i === editingMemberIdx ? name : m),
      expenses: g.expenses.map((exp: any) => exp.payer === oldName ? { ...exp, payer: name } : exp),
    }));
    setEditingMemberIdx(null); setEditingMemberName(""); setEditMemberError("");
  };

  const handleDeleteMember = (index: number) => {
    if (!confirm(`Remove "${group.members[index]}"?`)) return;
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    saveGroups(groups.map((g: any) => String(g.id) !== String(id) ? g : {
      ...g, members: g.members.filter((_: string, i: number) => i !== index),
    }));
    if (editingMemberIdx === index) setEditingMemberIdx(null);
  };

  // ── Chat ─────────────────────────────────────────────────────
  const handleSendMsg = () => {
    if (!chatMsg.trim()) return;
    const newMsg = { id: Date.now(), sender: currentUser, text: chatMsg.trim(), time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
    const groups = JSON.parse(localStorage.getItem("groups") || "[]");
    saveGroups(groups.map((g: any) => String(g.id) !== String(id) ? g : { ...g, messages: [...(g.messages || []), newMsg] }));
    pushNotification(currentUser, {
      type: "chat_message",
      title: `Tin nhắn mới trong ${group.name}`,
      message: `${currentUser}: ${chatMsg.trim()}`,
      groupId: group.id,
      groupName: group.name,
      actor: currentUser,
      priority: "low",
      actionLabel: "Mở chat",
      actionRoute: `/group/${id}`,
    });
    setChatMsg("");
  };

  const CATEGORIES_EDIT = [
    { key: "food", icon: "🍜" }, { key: "drink", icon: "🍹" }, { key: "travel", icon: "✈️" }, { key: "shopping", icon: "🛍️" },
    { key: "hotel", icon: "🏨" }, { key: "transport", icon: "🚗" }, { key: "gift", icon: "🎁" }, { key: "other", icon: "📦" },
  ];

  const historyTypeStyle = (type: string) => {
    switch (type) {
      case "expense_added": return "bg-blue-50 border-blue-200 text-blue-700";
      case "expense_edited": return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "expense_deleted": return "bg-red-50 border-red-200 text-red-600";
      case "adjustment": return "bg-indigo-50 border-indigo-200 text-indigo-700";
      case "budget_exceeded": return "bg-red-100 border-red-300 text-red-700";
      case "budget_ok": return "bg-green-50 border-green-200 text-green-700";
      default: return "bg-gray-50 border-gray-200 text-gray-600";
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <QuickNavDrawer currentGroupId={id} />

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-10">
        <div onClick={() => navigate(-1)} className="ml-16 flex items-center gap-2 cursor-pointer text-indigo-600">
          <ArrowLeft size={20} /> Back
        </div>
        <div ref={menuRef} className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-48 overflow-hidden">
              <button onClick={() => { setShowManageMembers(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                <Users size={15} /> View / Edit Members
              </button>
              <div className="border-t border-gray-100" />
              <button onClick={() => { setShowAddMember(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-indigo-600 hover:bg-indigo-50">
                <UserPlus size={15} /> Add Member
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">

          {/* TOTAL SPENT */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative group/card">
            <div className="flex items-start justify-between">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Spent</p>
            </div>
            <h2 className="text-2xl font-bold text-indigo-600">{formatVND(total)}</h2>
            <p className="text-xs text-gray-400 mt-1">{expenses.length} expense{expenses.length !== 1 ? "s" : ""}</p>
          </div>

          {/* YOU OWE */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Trạng thái của bạn</p>
            <h2 className={`text-2xl font-bold ${currentUserStatus.accentTextClass}`}>
              {currentUserStatus.key === "gets_back" ? "+" : currentUserStatus.key === "settled" ? "" : "-"}
              {currentUserStatus.key === "settled" ? formatVND(0) : currentUserStatus.formattedAmount}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {currentUserStatus.key === "gets_back" ? "Bạn đang được nhận tiền từ nhóm" : currentUserStatus.key === "owes" ? "Bạn đang cần thanh toán cho nhóm" : "Đã cân bằng trong nhóm này"}
            </p>
          </div>

          {/* MEMBERS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Members</p>
            <h2 className="text-2xl font-bold">{group.members.length}</h2>
            <div className="flex -space-x-1 mt-2">
              {group.members.slice(0, 5).map((m: string, i: number) => (
                <div key={i} className={`w-6 h-6 rounded-full ${memberColor(m)} text-white text-xs flex items-center justify-center font-bold border border-white`}>
                  {m.charAt(0).toUpperCase()}
                </div>
              ))}
              {group.members.length > 5 && <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center border border-white">+{group.members.length - 5}</div>}
            </div>
          </div>

          {/* BUDGET */}
          <div className={`p-5 rounded-2xl shadow-sm border ${overBudget ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Budget</p>
            {budget > 0 ? (
              <>
                <h2 className="text-lg font-bold text-gray-700">{formatVND(budget)}</h2>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{Math.round(budgetPct)}% used</span>
                    <span>{overBudget ? <span className="text-red-500 font-medium">Over!</span> : formatVND(budget - total) + " left"}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${budgetPct >= 100 ? "bg-red-500" : budgetPct >= 80 ? "bg-yellow-400" : "bg-green-500"}`}
                      style={{ width: `${budgetPct}%` }} />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 mt-1">No budget set</p>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
          {(["expenses", "balance", "chat", "history"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize flex items-center gap-1.5
                ${activeTab === tab ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
              {tab === "chat" && <MessageCircle size={13} />}
              {tab === "balance" && <TrendingUp size={13} />}
              {tab === "history" && <History size={13} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "history" && history.length > 0 && (
                <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">{history.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB: EXPENSES ══ */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
                <p className="text-4xl mb-3">🧾</p><p>No expenses yet.</p>
                <button onClick={() => navigate(`/group/${id}/add-expense`)} className="mt-3 text-indigo-600 text-sm hover:underline">Add first expense</button>
              </div>
            ) : expenses.map((e: any) => (
              <div key={e.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                <div onClick={() => openEdit(e)} className="flex items-center gap-4 cursor-pointer flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">{getIcon(e.category)}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{e.description}</p>
                    <p className="text-sm text-gray-400">{e.payer} • {e.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{formatVND(e.amount)}</p>
                    {group.members.length > 0 && <p className="text-xs text-gray-400">{formatVND(e.amount / group.members.length)}/person</p>}
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TAB: BALANCE ══ */}
        {activeTab === "balance" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Individual Balances</h3>
              <div className="space-y-3">
                {Object.entries(balances).map(([name, val]: any) => {
                  const pct = total > 0 ? Math.abs(val) / total * 100 : 0;
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full ${memberColor(name)} text-white text-xs flex items-center justify-center font-bold`}>{name.charAt(0).toUpperCase()}</div>
                          <span className="text-sm font-medium">{name}</span>
                          {name === currentUser && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">You</span>}
                        </div>
                        <span className={`text-sm font-bold ${val < 0 ? "text-red-500" : val > 0 ? "text-green-500" : "text-gray-400"}`}>
                          {val > 0 ? "+" : ""}{formatVND(val)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${val < 0 ? "bg-red-400" : "bg-green-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Gets money back</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Owes money</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-1">Settlement Plan</h3>
              <p className="text-xs text-gray-400 mb-4">Minimum transactions to settle all debts</p>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400"><p className="text-3xl mb-2">✅</p><p className="text-sm">All settled up!</p></div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`w-8 h-8 rounded-full ${memberColor(t.from)} text-white text-xs flex items-center justify-center font-bold`}>{t.from.charAt(0).toUpperCase()}</div>
                        <div><p className="text-xs font-semibold text-gray-700">{t.from}</p><p className="text-xs text-red-500">pays</p></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-indigo-600">{formatVND(t.amount)}</span>
                        <ArrowRight size={16} className="text-indigo-400" />
                      </div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="text-right"><p className="text-xs font-semibold text-gray-700">{t.to}</p><p className="text-xs text-green-500">receives</p></div>
                        <div className={`w-8 h-8 rounded-full ${memberColor(t.to)} text-white text-xs flex items-center justify-center font-bold`}>{t.to.charAt(0).toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: CHAT ══ */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ height: "520px" }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <MessageCircle size={18} className="text-indigo-500" />
              <div><p className="font-semibold text-sm text-gray-800">{group.name} · Chat</p><p className="text-xs text-gray-400">{group.members.length} members</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {!(group.messages || []).length ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={32} className="mb-3 opacity-30" /><p className="text-sm">No messages yet.</p>
                </div>
              ) : (group.messages || []).map((msg: any) => {
                const isMe = msg.sender === currentUser;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full ${memberColor(msg.sender)} text-white text-xs flex items-center justify-center font-bold flex-shrink-0`}>{msg.sender.charAt(0).toUpperCase()}</div>
                    <div className={`max-w-xs flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender}</p>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-gray-100 text-gray-800 rounded-tl-sm"}`}>{msg.text}</div>
                      <p className="text-xs text-gray-300 mt-1">{msg.time}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMsg()}
                placeholder="Type a message..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={handleSendMsg} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl transition"><Send size={16} /></button>
            </div>
          </div>
        )}

        {/* ══ TAB: HISTORY ══ */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-700">Spending History</h3>
                <p className="text-xs text-gray-400 mt-0.5">All changes to total spent, budget alerts</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <History size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No history yet.</p>
                <p className="text-xs mt-1">Changes to expenses and manual adjustments will appear here.</p>
              </div>
            ) : (
              <div className="relative">
                {/* vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                <div className="space-y-4">
                  {[...history].reverse().map((h: HistoryEntry) => (
                    <div key={h.id} className="flex gap-4 items-start">
                      {/* dot */}
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 bg-white
                        ${h.type === "budget_exceeded" ? "border-red-400" : h.type === "budget_ok" ? "border-green-400" : "border-indigo-300"}`}>
                        {h.type === "budget_exceeded" && <AlertTriangle size={13} className="text-red-500" />}
                        {h.type === "budget_ok" && <CheckCircle size={13} className="text-green-500" />}
                        {h.type === "adjustment" && <Plus size={13} className="text-indigo-500" />}
                        {h.type === "expense_edited" && <Pencil size={13} className="text-yellow-500" />}
                        {h.type === "expense_deleted" && <Trash2 size={13} className="text-red-400" />}
                        {h.type === "expense_added" && <Plus size={13} className="text-blue-500" />}
                      </div>

                      <div className={`flex-1 p-3 rounded-xl border text-sm ${historyTypeStyle(h.type)}`}>
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{h.label}</p>
                          <span className="text-xs opacity-60 ml-3 whitespace-nowrap">{h.ts}</span>
                        </div>
                        <div className="flex gap-4 mt-1 text-xs opacity-70">
                          <span>Total after: <strong>{formatVND(h.total)}</strong></span>
                          {h.oldAmount !== undefined && (
                            <span>{formatVND(h.oldAmount)} → {formatVND(h.amount!)}</span>
                          )}
                          {h.budget > 0 && (
                            <span>Budget: {formatVND(h.budget)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ADD EXPENSE FAB */}
      <button onClick={() => navigate(`/group/${id}/add-expense`)} className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition">
        + Add Expense
      </button>

      {/* ══ ADD MEMBER MODAL ══ */}
      {
        showAddMember && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
              <h2 className="font-semibold text-lg mb-1">Add Member</h2>
              <p className="text-gray-400 text-sm mb-4">Add to <span className="font-medium text-indigo-600">{group.name}</span></p>
              <input value={newMemberName} onChange={e => { setNewMemberName(e.target.value); setMemberError(""); }}
                onKeyDown={e => e.key === "Enter" && handleAddMember()} placeholder="Enter member name..." autoFocus
                className="w-full border p-3 rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              {memberError && <p className="text-red-500 text-sm mb-3">{memberError}</p>}
              <div className="flex gap-3 mt-2">
                <button onClick={() => { setShowAddMember(false); setNewMemberName(""); setMemberError(""); }} className="flex-1 border py-2 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddMember} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700">Add</button>
              </div>
            </div>
          </div>
        )
      }

      {/* ══ MANAGE MEMBERS MODAL ══ */}
      {
        showManageMembers && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Members ({group.members.length})</h2>
                <button onClick={() => { setShowManageMembers(false); setEditingMemberIdx(null); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
                {group.members.map((m: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    {editingMemberIdx === i ? (
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex gap-2">
                          <input value={editingMemberName} onChange={e => { setEditingMemberName(e.target.value); setEditMemberError(""); }}
                            onKeyDown={e => e.key === "Enter" && handleSaveEditMember()}
                            className="flex-1 border p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" autoFocus />
                          <button onClick={handleSaveEditMember} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm">Save</button>
                          <button onClick={() => { setEditingMemberIdx(null); setEditMemberError(""); }} className="border px-3 py-1 rounded-lg text-sm">✕</button>
                        </div>
                        {editMemberError && <p className="text-red-500 text-xs">{editMemberError}</p>}
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${memberColor(m)} text-white text-sm font-bold flex items-center justify-center`}>{m.charAt(0).toUpperCase()}</div>
                          <span className="text-sm font-medium">{m}</span>
                          {m === currentUser && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">You</span>}
                        </div>
                        <button onClick={() => { setEditingMemberIdx(i); setEditingMemberName(m); setEditMemberError(""); }} className="text-gray-400 hover:text-indigo-600 p-1"><Pencil size={15} /></button>
                        <button onClick={() => handleDeleteMember(i)} className="text-gray-400 hover:text-red-500 p-1" disabled={group.members.length <= 1}><Trash2 size={15} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowManageMembers(false); setShowAddMember(true); }}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-600 py-2 rounded-xl hover:bg-indigo-50 text-sm">
                <UserPlus size={15} /> Add New Member
              </button>
            </div>
          </div>
        )
      }

      {/* ══ EDIT EXPENSE MODAL ══ */}
      {
        editingExpense && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Edit Expense</h2>
                <button onClick={() => setEditingExpense(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="What was it for?" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
                    <input value={editAmount} onChange={e => handleEditAmountInput(e.target.value)}
                      className="w-full pl-7 border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date</label>
                  <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Category</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES_EDIT.map(c => (
                      <button key={c.key} onClick={() => setEditCategory(c.key)}
                        className={`text-xl p-2.5 rounded-xl border transition ${editCategory === c.key ? "bg-indigo-100 border-indigo-400" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                        {c.icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Paid by</label>
                  <select value={editPayer} onChange={e => setEditPayer(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    {group.members.map((m: string, i: number) => <option key={i}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditingExpense(null)} className="flex-1 border py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveEdit} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700">Save Changes</button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
