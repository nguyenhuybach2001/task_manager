"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { createTask } from '../../../firebase/firestore';
import { TASK_TYPES, FLEXIBLE_MODES, TYPE_LABELS, FLEXIBLE_MODE_LABELS } from '../../../utils/constants';

const emptyStep = () => ({
  name: '',
  content: '',
  startDate: '',
  dueDate: '',
  contactPerson: { name: '', phone: '', email: '' },
});

export default function TaskNew() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: TASK_TYPES.FIXED,
    flexibleMode: FLEXIBLE_MODES.ALL_KNOWN,
    startDate: '',
    dueDate: '',
    notification: {
      enabled: true,
      beforeDeadlineDays: 2,
      beforeStartDays: 1,
      dailyRemindTime: '09:00',
      urgentRemindEnabled: false,
      urgentRemindInterval: 30,
    },
    steps: [emptyStep()],
  });

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key, value) => {
    setForm(prev => ({
      ...prev,
      notification: { ...prev.notification, [key]: value },
    }));
  };

  const updateStep = (index, key, value) => {
    setForm(prev => {
      const steps = [...prev.steps];
      if (key.startsWith('contact.')) {
        const contactKey = key.split('.')[1];
        steps[index] = {
          ...steps[index],
          contactPerson: { ...steps[index].contactPerson, [contactKey]: value },
        };
      } else {
        steps[index] = { ...steps[index], [key]: value };
      }
      return { ...prev, steps };
    });
  };

  const addStep = () => {
    setForm(prev => ({ ...prev, steps: [...prev.steps, emptyStep()] }));
  };

  const removeStep = (index) => {
    setForm(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const moveStep = (index, direction) => {
    setForm(prev => {
      const steps = [...prev.steps];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      return { ...prev, steps };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      addToast('Vui lòng nhập tên công việc', 'warning');
      return;
    }
    
    // Debug: Kiểm tra xem biến môi trường có được Next.js nhận chưa
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key') {
      addToast('Lỗi: Next.js chưa nhận biến môi trường (NEXT_PUBLIC_FIREBASE_API_KEY bị thiếu). Vui lòng khởi động lại server.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Format dates for saving (Firestore handles ISO strings well)
      const taskData = {
        ...form,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        steps: form.steps.map(step => ({
          ...step,
          startDate: step.startDate ? new Date(step.startDate).toISOString() : null,
          dueDate: step.dueDate ? new Date(step.dueDate).toISOString() : null,
        }))
      };

      const task = await createTask(user.uid, taskData);
      addToast('Tạo công việc thành công!', 'success');
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-ink mb-1">Tạo công việc mới</h1>
          <p className="text-ink-muted">Điền thông tin chi tiết cho công việc</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Basic Info */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-6 flex items-center gap-2">
            📝 Thông tin cơ bản
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Tên công việc <span className="text-wax-red">*</span></label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                placeholder="VD: Hoàn thành báo cáo quý..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Loại công việc</label>
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm appearance-none cursor-pointer"
                >
                  <option value={TASK_TYPES.FIXED}>{TYPE_LABELS.fixed}</option>
                  <option value={TASK_TYPES.FLEXIBLE}>{TYPE_LABELS.flexible}</option>
                </select>
              </div>

              {form.type === TASK_TYPES.FLEXIBLE && (
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Chế độ linh hoạt</label>
                  <select
                    value={form.flexibleMode}
                    onChange={(e) => updateForm('flexibleMode', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm appearance-none cursor-pointer mb-2"
                  >
                    <option value={FLEXIBLE_MODES.ALL_KNOWN}>{FLEXIBLE_MODE_LABELS.all_known}</option>
                    <option value={FLEXIBLE_MODES.STEP_BY_STEP}>{FLEXIBLE_MODE_LABELS.step_by_step}</option>
                  </select>
                  <p className="text-xs text-ink-muted">
                    {form.flexibleMode === FLEXIBLE_MODES.STEP_BY_STEP
                      ? '💡 Từng bước: Bạn chỉ cần nhập bước đầu tiên'
                      : '💡 Nhập tất cả các bước bạn đã biết'}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-2">Thời hạn hoàn thành</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateForm('dueDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-bold text-ink mb-6 flex items-center gap-2">
            🔔 Cài đặt thông báo
          </h2>

          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.notification.enabled}
                onChange={(e) => updateNotification('enabled', e.target.checked)}
                className="w-5 h-5 rounded border-border-light text-copper focus:ring-copper cursor-pointer"
              />
              <span className="font-medium text-ink">Bật thông báo nhắc nhở</span>
            </label>
          </div>

          {form.notification.enabled && (
            <div className="space-y-6 border-t border-border-light pt-6 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Trước deadline (ngày)</label>
                  <input
                    type="number"
                    min="1" max="30"
                    value={form.notification.beforeDeadlineDays}
                    onChange={(e) => updateNotification('beforeDeadlineDays', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Trước ngày bắt đầu (ngày)</label>
                  <input
                    type="number"
                    min="1" max="30"
                    value={form.notification.beforeStartDays}
                    onChange={(e) => updateNotification('beforeStartDays', parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-2">Giờ thông báo</label>
                  <input
                    type="time"
                    value={form.notification.dailyRemindTime}
                    onChange={(e) => updateNotification('dailyRemindTime', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-border-light rounded-xl text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-[#f4ecd8] border border-border-light rounded-xl p-5">
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={form.notification.urgentRemindEnabled}
                    onChange={(e) => updateNotification('urgentRemindEnabled', e.target.checked)}
                    className="w-5 h-5 rounded border-border-light text-wax-red focus:ring-wax-red cursor-pointer"
                  />
                  <span className="font-bold text-wax-red">Nhắc nhở liên tục vào ngày cuối (nếu chưa xong)</span>
                </label>
                
                {form.notification.urgentRemindEnabled && (
                  <div className="pl-8 flex items-center gap-3">
                    <span className="text-sm font-medium text-ink">Nhắc lại mỗi</span>
                    <input
                      type="number"
                      min="5" max="180" step="5"
                      value={form.notification.urgentRemindInterval}
                      onChange={(e) => updateNotification('urgentRemindInterval', parseInt(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-white border border-border-light rounded-lg text-ink text-center focus:outline-none focus:ring-2 focus:ring-wax-red/50 focus:border-wax-red transition-all shadow-sm"
                    />
                    <span className="text-sm font-medium text-ink">phút</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
              📌 Các bước thực hiện
            </h2>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-2 px-4 py-2 bg-parchment-dark hover:bg-copper hover:text-white text-ink rounded-lg font-medium transition-colors text-sm w-max shadow-sm"
            >
              <Plus size={16} /> Thêm bước mới
            </button>
          </div>

          <div className="space-y-4">
            {form.steps.map((step, index) => (
              <div 
                key={index}
                className="bg-parchment border border-border-light rounded-xl p-5 relative group"
              >
                <div className="flex items-center justify-between mb-4 border-b border-border-light pb-3">
                  <span className="font-heading font-bold text-copper text-lg">
                    Bước {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      type="button" 
                      onClick={() => moveStep(index, -1)} 
                      disabled={index === 0}
                      className="p-1.5 text-ink-muted hover:text-ink disabled:opacity-30 rounded-md hover:bg-parchment-dark transition-colors"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveStep(index, 1)} 
                      disabled={index === form.steps.length - 1}
                      className="p-1.5 text-ink-muted hover:text-ink disabled:opacity-30 rounded-md hover:bg-parchment-dark transition-colors"
                    >
                      <ChevronDown size={18} />
                    </button>
                    {form.steps.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeStep(index)}
                        className="p-1.5 text-wax-red opacity-70 hover:opacity-100 hover:bg-wax-red-bg rounded-md transition-colors ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Tên bước <span className="text-wax-red">*</span></label>
                    <input
                      type="text"
                      required
                      value={step.name}
                      onChange={(e) => updateStep(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                      placeholder="VD: Thu thập dữ liệu..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Nội dung</label>
                    <textarea
                      value={step.content}
                      onChange={(e) => updateStep(index, 'content', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm resize-y"
                      placeholder="Mô tả chi tiết bước này..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-ink mb-1.5">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={step.startDate}
                        onChange={(e) => updateStep(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ink mb-1.5">Hạn chót</label>
                      <input
                        type="date"
                        value={step.dueDate}
                        onChange={(e) => updateStep(index, 'dueDate', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-dashed border-border-light">
                    <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                      👤 Người liên hệ (Tuỳ chọn)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={step.contactPerson.name}
                        onChange={(e) => updateStep(index, 'contact.name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                        placeholder="Tên"
                      />
                      <input
                        type="tel"
                        value={step.contactPerson.phone}
                        onChange={(e) => updateStep(index, 'contact.phone', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                        placeholder="SĐT"
                      />
                      <input
                        type="email"
                        value={step.contactPerson.email}
                        onChange={(e) => updateStep(index, 'contact.email', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-8 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 font-medium text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-xl transition-colors"
          >
            Huỷ bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-copper hover:bg-copper-dark text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {saving ? 'Đang lưu...' : 'Tạo công việc'}
          </button>
        </div>
      </form>
    </div>
  );
}
