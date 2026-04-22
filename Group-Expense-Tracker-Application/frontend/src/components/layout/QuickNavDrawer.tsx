import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Plus, ReceiptText } from "lucide-react";
import { logoutSession } from "../../utils/authSession";

type QuickNavDrawerProps = {
  currentGroupId?: string;
};

export default function QuickNavDrawer({ currentGroupId }: QuickNavDrawerProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logoutSession();
    navigate("/");
  };

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-lg transition hover:border-indigo-200 hover:bg-indigo-50"
        aria-label={open ? "Hide quick navigation" : "Show quick navigation"}
      >
        {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {open && (
        <>
          <button
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/20"
            aria-label="Close quick navigation"
          />
          <aside className="fixed left-4 top-20 z-40 w-72 rounded-[28px] border border-gray-100 bg-white/95 p-5 shadow-2xl backdrop-blur">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">Quick Menu</p>
              <h2 className="mt-2 text-2xl font-bold text-indigo-600">PayShare</h2>
              <p className="mt-1 text-sm text-gray-400">Open this menu to jump back to the dashboard or move between key screens quickly.</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex w-full items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 text-left text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <Home size={18} />
                Go to Home
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              {currentGroupId && (
                <button
                  onClick={() => navigate(`/group/${currentGroupId}`)}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
                >
                  <ReceiptText size={18} />
                  Current Group
                </button>
              )}

              <button
                onClick={() => navigate("/create-group")}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800"
              >
                <Plus size={18} />
                Create New Group
              </button>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
