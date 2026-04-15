'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  FileText
} from 'lucide-react';
import { listenNotifications, markNotificationAsRead } from '@/lib/firestore-service';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenNotifications(user.uid, setNotifications);
    return () => unsubscribe();
  }, [user]);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
      >
        <Bell className="w-5 h-5 text-white" />

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold shadow">
            {unread}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden z-50">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="font-semibold text-sm">Notifikasi</span>
            </div>

            {unread > 0 && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {unread} baru
              </span>
            )}
          </div>

          {/* LIST */}
          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                <Bell className="w-6 h-6 mx-auto mb-2 opacity-50" />
                Belum ada notifikasi
              </div>
            )}

            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={async () => {
                  await markNotificationAsRead(notif.id);
                  setOpen(false);
                  router.push(`/laporan/${notif.reportId}`);
                }}
                className={`group px-4 py-3 border-b cursor-pointer transition flex gap-3 items-start
                ${!notif.isRead ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}
              >

                {/* ICON */}
                <div className={`mt-1 ${
                  !notif.isRead ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {!notif.isRead ? <FileText className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {notif.createdAt
                      ? new Date(notif.createdAt).toLocaleString()
                      : ''}
                  </div>
                </div>

                {/* DOT */}
                {!notif.isRead && (
                  <div className="w-2 h-2 mt-2 bg-green-500 rounded-full" />
                )}
              </div>
            ))}

          </div>

          {/* FOOTER */}
          {notifications.length > 0 && (
            <div className="p-3 text-center text-xs text-gray-500 bg-gray-50">
              Klik notifikasi untuk melihat detail laporan
            </div>
          )}

        </div>
      )}
    </div>
  );
}