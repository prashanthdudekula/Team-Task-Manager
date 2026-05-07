import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Save, Loader2 } from 'lucide-react';
import { userApi } from '../api/user';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      let message = '';
      if (name !== user?.name) {
        await userApi.updateProfile({ name });
        message += 'Profile updated. ';
      }
      
      if (newPassword || currentPassword) {
        if (newPassword !== confirmPassword) {
          toast.error('New passwords do not match');
          setSaving(false);
          return;
        }
        await userApi.changePassword({ currentPassword, newPassword });
        message += 'Password changed.';
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      
      if (message) {
        toast.success(message);
        // Normally we'd want to update the user context here if name changed, 
        // but for simplicity, the next reload will fetch the new profile.
      } else {
        toast.success('Settings saved');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400 mt-1">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
          </div>
        </div>
      </motion.div>

      {/* Security Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input className="input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Task assigned to me', desc: 'Get notified when a task is assigned to you' },
            { label: 'Task status updated', desc: 'When tasks you created change status' },
            { label: 'New project member', desc: 'When someone joins your project' },
            { label: 'Task overdue', desc: 'Reminders for overdue tasks' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-slate-200 font-medium">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" id={`notif-${i}`} />
                <label
                  htmlFor={`notif-${i}`}
                  className="w-10 h-5 bg-slate-700 peer-checked:bg-indigo-600 rounded-full cursor-pointer block transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
