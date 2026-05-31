import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import { connectSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/notifications?limit=8')
      .then(res => {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unread_count || 0);
      })
      .catch(() => {});

    const token = localStorage.getItem('token');
    const socket = connectSocket(token);
    if (!socket) return;

    const onNew = ({ notification }) => {
      setNotifications(prev => [notification, ...prev].slice(0, 8));
      toast(notification.title || 'Bạn có thông báo mới');
    };
    const onCount = ({ unread_count }) => setUnreadCount(unread_count || 0);
    const onRead = ({ unread_count }) => setUnreadCount(unread_count || 0);

    socket.on('notification:new', onNew);
    socket.on('notification:unread_count', onCount);
    socket.on('notification:read', onRead);
    socket.on('notification:read_all', onRead);

    return () => {
      socket.off('notification:new', onNew);
      socket.off('notification:unread_count', onCount);
      socket.off('notification:read', onRead);
      socket.off('notification:read_all', onRead);
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200/70 z-50 shadow-sm">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <Link to={`/${user?.role?.toLowerCase()}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              <span className="text-white font-display font-bold text-sm">IA</span>
            </div>
            <span className="hidden sm:block font-display font-bold text-gray-900 text-lg tracking-tight">
              IELTS Academy
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-slide-down z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Thông báo</p>
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700">Đánh dấu đã đọc</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">Chưa có thông báo</p>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${n.is_read ? '' : 'bg-primary-50/50'}`}>
                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                <span className="text-white text-xs font-bold">{getInitials(user?.full_name)}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-slide-down z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Link to="/profile" onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User className="w-4 h-4" /> Hồ sơ cá nhân
                </Link>
                <button onClick={() => { logout(); setShowDropdown(false); }}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 transition-colors w-full">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

