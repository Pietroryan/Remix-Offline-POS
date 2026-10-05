import React, { useState, useEffect } from 'react';
import { User, StoreSettings } from '../../types/pos';
import { authService } from '../../services/auth';
import { storage } from '../../services/storage';
import { PWAInstallButton } from '../common/PWAInstallButton';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Store,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface LoginPageProps {
  settings: StoreSettings;
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  settings,
  onLoginSuccess,
}) => {
  // Form states
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Lockout / Rate limit countdown state
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Forced password change state
  const [mustChangeUser, setMustChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [changePasswordError, setChangePasswordError] = useState<string>('');
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<boolean>(false);
  const [seedSyncSuccess, setSeedSyncSuccess] = useState<string>('');

  // Check rate-limit on mount & interval countdown
  useEffect(() => {
    const checkLockout = () => {
      const remaining = authService.getLockoutSecondsRemaining();
      setLockoutSeconds(remaining);
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setErrorMessage('');
    setIsLoading(true);

    // Simulate small UI responsiveness delay (250ms) for authentic offline feel
    await new Promise((resolve) => setTimeout(resolve, 250));

    const result = authService.login(username, password, rememberMe);
    setIsLoading(false);

    if (result.success && result.user) {
      if (result.mustChangePassword) {
        // Direct user to change default password
        setMustChangeUser(result.user);
      } else {
        onLoginSuccess(result.user);
      }
    } else {
      setErrorMessage(result.error || 'Username atau password salah');
      if (result.lockoutSeconds && result.lockoutSeconds > 0) {
        setLockoutSeconds(result.lockoutSeconds);
      }
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setChangePasswordError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('Konfirmasi password tidak sesuai.');
      return;
    }

    if (newPassword === 'admin123') {
      setChangePasswordError('Password baru tidak boleh sama dengan password default.');
      return;
    }

    if (!mustChangeUser) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 250));

    const updated = authService.changePassword(mustChangeUser.id, newPassword);
    setIsLoading(false);

    if (updated) {
      setChangePasswordSuccess(true);
      setTimeout(() => {
        const freshUser = authService.getCurrentUser() || mustChangeUser;
        onLoginSuccess(freshUser);
      }, 1000);
    } else {
      setChangePasswordError('Gagal memperbarui password. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white font-sans">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card (Center Vertikal & Horizontal) */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-6">
        {/* Header: Logo + App Name */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-950 ring-1 ring-emerald-400/40">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">
              {settings.storeName || 'CornerStone POS'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Sistem Point of Sale & Manajemen Toko (Offline)
            </p>
          </div>
        </div>

        {/* MODE 1: FORM GANTI PASSWORD DEFAULT WAJIB */}
        {mustChangeUser ? (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-200">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300">Wajib Ganti Password</span>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  Akun <strong className="font-mono text-white">admin</strong> menggunakan password bawaan. Silakan buat password baru (minimal 6 karakter) sebelum masuk ke sistem.
                </p>
              </div>
            </div>

            {changePasswordError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center space-x-2 text-xs text-rose-300 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{changePasswordError}</span>
              </div>
            )}

            {changePasswordSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Password berhasil diubah! Mengarahkan ke halaman utama...</span>
              </div>
            )}

            {/* Field Password Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Password Baru *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  disabled={isLoading || changePasswordSuccess}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 p-1"
                  title={showNewPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field Konfirmasi Password Baru */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Konfirmasi Password Baru *
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading || changePasswordSuccess}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || changePasswordSuccess}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Password...</span>
                </>
              ) : (
                <>
                  <span>Simpan Password & Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMustChangeUser(null);
                setPassword('');
              }}
              className="w-full text-slate-400 hover:text-slate-200 text-xs py-1 transition text-center"
            >
              Batal dan kembali ke Login
            </button>
          </form>
        ) : (
          /* MODE 2: FORM LOGIN STANDARD */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Error Banner */}
            {errorMessage && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-rose-300 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <span className="font-semibold block">{errorMessage}</span>
                  {lockoutSeconds > 0 && (
                    <span className="text-[11px] text-rose-200/80 mt-0.5 block">
                      Silakan tunggu <strong>{lockoutSeconds} detik</strong> sebelum mencoba kembali.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Rate-limit lockout warning */}
            {lockoutSeconds > 0 && !errorMessage && (
              <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-3 flex items-center space-x-2 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Percobaan login terkunci. Coba lagi dalam <strong>{lockoutSeconds} detik</strong>.</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Username <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={isLoading || lockoutSeconds > 0}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-500 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading || lockoutSeconds > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 p-1 transition"
                  title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || lockoutSeconds > 0}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <span>Ingat saya (Remember me)</span>
              </label>
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : lockoutSeconds > 0 ? (
                <span>Terkunci ({lockoutSeconds}s)</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Hint akun default & quick autofill */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 space-y-2">
              <div className="font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Akun Seed Bawaan:
                </span>
                <span className="text-[10px] text-slate-500 font-sans">Klik untuk isi otomatis</span>
              </div>

              {seedSyncSuccess && (
                <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 p-2 rounded-lg text-[10px] flex items-center justify-between">
                  <span>{seedSyncSuccess}</span>
                  <button type="button" onClick={() => setSeedSyncSuccess('')} className="text-emerald-400 hover:text-white">✕</button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    storage.resetDefaultSeedUsers();
                    setUsername('admin');
                    setPassword('admin123');
                    setErrorMessage('');
                    setLockoutSeconds(0);
                    setSeedSyncSuccess('Akun Super Admin disinkronkan & siap login!');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 hover:border-emerald-500/50 border border-slate-800 rounded-lg p-2 text-left transition flex flex-col group cursor-pointer"
                >
                  <span className="text-emerald-400 font-bold font-mono text-xs group-hover:underline">
                    Super Admin
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono mt-0.5">
                    admin
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    pass: admin123
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    storage.resetDefaultSeedUsers();
                    setUsername('kasir');
                    setPassword('kasir123');
                    setErrorMessage('');
                    setLockoutSeconds(0);
                    setSeedSyncSuccess('Akun Kasir disinkronkan & siap login!');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 hover:border-blue-500/50 border border-slate-800 rounded-lg p-2 text-left transition flex flex-col group cursor-pointer"
                >
                  <span className="text-blue-400 font-bold font-mono text-xs group-hover:underline">
                    Kasir
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono mt-0.5">
                    kasir
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    pass: kasir123
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500">Kredensial terkunci atau lupa?</span>
                <button
                  type="button"
                  onClick={() => {
                    storage.resetDefaultSeedUsers();
                    setUsername('admin');
                    setPassword('admin123');
                    setErrorMessage('');
                    setLockoutSeconds(0);
                    setSeedSyncSuccess('Akun default (admin:admin123 & kasir:kasir123) berhasil di-reset!');
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset & Sinkron Ulang Akun Seed</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Mobile App & APK Install Option on Login */}
      <div className="mt-5 flex flex-col items-center space-y-2">
        <PWAInstallButton variant="login" />
        <div className="text-[11px] text-slate-500 flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Aplikasi berjalan 100% Offline • Kompatibel Android & iOS</span>
        </div>
      </div>
    </div>
  );
};
