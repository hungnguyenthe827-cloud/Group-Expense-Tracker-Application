import { Search, Bell, Plus, LogOut, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatVND } from "../../utils/formatCurrency";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">

        <h2 className="text-xl font-bold text-indigo-600 mb-8">
          PAYSHARE
        </h2>

        <nav className="flex flex-col gap-4 text-gray-600">
          <div className="text-indigo-600 font-semibold">🏠 Dashboard</div>

          <div
            onClick={() => navigate("/groups")}
            className="hover:text-indigo-500 cursor-pointer"
          >
            👥 Groups
          </div>

          <div className="hover:text-indigo-500 cursor-pointer">
            📊 Analytics
          </div>

          <div className="hover:text-indigo-500 cursor-pointer">
            📜 History
          </div>

          <div className="hover:text-indigo-500 cursor-pointer">
            💶 Settlements
          </div>
        </nav>

        {/* CREATE GROUP BUTTON */}
        <button
          onClick={() => navigate("/create-group")}
          className="mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Create New Group
        </button>

        {/* FOOTER */}
        <div className="mt-auto flex flex-col gap-3 pt-6 border-t">

          <div className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 cursor-pointer">
            <HelpCircle size={18} />
            Help
          </div>

          <div
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <div className="relative w-1/3">
            <Search className="absolute top-3 left-3 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Search expenses, groups..."
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

        {/* TITLE */}
        <h1 className="text-2xl font-bold mb-6">
          Financial Summary
        </h1>

        {/* BALANCE */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <p className="text-gray-400">Overall Balance</p>

          <h2 className="text-3xl font-bold text-green-500 mt-2">
            +{formatVND(150000)}
          </h2>

          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-green-500">
              Bạn được nhận {formatVND(200000)}
            </span>
            <span className="text-red-500">
              Bạn nợ {formatVND(50000)}
            </span>
          </div>
        </div>

        {/* GROUP HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Active Groups</h3>

          <button
            onClick={() => navigate("/create-group")}
            className="flex items-center gap-2 text-indigo-600 hover:underline"
          >
            <Plus size={16} />
            New Group
          </button>
        </div>

        {/* GROUPS */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <h4 className="font-medium">🏠 Roommates</h4>
            <p className="text-red-500 mt-1">
              -{formatVND(45200)}
            </p>
            <p className="text-xs text-gray-400 mt-2">3 members</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h4 className="font-medium">✈️ Europe Trip</h4>
            <p className="text-green-500 mt-1">
              +{formatVND(212500)}
            </p>
            <p className="text-xs text-gray-400 mt-2">5 members</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h4 className="font-medium">🍽 Dinner</h4>
            <p className="text-gray-400 mt-1">Settled</p>
            <p className="text-xs text-gray-400 mt-2">4 members</p>
          </div>

        </div>

        {/* ACTIVITY */}
        <div>
          <h3 className="font-semibold mb-4">Recent Activity</h3>

          <div className="bg-white p-4 rounded-xl shadow space-y-4">

            <div className="flex justify-between">
              <div>
                <p className="font-medium">Lunch at The Bistro</p>
                <p className="text-xs text-gray-400">
                  Paid by You • 2 people
                </p>
              </div>
              <span>{formatVND(12400)}</span>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="font-medium">Electricity Bill</p>
                <p className="text-xs text-gray-400">
                  Paid by Alex • Group
                </p>
              </div>
              <span>{formatVND(85000)}</span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}