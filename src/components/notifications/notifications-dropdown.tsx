"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

// TODO: Wire to notifications API when endpoint is created

// Notification type (will be replaced when notifications API is created)
type Notification = {
  id: string;
  type:
    | "campaign_invite"
    | "campaign_application"
    | "campaign_accepted"
    | "campaign_rejected"
    | "message"
    | "payment"
    | "content_approved"
    | "content_revision"
    | "deadline_reminder"
    | "milestone";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
};

interface NotificationsDropdownProps {
  userId: string;
}

export function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    // TODO: Wire to notifications API when endpoint is created
    // For now, notifications will show as empty
    setNotifications([]);
    setUnreadCount(0);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    const iconMap = {
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
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
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
                    className="text-xs text-[rgb(var(--brand-primary))] hover:underline"
                  >
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
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[rgb(var(--muted))]">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      href={notification.link || "#"}
                      onClick={() => {
                        handleMarkAsRead(notification.id);
                        setIsOpen(false);
                      }}
                      className={`block p-4 border-b border-[rgb(var(--border))] hover:bg-[rgb(var(--surface))] transition-colors ${
                        !notification.read
                          ? "bg-[rgb(var(--brand-primary))]/5"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="text-2xl shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-[rgb(var(--brand-primary))] shrink-0 mt-1" />
                            )}
                          </div>

                          <p className="text-sm text-[rgb(var(--muted))] line-clamp-2 mb-2">
                            {notification.message}
                          </p>

                          <div className="text-xs text-[rgb(var(--muted))]">
                            {getTimeAgo(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-[rgb(var(--border))] text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-[rgb(var(--brand-primary))] hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
