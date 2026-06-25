"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Bell, User, Loader2, Save, AlertCircle, Database } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState({
    defaultNotifyBeforeDeadline: 2,
    defaultNotifyBeforeStart: 1,
    defaultRemindTime: '09:00',
    theme: 'vintage-light',
  });
  const [saving, setSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if (user) loadSettings();
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.settings) setSettings(data.settings);
      }
    } catch (error) {
      console.warn('Lỗi tải cài đặt:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { settings });
      addToast('Đã lưu cài đặt!', 'success');
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        addToast('Đã bật thông báo!', 'success');
        new Notification('Task Manager', {
          body: 'Thông báo đã được bật thành công! 🎉',
          icon: '📋',
        });
      } else {
        addToast('Bạn đã từ chối quyền thông báo', 'warning');
      }
    } else {
      addToast('Trình duyệt không hỗ trợ thông báo', 'error');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-ink mb-1">⚙️ Cài đặt</h1>
        <p className="text-ink-muted">Tuỳ chỉnh ứng dụng theo ý bạn</p>
      </div>

      <div className="space-y-8">
        {/* Notification Settings */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-6 flex items-center gap-2">
            <Bell size={24} className="text-copper" /> Thông báo mặc định
          </h2>

          <div className="mb-8 p-4 bg-parchment border border-border-light rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-ink mb-1">Quyền thông báo trình duyệt</div>
              <div className="text-xs text-ink-muted">Cho phép gửi thông báo khi đến giờ nhắc nhở</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                notificationPermission === 'granted' ? 'bg-sage-bg text-sage border-sage/20' : 
                notificationPermission === 'denied' ? 'bg-wax-red-bg text-wax-red border-wax-red/20' : 
                'bg-amber-bg text-amber border-amber/20'
              }`}>
                {notificationPermission === 'granted' ? '✅ Đã bật' : 
                 notificationPermission === 'denied' ? '❌ Đã từ chối' : '⏳ Chưa cấp quyền'}
              </span>
              {notificationPermission !== 'granted' && (
                <button 
                  onClick={requestNotificationPermission}
                  className="px-4 py-1.5 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper-dark transition-colors shadow-sm"
                >
                  Bật thông báo
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Trước deadline (ngày)</label>
              <input
                type="number"
                min="1" max="30"
                value={settings.defaultNotifyBeforeDeadline}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultNotifyBeforeDeadline: parseInt(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
              />
              <p className="mt-2 text-xs text-ink-muted">Gửi thông báo trước N ngày</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Trước lúc bắt đầu (ngày)</label>
              <input
                type="number"
                min="1" max="30"
                value={settings.defaultNotifyBeforeStart}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultNotifyBeforeStart: parseInt(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Giờ nhắc trong ngày</label>
              <input
                type="time"
                value={settings.defaultRemindTime}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultRemindTime: e.target.value }))}
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-6 flex items-center gap-2">
            <User size={24} className="text-copper" /> Tài khoản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-parchment border border-border-light rounded-xl">
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Tên hiển thị</div>
              <div className="font-typewriter text-ink font-medium truncate">{user?.displayName || '—'}</div>
            </div>
            <div className="p-4 bg-parchment border border-border-light rounded-xl">
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Email</div>
              <div className="font-typewriter text-ink font-medium truncate">{user?.email || '—'}</div>
            </div>
            <div className="p-4 bg-parchment border border-border-light rounded-xl">
              <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Đăng nhập bằng</div>
              <div className="font-typewriter text-ink font-medium truncate">
                {user?.providerData?.[0]?.providerId === 'google.com' ? '🔵 Google' : '📧 Email/Password'}
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Info */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-6 flex items-center gap-2">
            <Database size={24} className="text-copper" /> Firebase Setup
          </h2>
          <div className="font-typewriter text-sm text-ink-light leading-relaxed bg-[#f4ecd8] p-5 rounded-xl border border-border-light shadow-inner">
            <p className="mb-2">1. Vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-copper hover:underline font-bold">Firebase Console</a></p>
            <p className="mb-2">2. Tạo project mới</p>
            <p className="mb-2">3. Bật Authentication → Sign-in providers → Google + Email/Password</p>
            <p className="mb-2">4. Tạo Firestore Database (Start in test mode)</p>
            <p className="mb-2">5. Vào Project Settings → Web app → Copy config</p>
            <p>6. Dán vào file <code>.env</code> trong project</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={saveSettings} 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-copper hover:bg-copper-dark text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
}
