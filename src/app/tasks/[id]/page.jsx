"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, CheckCircle2, Plus, Clock, Info, Loader2, FileQuestion, Edit2, X } from 'lucide-react';
import { getTask, completeStep, deleteTask, addStepToTask, updateTask } from '../../../firebase/firestore';
import { useToast } from '../../../hooks/useToast';
import { getPriorityLabel } from '../../../utils/priority';
import { formatDate, formatDateLong, getDeadlineLabel, toInputDate } from '../../../utils/dates';
import { TYPE_LABELS, STATUS_LABELS, STEP_STATUS_LABELS, FLEXIBLE_MODE_LABELS } from '../../../utils/constants';

export default function TaskDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToast } = useToast();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStep, setShowAddStep] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newStep, setNewStep] = useState({ name: '', content: '', startDate: '', dueDate: '' });
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editingStep, setEditingStep] = useState(null);

  useEffect(() => {
    if (id) loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    const data = await getTask(id);
    setTask(data);
    setLoading(false);
  };

  const handleCompleteStep = async (stepIndex) => {
    try {
      await completeStep(id, stepIndex);
      addToast('Bước đã hoàn thành! ✅', 'success');
      await loadTask();
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask(id);
      addToast('Đã xoá công việc', 'info');
      router.push('/tasks');
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleAddStep = async (e) => {
    e.preventDefault();
    try {
      const formattedStep = {
        ...newStep,
        startDate: newStep.startDate ? new Date(newStep.startDate).toISOString() : null,
        dueDate: newStep.dueDate ? new Date(newStep.dueDate).toISOString() : null,
      };
      await addStepToTask(id, formattedStep);
      addToast('Đã thêm bước mới', 'success');
      setNewStep({ name: '', content: '', startDate: '', dueDate: '' });
      setShowAddStep(false);
      await loadTask();
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  const handleEditStepClick = (index, step) => {
    setEditingStepIndex(index);
    setEditingStep({
      ...step,
      startDate: step.startDate ? toInputDate(step.startDate) : '',
      dueDate: step.dueDate ? toInputDate(step.dueDate) : '',
      contactPerson: step.contactPerson || { name: '', phone: '', email: '' }
    });
  };

  const handleUpdateStep = async (e) => {
    e.preventDefault();
    try {
      const updatedSteps = [...task.steps];
      updatedSteps[editingStepIndex] = {
        ...editingStep,
        startDate: editingStep.startDate ? new Date(editingStep.startDate).toISOString() : null,
        dueDate: editingStep.dueDate ? new Date(editingStep.dueDate).toISOString() : null,
      };
      
      await updateTask(id, { steps: updatedSteps });
      addToast('Cập nhật bước thành công!', 'success');
      setEditingStepIndex(null);
      setEditingStep(null);
      await loadTask();
    } catch (error) {
      addToast('Lỗi: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-2 text-ink-muted">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <FileQuestion className="w-16 h-16 text-ink-muted/50 mb-4" />
        <h3 className="text-xl font-heading font-bold text-ink mb-4">Không tìm thấy công việc</h3>
        <button 
          onClick={() => router.push('/tasks')}
          className="px-6 py-2.5 bg-copper text-white rounded-lg font-medium hover:bg-copper-dark transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const completedSteps = task.steps.filter(s => s.status === 'completed').length;
  const totalSteps = task.steps.length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const deadline = getDeadlineLabel(task.dueDate);
  const isFlexibleStepByStep = task.type === 'flexible' && task.flexibleMode === 'step_by_step';

  const getPriorityColor = (p) => {
    if (p === 'high') return 'bg-wax-red-bg text-wax-red border-wax-red/20';
    if (p === 'medium') return 'bg-amber-bg text-amber border-amber/20';
    return 'bg-sage-bg text-sage border-sage/20';
  };

  const getStatusColor = (s) => {
    if (s === 'completed') return 'bg-sage-bg text-sage';
    if (s === 'in_progress') return 'bg-amber-bg text-amber';
    if (s === 'overdue') return 'bg-wax-red-bg text-wax-red';
    return 'bg-ink-faint/10 text-ink-muted';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => router.push('/tasks')}
            className="mt-1 p-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-ink mb-1">{task.name}</h1>
            <p className="text-ink-muted font-typewriter text-sm">
              {TYPE_LABELS[task.type]}
              {task.type === 'flexible' && ` • ${FLEXIBLE_MODE_LABELS[task.flexibleMode]}`}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-wax-red hover:bg-wax-red-bg rounded-lg font-medium transition-colors border border-transparent hover:border-wax-red/20"
        >
          <Trash2 size={18} /> Xoá công việc
        </button>
      </div>

      {/* Status Bar */}
      <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Trạng thái</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
              {STATUS_LABELS[task.status]}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Mức độ</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Thời hạn</div>
            <div className={`text-lg font-bold font-heading ${deadline.urgent ? 'text-wax-red' : 'text-ink'}`}>
              {deadline.text}
            </div>
          </div>
        </div>

        {totalSteps > 0 && (
          <div className="min-w-[200px] flex-1 sm:flex-none">
            <div className="flex justify-between text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
              <span>Tiến độ</span>
              <span>{completedSteps}/{totalSteps} ({progress}%)</span>
            </div>
            <div className="h-2 w-full bg-parchment-deep rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${task.status === 'completed' ? 'bg-sage' : task.priority === 'high' ? 'bg-wax-red' : 'bg-copper'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - Steps */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
                📌 Các bước thực hiện
              </h2>
              {(isFlexibleStepByStep || task.type === 'flexible') && task.status !== 'completed' && (
                <button 
                  onClick={() => setShowAddStep(!showAddStep)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-parchment-dark hover:bg-copper hover:text-white text-ink rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} /> Thêm bước
                </button>
              )}
            </div>

            {task.steps.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-ink-muted mb-4">Chưa có bước nào</p>
                <button 
                  onClick={() => setShowAddStep(true)}
                  className="px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper-dark transition-colors"
                >
                  Thêm bước đầu tiên
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-border-light ml-4 space-y-8 pb-4">
                {task.steps.map((step, index) => {
                  if (isFlexibleStepByStep && index > task.currentStepIndex + 1 && step.status === 'pending') {
                    return null;
                  }
                  
                  const isActive = step.status === 'in_progress';
                  const isCompleted = step.status === 'completed';

                  return (
                    <div key={index} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div 
                        className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-parchment-light ${isCompleted ? 'bg-sage' : isActive ? 'bg-copper' : 'bg-border-light'}`}
                      />

                      <div className={`bg-parchment border rounded-xl p-5 transition-all ${isActive ? 'border-copper shadow-md' : 'border-border-light'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-lg ${isActive ? 'text-copper' : 'text-ink'}`}>
                              {step.name || `Bước ${index + 1}`}
                            </h3>
                            <button 
                              onClick={() => handleEditStepClick(index, step)}
                              className="p-1.5 text-ink-muted hover:text-copper hover:bg-copper/10 rounded-md transition-colors"
                              title="Chỉnh sửa bước"
                            >
                              <Edit2 size={16} />
                            </button>
                          </div>
                          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(step.status)}`}>
                            {STEP_STATUS_LABELS[step.status]}
                          </div>
                        </div>

                        {step.content && (
                          <p className="text-ink-text mb-4 whitespace-pre-wrap">{step.content}</p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-ink-muted mb-4">
                          {step.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={16} /> Bắt đầu: {formatDate(step.startDate)}
                            </div>
                          )}
                          {step.dueDate && (
                            <div className="flex items-center gap-1.5">
                              <Info size={16} /> Hạn chót: {formatDate(step.dueDate)}
                            </div>
                          )}
                        </div>

                        {step.contactPerson?.name && (
                          <div className="bg-[#f4ecd8] rounded-lg p-3 inline-block mt-2">
                            <div className="font-bold text-sm text-ink mb-0.5">👤 {step.contactPerson.name}</div>
                            <div className="text-xs text-ink-muted">
                              {[step.contactPerson.phone, step.contactPerson.email].filter(Boolean).join(' • ')}
                            </div>
                          </div>
                        )}

                        {isActive && (
                          <div className="mt-5">
                            <button 
                              onClick={() => handleCompleteStep(index)}
                              className="flex items-center gap-2 px-4 py-2 bg-sage hover:bg-[#4a6343] text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
                            >
                              <CheckCircle2 size={16} /> Hoàn thành bước này
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Form Thêm bước mới */}
            {showAddStep && (
              <div className="mt-8 p-6 bg-parchment border-2 border-dashed border-border rounded-xl">
                <h3 className="font-heading font-bold text-ink mb-4">Thêm bước mới</h3>
                <form onSubmit={handleAddStep} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Tên bước</label>
                    <input
                      type="text"
                      required
                      value={newStep.name}
                      onChange={(e) => setNewStep(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1">Nội dung</label>
                    <textarea
                      value={newStep.content}
                      onChange={(e) => setNewStep(p => ({ ...p, content: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-ink mb-1">Ngày bắt đầu</label>
                      <input
                        type="date"
                        value={newStep.startDate}
                        onChange={(e) => setNewStep(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-ink mb-1">Hạn chót</label>
                      <input
                        type="date"
                        value={newStep.dueDate}
                        onChange={(e) => setNewStep(p => ({ ...p, dueDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-4 py-2 bg-copper text-white rounded-lg text-sm font-medium hover:bg-copper-dark transition-colors">
                      Thêm
                    </button>
                    <button type="button" onClick={() => setShowAddStep(false)} className="px-4 py-2 text-ink-muted hover:text-ink hover:bg-parchment-dark rounded-lg text-sm font-medium transition-colors">
                      Huỷ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6">
            <h3 className="text-lg font-heading font-bold text-ink mb-4 flex items-center gap-2">
              📋 Chi tiết
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Ngày tạo</div>
                <div className="font-bold text-ink">{formatDateLong(task.createdAt)}</div>
              </div>
              {task.startDate && (
                <div>
                  <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Ngày bắt đầu</div>
                  <div className="font-bold text-ink">{formatDateLong(task.startDate)}</div>
                </div>
              )}
              {task.dueDate && (
                <div>
                  <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-1">Thời hạn</div>
                  <div className={`font-bold ${deadline.urgent ? 'text-wax-red' : 'text-ink'}`}>
                    {formatDateLong(task.dueDate)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-parchment-light border border-border-light shadow-vintage rounded-2xl p-6">
            <h3 className="text-lg font-heading font-bold text-ink mb-4 flex items-center gap-2">
              🔔 Thông báo
            </h3>
            {task.notification?.enabled ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-sage font-medium">
                  <CheckCircle2 size={16} /> Đã bật thông báo
                </div>
                <div className="flex justify-between border-b border-border-light pb-2">
                  <span className="text-ink-muted">Trước deadline:</span>
                  <span className="font-bold text-ink">{task.notification.beforeDeadlineDays} ngày</span>
                </div>
                <div className="flex justify-between border-b border-border-light pb-2">
                  <span className="text-ink-muted">Trước lúc bắt đầu:</span>
                  <span className="font-bold text-ink">{task.notification.beforeStartDays} ngày</span>
                </div>
                <div className="flex justify-between border-b border-border-light pb-2">
                  <span className="text-ink-muted">Giờ nhắc:</span>
                  <span className="font-bold text-ink">{task.notification.dailyRemindTime}</span>
                </div>
                {task.notification.urgentRemindEnabled && (
                  <div className="flex justify-between items-center bg-[#f4ecd8] -mx-3 px-3 py-2 rounded-lg mt-2 border border-wax-red/10">
                    <span className="text-wax-red font-medium flex items-center gap-1.5 text-xs">
                      <Clock size={14} /> Nhắc liên tục ngày cuối:
                    </span>
                    <span className="font-bold text-wax-red text-xs">Mỗi {task.notification.urgentRemindInterval} phút</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-ink-muted text-sm italic">Thông báo đã bị tắt</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-parchment-light rounded-2xl shadow-xl w-full max-w-md border border-border overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-border-light">
              <h3 className="text-xl font-heading font-bold text-ink flex items-center gap-2">
                ⚠️ Xác nhận xoá
              </h3>
            </div>
            <div className="p-6 text-ink-text">
              Bạn có chắc muốn xoá công việc <strong className="text-ink">"{task.name}"</strong>? Hành động này không thể hoàn tác.
            </div>
            <div className="p-4 bg-parchment flex justify-end gap-3 border-t border-border-light">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-lg font-medium text-ink-muted hover:text-ink hover:bg-parchment-dark transition-colors"
              >
                Huỷ
              </button>
              <button 
                onClick={handleDeleteTask}
                className="px-5 py-2.5 rounded-lg font-medium bg-wax-red text-white hover:bg-[#9B3F2E] transition-colors shadow-sm"
              >
                Xoá công việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Step Modal */}
      {editingStepIndex !== null && editingStep && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-parchment-light rounded-2xl shadow-xl w-full max-w-lg border border-border overflow-hidden animate-scale-in my-auto">
             <div className="p-5 border-b border-border-light flex justify-between items-center bg-white">
                <h3 className="text-lg font-heading font-bold text-ink flex items-center gap-2">
                  <Edit2 size={20} className="text-copper" /> Chỉnh sửa chi tiết bước
                </h3>
                <button 
                  onClick={() => { setEditingStepIndex(null); setEditingStep(null); }} 
                  className="p-1.5 hover:bg-parchment-dark rounded-lg text-ink-muted hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
             </div>
             
             <form onSubmit={handleUpdateStep} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar bg-parchment">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Tên bước <span className="text-wax-red">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingStep.name}
                    onChange={(e) => setEditingStep(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">Nội dung chi tiết</label>
                  <textarea
                    value={editingStep.content}
                    onChange={(e) => setEditingStep(p => ({ ...p, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm resize-y"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Ngày bắt đầu</label>
                    <input
                      type="date"
                      value={editingStep.startDate}
                      onChange={(e) => setEditingStep(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ink mb-1.5">Hạn chót</label>
                    <input
                      type="date"
                      value={editingStep.dueDate}
                      onChange={(e) => setEditingStep(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-copper/50 focus:border-copper transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-border-light">
                  <label className="block text-xs font-bold text-ink-muted uppercase tracking-wider mb-3">
                    👤 Người liên hệ (Tuỳ chọn)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingStep.contactPerson?.name || ''}
                      onChange={(e) => setEditingStep(p => ({ ...p, contactPerson: { ...p.contactPerson, name: e.target.value } }))}
                      className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                      placeholder="Tên người liên hệ"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="tel"
                        value={editingStep.contactPerson?.phone || ''}
                        onChange={(e) => setEditingStep(p => ({ ...p, contactPerson: { ...p.contactPerson, phone: e.target.value } }))}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                        placeholder="Số điện thoại"
                      />
                      <input
                        type="email"
                        value={editingStep.contactPerson?.email || ''}
                        onChange={(e) => setEditingStep(p => ({ ...p, contactPerson: { ...p.contactPerson, email: e.target.value } }))}
                        className="w-full px-3 py-2 bg-white border border-border-light rounded-lg text-ink text-sm focus:outline-none focus:border-copper transition-all shadow-sm"
                        placeholder="Email"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => { setEditingStepIndex(null); setEditingStep(null); }}
                    className="px-5 py-2.5 rounded-lg font-medium text-ink-muted hover:text-ink hover:bg-border-light transition-colors"
                  >
                    Huỷ
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-medium bg-copper text-white hover:bg-copper-dark transition-colors shadow-sm"
                  >
                    Lưu thay đổi
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
