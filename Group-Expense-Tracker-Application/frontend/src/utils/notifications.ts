import { formatVND } from "./formatCurrency";

export type NotificationType =
  | "expense_added"
  | "expense_updated"
  | "expense_deleted"
  | "balance_changed"
  | "settlement_suggested"
  | "budget_warning"
  | "budget_exceeded"
  | "member_joined"
  | "group_invite"
  | "chat_message";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  groupId?: number;
  groupName?: string;
  actor?: string;
  amount?: number;
  createdAt: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  actionLabel?: string;
  actionRoute?: string;
};

const getNotificationStorageKey = (currentUser: string) => `notifications:${currentUser || "guest"}`;

export const getNotifications = (currentUser: string) => {
  try {
    const stored = localStorage.getItem(getNotificationStorageKey(currentUser));
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
  } catch {
    return [];
  }
};

export const saveNotifications = (currentUser: string, notifications: AppNotification[]) => {
  try {
    localStorage.setItem(getNotificationStorageKey(currentUser), JSON.stringify(notifications));
  } catch {
    // Ignore storage write failures and keep the UI responsive.
  }
};

export const createNotification = (
  notification: Omit<AppNotification, "id" | "createdAt" | "isRead"> & { id?: number; createdAt?: string; isRead?: boolean },
) => ({
  ...notification,
  id: notification.id ?? Date.now() + Math.floor(Math.random() * 1000),
  createdAt: notification.createdAt ?? new Date().toISOString(),
  isRead: notification.isRead ?? false,
});

export const pushNotification = (currentUser: string, notification: Omit<AppNotification, "id" | "createdAt" | "isRead">) => {
  const notifications = getNotifications(currentUser);
  const nextNotifications = [createNotification(notification), ...notifications].slice(0, 50);
  saveNotifications(currentUser, nextNotifications);
  return nextNotifications;
};

export const markNotificationRead = (currentUser: string, id: number) => {
  const updated = getNotifications(currentUser).map((item) => (item.id === id ? { ...item, isRead: true } : item));
  saveNotifications(currentUser, updated);
  return updated;
};

export const markAllNotificationsRead = (currentUser: string) => {
  const updated = getNotifications(currentUser).map((item) => ({ ...item, isRead: true }));
  saveNotifications(currentUser, updated);
  return updated;
};

export const getUnreadNotificationCount = (currentUser: string) =>
  getNotifications(currentUser).filter((item) => !item.isRead).length;

export const getUnreadBadgeLabel = (count: number) => {
  if (count <= 0) return "";
  if (count > 9) return "9+";
  return String(count);
};

export const formatNotificationTime = (createdAt: string) => {
  try {
    return new Date(createdAt).toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return createdAt;
  }
};

export const buildBalanceChangedMessage = (nextBalance: number) => {
  if (Math.abs(nextBalance) <= 500) {
    return "Your balance is now settled.";
  }

  if (nextBalance > 0) {
    return `You are now owed ${formatVND(nextBalance)} in this group.`;
  }

  return `You now owe ${formatVND(Math.abs(nextBalance))} in this group.`;
};
