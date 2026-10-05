import React, { useState, useMemo } from 'react';
import { AuditEvent } from '../../types/pos';
import { storage } from '../../services/storage';
import { downloadCsv, convertToCsv } from '../../services/exportCsv';
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  User,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';

interface AuditLogViewProps {
  logs?: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs: propLogs }) => {
  const [logs] = useState<AuditEvent[]>(() => propLogs || storage.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchCat = selectedCategory === 'all' || log.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [logs, selectedCategory, searchQuery]);

  const handleExportCsv = () => {
    const data = filteredLogs.map((log) => ({
      ID: log.id,
      Timestamp: log.timestamp,
      User: log.userName,
      Category: log.category,
      Action: log.action,
      Details: log.details,
    }));
    downloadCsv(`Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`, convertToCsv(data));
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'auth':
        return 'bg-purple-950/70 text-purple-300 border-purple-800';
      case 'sale':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
      case 'inventory':
        return 'bg-blue-950/70 text-blue-300 border-blue-800';
      case 'product':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      case 'shift':
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800';
      case 'settings':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'data':
        return 'bg-rose-950/70 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="flex-1 bg-[#0F172A] p-3 md:p-5 overflow-y-auto space-y-4 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-lg font-bold font-mono flex items-center gap-2 uppercase tracking-wide">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            System Audit Trail & Security Logs
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Immutable operation log for compliance, inventory traceability, and user actions
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-[#1E293B] hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded text-xs font-mono font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>EXPORT LOGS (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1E293B] border border-slate-800 rounded p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full bg-[#0F172A] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="w-full md:w-auto flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-1">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {['all', 'auth', 'sale', 'product', 'inventory', 'shift', 'settings', 'data'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#0F172A] text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Log Count Badge */}
      <div className="flex justify-between items-center text-xs font-mono text-slate-400">
        <span>Showing {filteredLogs.length} of {logs.length} audit entries</span>
        <span className="text-emerald-400 font-bold">● APPEND-ONLY LOG ACTIVE</span>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0F172A] border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Category</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 whitespace-nowrap text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getCategoryBadgeClass(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-200 font-semibold flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.userName}
                    </td>
                    <td className="p-3 whitespace-nowrap text-blue-400 font-bold">
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
