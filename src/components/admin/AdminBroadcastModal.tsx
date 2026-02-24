import { useState } from 'react';
import apiClient from '../../services/apiClient';

interface AdminBroadcastModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type BroadcastTarget = 'all' | 'role' | 'maintenance' | 'emergency';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export const AdminBroadcastModal = ({ onClose, onSuccess }: AdminBroadcastModalProps) => {
  const [targetType, setTargetType] = useState<BroadcastTarget>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('high');
  const [actionUrl, setActionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = ['student', 'university', 'admin'];

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSend = async () => {
    // Validate inputs
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    if (targetType === 'role' && selectedRoles.length === 0) {
      setError('Please select at least one role for role-specific broadcast');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/notifications/broadcast', {
        target_type: targetType,
        target_roles: targetType === 'role' ? selectedRoles : undefined,
        title: title.trim(),
        message: message.trim(),
        priority,
        action_url: actionUrl.trim() || undefined,
      });

      console.log('✅ Broadcast sent successfully:', response.data);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('❌ Failed to send broadcast:', err);
      setError(err.response?.data?.message || 'Failed to send broadcast notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">📢 Send Broadcast Notification</h2>
          <p className="text-sm text-gray-600 mt-1">
            Send a notification to all users or specific roles
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Broadcast Target
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('all')}
                className={`px-4 py-3 rounded-md border-2 text-left transition-colors ${
                  targetType === 'all'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">All Users</div>
                <div className="text-xs text-gray-600">Students, Universities, Admins</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('role')}
                className={`px-4 py-3 rounded-md border-2 text-left transition-colors ${
                  targetType === 'role'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">Specific Roles</div>
                <div className="text-xs text-gray-600">Choose target roles</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('maintenance')}
                className={`px-4 py-3 rounded-md border-2 text-left transition-colors ${
                  targetType === 'maintenance'
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">🔧 Maintenance Alert</div>
                <div className="text-xs text-gray-600">System maintenance notice</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('emergency')}
                className={`px-4 py-3 rounded-md border-2 text-left transition-colors ${
                  targetType === 'emergency'
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-semibold">🚨 Emergency</div>
                <div className="text-xs text-gray-600">Critical system alert</div>
              </button>
            </div>
          </div>

          {/* Role Selection (only if role-specific) */}
          {targetType === 'role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Roles *
              </label>
              <div className="space-y-2">
                {availableRoles.map((role) => (
                  <label key={role} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NotificationPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {targetType === 'maintenance' || targetType === 'emergency'
                ? 'Priority is automatically set to URGENT for this broadcast type'
                : 'Higher priority notifications appear more prominently'}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., System Maintenance Schedule"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your broadcast message here..."
              rows={5}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Action URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action URL (optional)
            </label>
            <input
              type="text"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/admin/dashboard or https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional link users can click to learn more or take action
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Sending...</span>
              </>
            ) : (
              <span>📢 Send Broadcast</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
