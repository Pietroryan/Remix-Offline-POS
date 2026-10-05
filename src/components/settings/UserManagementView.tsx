import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types/pos';
import { storage } from '../../services/storage';
import { authService } from '../../services/auth';
import { hashPasswordSync } from '../../utils/crypto';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Lock,
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: User | null;
  onUsersUpdated?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);

  // Form states (Add / Edit)
  const [formUsername, setFormUsername] = useState<string>('');
  const [formNamaLengkap, setFormNamaLengkap] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formConfirmPassword, setFormConfirmPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<'admin' | 'user'>('user');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [showPasswordText, setShowPasswordText] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Reset Password Modal form state
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');
  const [confirmNewPasswordVal, setConfirmNewPasswordVal] = useState<string>('');
  const [showResetPasswordText, setShowResetPasswordText] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>('');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshUserList = () => {
    const fresh = storage.getUsers();
    setUsers(fresh);
    if (onUsersUpdated) {
      onUsersUpdated();
    }
  };

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setActionAlert({ type, message });
    setTimeout(() => setActionAlert(null), 3500);
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nama_lengkap || u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
          ? u.role === 'admin'
          : u.role === 'user' || u.role === 'cashier' || u.role === 'supervisor';

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? u.is_active
          : !u.is_active;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormUsername('');
    setFormNamaLengkap('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormRole('user');
    setFormIsActive(true);
    setFormError('');
    setFormSuccess('');
    setShowPasswordText(false);
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormNamaLengkap(user.nama_lengkap || user.fullName);
    setFormPassword('');
    setFormConfirmPassword('');
    setFormRole(user.role === 'admin' ? 'admin' : 'user');
    setFormIsActive(user.is_active);
    setFormError('');
    setFormSuccess('');
    setShowPasswordText(false);
  };

  // Handle Save (Add) User
  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = formUsername.trim().toLowerCase();
    const cleanNama = formNamaLengkap.trim();

    // 1. Validasi field wajib
    if (!cleanUsername || !cleanNama || !formPassword) {
      setFormError('Semua field bertanda bintang (*) wajib diisi.');
      return;
    }

    // 2. Validasi spasi pada username
    if (/\s/.test(cleanUsername)) {
      setFormError('Username tidak boleh mengandung spasi.');
      return;
    }

    // 3. Validasi keunikan username
    const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      setFormError(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
      return;
    }

    // 4. Validasi panjang password
    if (formPassword.length < 6) {
      setFormError('Password minimal harus 6 karakter.');
      return;
    }

    if (formPassword !== formConfirmPassword) {
      setFormError('Konfirmasi password tidak cocok.');
      return;
    }

    // Buat objek user baru
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      password_hash: hashPasswordSync(formPassword),
      nama_lengkap: cleanNama,
      fullName: cleanNama,
      role: formRole,
      is_active: formIsActive,
      active: formIsActive,
      mustChangePassword: false,
      last_login: null,
      created_at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      pin: '0000',
    };

    storage.saveUser(newUser);
    refreshUserList();
    setShowAddModal(false);
    showAlert(`User "${cleanUsername}" berhasil ditambahkan.`);
  };

  // Handle Save (Edit) User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    const cleanNama = formNamaLengkap.trim();
    if (!cleanNama) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    // Proteksi: jangan izinkan nonaktifkan akun sendiri
    if (currentUser && currentUser.id === editingUser.id && !formIsActive) {
      setFormError('Anda tidak dapat menonaktifkan akun yang sedang digunakan untuk login.');
      return;
    }

    // Proteksi: jangan izinkan menurunkan role sendiri jika satu-satunya admin aktif
    if (
      currentUser &&
      currentUser.id === editingUser.id &&
      formRole !== 'admin' &&
      editingUser.role === 'admin'
    ) {
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.is_active);
      if (activeAdmins.length <= 1) {
        setFormError('Tidak dapat mengubah role karena Anda adalah satu-satunya admin aktif.');
        return;
      }
    }

    // Jika mengisi password baru
    let updatedHash = editingUser.password_hash;
    if (formPassword.trim()) {
      if (formPassword.length < 6) {
        setFormError('Password baru minimal harus 6 karakter.');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setFormError('Konfirmasi password tidak cocok.');
        return;
      }
      updatedHash = hashPasswordSync(formPassword);
    }

    const updatedUser: User = {
      ...editingUser,
      nama_lengkap: cleanNama,
      fullName: cleanNama,
      role: formRole,
      is_active: formIsActive,
      active: formIsActive,
      password_hash: updatedHash,
    };

    storage.saveUser(updatedUser);
    refreshUserList();
    setEditingUser(null);
    showAlert(`Data user "${editingUser.username}" berhasil diperbarui.`);
  };

  // Toggle active status langsung di tabel
  const handleToggleActiveQuick = (targetUser: User) => {
    // Proteksi 1: Tidak bisa nonaktifkan akun sendiri
    if (currentUser && currentUser.id === targetUser.id) {
      showAlert('Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif.', 'error');
      return;
    }

    // Proteksi 2: Tidak bisa nonaktifkan satu-satunya admin aktif
    if (targetUser.role === 'admin' && targetUser.is_active) {
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.is_active);
      if (activeAdmins.length <= 1) {
        showAlert('Tidak dapat menonaktifkan akun: minimal harus ada 1 admin yang aktif.', 'error');
        return;
      }
    }

    const nextState = !targetUser.is_active;
    const updated: User = {
      ...targetUser,
      is_active: nextState,
      active: nextState,
    };
    storage.saveUser(updated);
    refreshUserList();
    showAlert(`Status akun "${targetUser.username}" diubah menjadi ${nextState ? 'Aktif' : 'Nonaktif'}.`);
  };

  // Handle Hapus User
  const handleConfirmDelete = () => {
    if (!deletingUser) return;

    // Proteksi 1: Tidak bisa hapus akun sendiri
    if (currentUser && currentUser.id === deletingUser.id) {
      showAlert('Anda tidak dapat menghapus akun Anda sendiri.', 'error');
      setDeletingUser(null);
      return;
    }

    // Proteksi 2: Minimal tersisa 1 admin aktif
    if (deletingUser.role === 'admin') {
      const activeAdmins = users.filter((u) => u.role === 'admin' && u.is_active);
      if (activeAdmins.length <= 1 && deletingUser.is_active) {
        showAlert('Gagal menghapus: Harus tersisa minimal 1 admin aktif dalam sistem.', 'error');
        setDeletingUser(null);
        return;
      }
    }

    const success = storage.deleteUser(deletingUser.id);
    if (success) {
      showAlert(`User "${deletingUser.username}" telah dihapus.`);
    } else {
      showAlert('Gagal menghapus user.', 'error');
    }
    refreshUserList();
    setDeletingUser(null);
  };

  // Handle Reset Password User
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setResetError('');

    if (!newPasswordVal || newPasswordVal.length < 6) {
      setResetError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPasswordVal !== confirmNewPasswordVal) {
      setResetError('Konfirmasi password tidak cocok.');
      return;
    }

    const updated: User = {
      ...resettingUser,
      password_hash: hashPasswordSync(newPasswordVal),
      mustChangePassword: false,
    };

    storage.saveUser(updated);
    refreshUserList();
    setResettingUser(null);
    showAlert(`Password untuk user "${resettingUser.username}" berhasil direset.`);
  };

  // Helper cepat set default password saat reset
  const handleSetQuickDefaultPassword = () => {
    if (!resettingUser) return;
    const defaultPass = resettingUser.role === 'admin' ? 'admin123' : 'kasir123';
    setNewPasswordVal(defaultPass);
    setConfirmNewPasswordVal(defaultPass);
  };

  return (
    <div className="space-y-5 text-white font-sans">
      {/* Toast Alert */}
      {actionAlert && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all shadow-lg ${
            actionAlert.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{actionAlert.message}</span>
          </div>
          <button
            onClick={() => setActionAlert(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header bar: Title, Summary, and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-emerald-400" />
            Master Pengguna (User Management)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola data akun kasir dan administrator sistem POS (CRUD offline)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari username / nama lengkap..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Role */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-400">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs text-white font-medium focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Semua Role ({users.length})</option>
            <option value="admin" className="bg-slate-900 text-white">Admin</option>
            <option value="user" className="bg-slate-900 text-white">User / Kasir</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[11px] text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs text-white font-medium focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Semua Status</option>
            <option value="active" className="bg-slate-900 text-white">Aktif</option>
            <option value="inactive" className="bg-slate-900 text-white">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    Tidak ada data user yang sesuai dengan filter atau pencarian.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const itemIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isCurrentLoggedIn = currentUser?.id === u.id;
                  const isAdminRole = u.role === 'admin';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrentLoggedIn ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      {/* No */}
                      <td className="py-3 px-4 text-center text-slate-500 font-mono">
                        {itemIndex}
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        <div className="flex items-center space-x-2">
                          <span>{u.username}</span>
                          {isCurrentLoggedIn && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-normal">
                              Akun Anda
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Nama Lengkap */}
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {u.nama_lengkap || u.fullName}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {isAdminRole ? (
                          <span className="inline-flex items-center gap-1 bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                            <Shield className="w-3 h-3 text-purple-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-950/60 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                            <UserCheck className="w-3 h-3 text-blue-400" />
                            Kasir / User
                          </span>
                        )}
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActiveQuick(u)}
                          title={
                            isCurrentLoggedIn
                              ? 'Tidak bisa menonaktifkan akun sendiri'
                              : u.is_active
                              ? 'Klik untuk menonaktifkan user'
                              : 'Klik untuk mengaktifkan user'
                          }
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer border ${
                            u.is_active
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.is_active ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{u.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {u.last_login ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(u.last_login).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">Belum pernah login</span>
                        )}
                      </td>

                      {/* Aksi (Edit, Reset Password, Hapus) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Edit Data User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setResettingUser(u);
                              setNewPasswordVal('');
                              setConfirmNewPasswordVal('');
                              setResetError('');
                              setShowResetPasswordText(false);
                            }}
                            className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/40 text-amber-300 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrentLoggedIn}
                            className={`p-1.5 rounded-lg border transition ${
                              isCurrentLoggedIn
                                ? 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-rose-950/60 hover:bg-rose-900/80 border-rose-800/40 text-rose-300'
                            }`}
                            title={isCurrentLoggedIn ? 'Tidak bisa hapus akun sendiri' : 'Hapus User'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
          <div className="bg-slate-950/60 border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
            <div>
              Menampilkan{' '}
              <strong className="text-white">
                {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}
              </strong>{' '}
              sampai{' '}
              <strong className="text-white">
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </strong>{' '}
              dari <strong className="text-white">{filteredUsers.length}</strong> user
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: TAMBAH USER BARU                                */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Tambah User Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddUser} className="space-y-3.5 text-xs">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Username <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.replace(/\s+/g, ''))}
                  placeholder="Contoh: kasir2 (tanpa spasi)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400">
                  Unik, huruf kecil, dan tidak boleh ada spasi.
                </span>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNamaLengkap}
                  onChange={(e) => setFormNamaLengkap(e.target.value)}
                  placeholder="Nama staf / operator"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Password & Konfirmasi */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 6 karakter"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 pr-8 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">
                    Konfirmasi <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    required
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Role User</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="user">User / Kasir</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Status Akun</label>
                  <label className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      {formIsActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER                                       */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Edit Data User: <span className="font-mono text-emerald-400">{editingUser.username}</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
              {/* Username (Disabled / Readonly) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-semibold block">Username</label>
                  <span className="text-[10px] text-slate-500 font-mono">Terkunci (Readonly)</span>
                </div>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={editingUser.username}
                  className="w-full bg-slate-800/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-mono cursor-not-allowed"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNamaLengkap}
                  onChange={(e) => setFormNamaLengkap(e.target.value)}
                  placeholder="Nama staf / operator"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Ganti Password (Opsional) */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Ubah Password (Opsional)
                  </span>
                  <span className="text-[10px] text-slate-500">Kosongkan jika tidak diganti</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Password baru"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type={showPasswordText ? 'text' : 'password'}
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Role User</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="user">User / Kasir</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Status Akun</label>
                  <label className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      {formIsActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-950"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: RESET PASSWORD USER                             */}
      {/* ======================================================== */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                Reset Password: <span className="font-mono text-amber-300">{resettingUser.username}</span>
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold block">Password Baru</label>
                  <button
                    type="button"
                    onClick={handleSetQuickDefaultPassword}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Gunakan default ({resettingUser.role === 'admin' ? 'admin123' : 'kasir123'})
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPasswordText ? 'text' : 'password'}
                    required
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 pr-8 text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordText(!showResetPasswordText)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showResetPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Konfirmasi Password Baru</label>
                <input
                  type={showResetPasswordText ? 'text' : 'password'}
                  required
                  value={confirmNewPasswordVal}
                  onChange={(e) => setConfirmNewPasswordVal(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md shadow-amber-950"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: KONFIRMASI HAPUS USER                           */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-white shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm text-white">Hapus Pengguna</h3>
              <p className="text-xs text-slate-400">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-rose-400 font-mono">{deletingUser.username}</strong> ({deletingUser.nama_lengkap || deletingUser.fullName})?
              </p>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3 text-[11px] text-rose-300 space-y-1">
              <span className="font-bold block">Peringatan:</span>
              <p>Tindakan ini permanen dan tidak dapat dibatalkan.</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md shadow-rose-950"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
