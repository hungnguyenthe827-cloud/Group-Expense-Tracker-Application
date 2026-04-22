import { useNavigate } from "react-router-dom";
import { Search, Bell, Plus, LogOut, Users, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { formatVND } from "../../utils/formatCurrency";

export default function Dashboard() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<any[]>([]);

  // 🔥 LOAD GROUPS (fix stale state)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("groups") || "[]");
    setGroups(data);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleDeleteGroup = (id: number) => {
    const confirmDelete = window.confirm("Delete this group?");
    if (!confirmDelete) return;

    const updated = groups.filter((g: any) => g.id !== id);
    setGroups(updated);
    localStorage.setItem("groups", JSON.stringify(updated));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-blue-600 mb-10">
          PAYSHARE
        </h2>

        <nav className="flex flex-col gap-5 text-gray-600 text-sm">
          <div className="font-semibold text-blue-600">🏠 Dashboard</div>

          <div
            onClick={() => navigate("/groups")}
            className="cursor-pointer hover:text-blue-500"
          >
            👥 Groups
          </div>

          <div className="cursor-pointer hover:text-blue-500">
            📊 Analytics
          </div>

          <div className="cursor-pointer hover:text-blue-500">
            📜 History
          </div>

          <div className="cursor-pointer hover:text-blue-500">
            💰 Settlements
          </div>
        </nav>

        <button
          onClick={() => navigate("/create-group")}
          className="mt-8 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          New Group
        </button>

        <div className="mt-auto pt-6 border-t space-y-3">
          <div className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-blue-600">
            <Users size={18} />
            Help
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 cursor-pointer hover:text-red-600"
          >
            <LogOut size={18} />
            Logout
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute top-3 left-3 text-gray-400" />
            <input
              placeholder="Search groups, expenses..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <Bell className="text-gray-500 cursor-pointer" />
            <img
              src="https://i.pravatar.cc/40"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">Total Balance</p>
            <h2 className="text-2xl font-bold text-green-500 mt-2">
              +{formatVND(150000)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">You Get</p>
            <h2 className="text-2xl font-bold text-green-500 mt-2">
              {formatVND(200000)}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-400 text-sm">You Owe</p>
            <h2 className="text-2xl font-bold text-red-500 mt-2">
              {formatVND(50000)}
            </h2>
          </div>
        </div>

        {/* GROUPS */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Groups</h3>

            <button
              onClick={() => navigate("/create-group")}
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Plus size={16} />
              Create Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-400">
              <p>No groups yet</p>
              <button
                onClick={() => navigate("/create-group")}
                className="mt-4 text-blue-600 hover:underline"
              >
                Create your first group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

              {groups.map((g: any) => (
                <div
                  key={g.id}
                  onClick={() => navigate(`/group/${g.id}`)}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition relative group cursor-pointer"
                >

                  {/* DELETE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(g.id);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* 🔥 ICON + NAME */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">
                      {g.icon || "📦"}
                    </div>

                    <h4 className="font-semibold text-lg">
                      {g.name}
                    </h4>
                  </div>

                  {/* CATEGORY */}
                  <p className="text-xs text-gray-400">
                    {g.category || "General"}
                  </p>

                  {/* MEMBERS */}
                  <p className="text-sm text-gray-400 mt-1">
                    {g.members?.length || 0} members
                  </p>

                </div>
              ))}

            </div>
          )}
        </div>

        {/* ACTIVITY */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Recent Activity
          </h3>

          <div className="bg-white p-5 rounded-2xl shadow space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Dinner</p>
                <p className="text-xs text-gray-400">
                  Paid by You • Group
                </p>
              </div>
              <span>{formatVND(120000)}</span>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="font-medium">Taxi</p>
                <p className="text-xs text-gray-400">
                  Paid by Alex
                </p>
              </div>
              <span>{formatVND(80000)}</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}