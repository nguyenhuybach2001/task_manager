import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

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
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const loadSettings = async () => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      if (data.settings) setSettings(data.settings);
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
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        addToast('Đã bật thông báo!', 'success');
        // Test notification
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
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">⚙️ Cài đặt</h1>
        <p className="page-subtitle">Tuỳ chỉnh ứng dụng theo ý bạn</p>
      </div>

      {/* Notification Settings */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔔 Thông báo mặc định
        </h3>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="stat-label" style={{ marginBottom: '8px' }}>Quyền thông báo trình duyệt</div>
          <div className="flex items-center gap-md">
            <span className={`status-badge ${notificationPermission === 'granted' ? 'completed' : 'not_started'}`}>
              {notificationPermission === 'granted' ? '✅ Đã bật' : notificationPermission === 'denied' ? '❌ Đã từ chối' : '⏳ Chưa cấp quyền'}
            </span>
            {notificationPermission !== 'granted' && (
              <button className="btn btn-primary btn-sm" onClick={requestNotificationPermission}>
                Bật thông báo
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group">
            <label className="form-label">Trước deadline (ngày)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="30"
              value={settings.defaultNotifyBeforeDeadline}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultNotifyBeforeDeadline: parseInt(e.target.value) }))}
            />
            <p className="form-hint">Gửi thông báo trước N ngày</p>
          </div>
          <div className="form-group">
            <label className="form-label">Trước ngày bắt đầu (ngày)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              max="30"
              value={settings.defaultNotifyBeforeStart}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultNotifyBeforeStart: parseInt(e.target.value) }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Giờ nhắc trong ngày</label>
            <input
              type="time"
              className="form-input"
              value={settings.defaultRemindTime}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultRemindTime: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👤 Tài khoản
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <div className="stat-label">Tên</div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: '0.9375rem' }}>
              {user?.displayName || '—'}
            </div>
          </div>
          <div>
            <div className="stat-label">Email</div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: '0.9375rem' }}>
              {user?.email || '—'}
            </div>
          </div>
          <div>
            <div className="stat-label">Đăng nhập bằng</div>
            <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: '0.9375rem' }}>
              {user?.providerData?.[0]?.providerId === 'google.com' ? '🔵 Google' : '📧 Email'}
            </div>
          </div>
        </div>
      </div>

      {/* Firebase Setup Guide */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔥 Firebase Setup
        </h3>
        <div style={{ fontFamily: 'var(--font-typewriter)', fontSize: '0.8125rem', color: 'var(--ink-light)', lineHeight: 1.8 }}>
          <p>1. Vào <a href="https://console.firebase.google.com" target="_blank" rel="noopener">Firebase Console</a></p>
          <p>2. Tạo project mới</p>
          <p>3. Bật Authentication → Sign-in providers → Google + Email/Password</p>
          <p>4. Tạo Firestore Database (Start in test mode)</p>
          <p>5. Vào Project Settings → Web app → Copy config</p>
          <p>6. Dán vào file <code>.env</code> trong project</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-between" style={{ paddingBottom: 'var(--space-3xl)' }}>
        <div />
        <button className="btn btn-primary btn-lg" onClick={saveSettings} disabled={saving}>
          {saving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
        </button>
      </div>
    </div>
  );
}
