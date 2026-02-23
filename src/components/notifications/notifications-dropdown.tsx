"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  link: string | null;
  metadata: unknown;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?countOnly=true");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {
      // Silently fail — notification count is non-critical
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?pageSize=20");
      if (!res.ok) return;
      const data: NotificationsResponse = await res.json();
      setNotifications(data.data);
      // Derive unread count from fetched data + total
      const unread = data.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for unread count periodically
  useEffect(() => {
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`/api/notifications/${notificationId}`, { method: "PATCH" });
    } catch {
      // Revert on failure
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch {
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      campaign_invite: "🎯",
      campaign_application: "📝",
      campaign_accepted: "✅",
      campaign_rejected: "❌",
      message: "💬",
      payment: "💰",
      content_approved: "👍",
      content_revision: "✏️",
      deadline_reminder: "⏰",
      milestone: "🎉",
      collaboration: "🤝",
      review: "⭐",
      system: "🔔",
    };
    return iconMap[type] || "🔔";
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[rgb(var(--surface))] transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs bg-red-500 text-white border-0"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <Card className="absolute right-0 top-full mt-2 w-[90vw] md:w-96 max-h-[80vh] z-50 border-2 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[rgb(var(--border))] flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-[rgb(var(--brand-primary))] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[rgb(var(--surface))] rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading && notifications.length === 0 ? (
                <div className="p-8 text-center text-[rgb(var(--muted))]">
                  <div className="h-6 w-6 mx-auto mb-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[rgb(var(--muted))]">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1 opacity-75">
                    You&apos;ll be notified about campaigns, payments, and messages here
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => {
                    const content = (
                      <div className="flex gap-3">
                        <div className="text-xl shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-0.5">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-[rgb(var(--brand-primary))] shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-1">
                            {notification.message}
                          </p>
                          <div className="text-xs text-[rgb(var(--muted))]">
                            {getTimeAgo(notification.createdAt)}
                          </div>
                        </div>
                      </div>
                    );

                    const className = `block p-4 border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] transition-colors ${
                      !notification.read ? "bg-[rgb(var(--brand-primary))]/5" : ""
                    }`;

                    return notification.link ? (
                      <Link
                        key={notification.id}
                        href={notification.link}
                        onClick={() => {
                          if (!notification.read) handleMarkAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className={className}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) handleMarkAsRead(notification.id);
                        }}
                        className={`${className} w-full text-left`}
                      >
                        {content}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
