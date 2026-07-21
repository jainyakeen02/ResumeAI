import { useState } from 'react';
import { Bell, Shield, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();



  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDeleteAccount = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your preferences and account settings.</p>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl p-8 space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Bell size={20} className="text-brand-500" />
          Notifications
        </h3>

        <div className="flex items-center justify-between py-4 border-b border-sky-100">
          <div>
            <p className="font-medium text-slate-800">Analysis Complete Alerts</p>
            <p className="text-sm text-slate-500 mt-0.5">Get notified when your resume analysis is ready.</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${notifications ? 'bg-brand-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
          >
            {saved && <CheckCircle size={16} />}
            {saved ? 'Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-8 border border-red-200 space-y-4">
        <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
          <Shield size={20} />
          Danger Zone
        </h3>
        <p className="text-sm text-slate-500">
          These actions are permanent and cannot be undone. Please proceed carefully.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 font-medium text-sm transition-colors"
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-xl space-y-3">
            <p className="text-sm font-medium text-red-700">
              Are you sure? This will log you out and clear all local session data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-white border border-sky-100 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
