import React, { useState } from 'react';
import { storage } from '../../services/storage';
import {
  Download,
  Upload,
  Database,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface BackupRestoreViewProps {
  onReloadData: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({ onReloadData }) => {
  const [restoreJson, setRestoreJson] = useState<string>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const handleDownloadBackup = () => {
    const jsonStr = storage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Offline_POS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', message: 'Full system backup JSON file generated and downloaded.' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreJson(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!restoreJson.trim()) return;
    const success = storage.importFullBackup(restoreJson);
    if (success) {
      setFeedback({ type: 'success', message: 'Database successfully restored from JSON file!' });
      onReloadData();
    } else {
      setFeedback({ type: 'error', message: 'Failed to restore database. Invalid JSON backup file format.' });
    }
  };

  const handleResetSeed = () => {
    if (window.confirm('Are you sure you want to reset all data to default demo seed values?')) {
      storage.resetToDefaultSeed();
      onReloadData();
      setFeedback({ type: 'success', message: 'System reset to default demo seed data.' });
    }
  };

  return (
    <div className="flex-1 bg-slate-950 p-4 md:p-6 overflow-y-auto space-y-6 text-white">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Database className="w-6 h-6 text-emerald-400" />
          Backup, Restore & Data Migration
        </h1>
        <p className="text-xs text-slate-400">
          Safeguard your local business records with one-click offline JSON backups or migration
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl">
        {/* Backup Export Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Download className="w-6 h-6" />
            <h3 className="font-bold text-sm text-slate-100">Export System Backup</h3>
          </div>
          <p className="text-xs text-slate-400">
            Export a full offline JSON snapshot of your products, sales history, customers, suppliers, settings, shifts, and audit logs.
          </p>

          <button
            onClick={handleDownloadBackup}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        {/* Restore Import Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 text-amber-400">
            <Upload className="w-6 h-6" />
            <h3 className="font-bold text-sm text-slate-100">Restore From Backup File</h3>
          </div>
          <p className="text-xs text-slate-400">
            Upload a previously exported JSON backup file to overwrite and restore database state.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300"
          />

          <button
            onClick={handleExecuteRestore}
            disabled={!restoreJson.trim()}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition"
          >
            <FileCheck className="w-4 h-4" />
            <span>Execute Restoration</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset to Demo Seed */}
      <div className="bg-rose-950/40 border border-rose-900/60 rounded-2xl p-5 space-y-3 max-w-4xl">
        <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone: Re-seed Demo Data</span>
        </div>
        <p className="text-xs text-slate-400">
          Reset all stored tables back to original initial demo seed values. All custom transactions created in this browser session will be reset.
        </p>
        <button
          onClick={handleResetSeed}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset System to Demo Seed</span>
        </button>
      </div>
    </div>
  );
};
