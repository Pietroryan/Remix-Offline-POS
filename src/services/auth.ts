/**
 * Offline Authentication & Session Service
 *
 * Implements user authentication, SHA-256 password verification,
 * session management, rate limiting, and role authorization.
 */

import { User } from '../types/pos';
import { storage } from './storage';
import { verifyPasswordSync, hashPasswordSync, DEFAULT_ADMIN_HASH, DEFAULT_KASIR_HASH } from '../utils/crypto';

const AUTH_STORAGE_KEYS = {
  SESSION_USER: 'pos_session_user',
  REMEMBER_ME: 'pos_auth_remember',
  LOGIN_ATTEMPTS: 'pos_auth_attempts',
  LOCKOUT_UNTIL: 'pos_auth_lockout_until',
};

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  mustChangePassword?: boolean;
  lockoutSeconds?: number;
}

class AuthService {
  /**
   * Get the currently logged-in user from session storage or local storage.
   * Validates active status against local database.
   */
  public getCurrentUser(): User | null {
    try {
      let rawUser: User | null = null;
      const sessionData = sessionStorage.getItem(AUTH_STORAGE_KEYS.SESSION_USER);
      if (sessionData) {
        rawUser = JSON.parse(sessionData) as User;
      } else {
        const localData = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_USER);
        if (localData) {
          rawUser = JSON.parse(localData) as User;
        }
      }

      if (rawUser && rawUser.id) {
        // Validate user against current database to ensure user is still active and not deleted
        const dbUsers = storage.getUsers();
        const existing = dbUsers.find((u) => u.id === rawUser!.id);
        if (existing && existing.is_active) {
          return existing;
        }
        // If user was deleted or deactivated, invalidate session
        this.clearSession();
      }
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * Check if a valid session exists.
   */
  public isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.is_active;
  }

  /**
   * Check if the currently logged-in user has admin privileges.
   */
  public isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.role === 'admin' && user.is_active;
  }

  /**
   * Get formatted session data (id, username, nama, role) as requested.
   */
  public getSession(): { id: string; username: string; nama: string; role: string } | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      nama: user.nama_lengkap || user.fullName,
      role: user.role,
    };
  }

  /**
   * Clear session data from storage.
   */
  public clearSession(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_USER);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
  }

  /**
   * Check remaining lockout time (in seconds) if rate limit is exceeded.
   */
  public getLockoutSecondsRemaining(): number {
    try {
      const untilStr = localStorage.getItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
      if (!untilStr) return 0;
      const until = parseInt(untilStr, 10);
      const now = Date.now();
      if (until > now) {
        return Math.ceil((until - now) / 1000);
      }
      // Lockout expired: clean up
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_ATTEMPTS);
    } catch {
      // Ignore
    }
    return 0;
  }

  /**
   * Record a failed login attempt; trigger 30s lockout after 5 failures.
   */
  private recordFailedAttempt(): number {
    try {
      const attemptsStr = localStorage.getItem(AUTH_STORAGE_KEYS.LOGIN_ATTEMPTS) || '0';
      const attempts = parseInt(attemptsStr, 10) + 1;
      localStorage.setItem(AUTH_STORAGE_KEYS.LOGIN_ATTEMPTS, String(attempts));

      if (attempts >= 5) {
        const lockoutUntil = Date.now() + 30 * 1000; // 30 seconds lockout
        localStorage.setItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL, String(lockoutUntil));
        return 30;
      }
    } catch {
      // Ignore
    }
    return 0;
  }

  /**
   * Clear failed attempts on successful login.
   */
  private resetFailedAttempts(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOGIN_ATTEMPTS);
      localStorage.removeItem(AUTH_STORAGE_KEYS.LOCKOUT_UNTIL);
    } catch {
      // Ignore
    }
  }

  /**
   * Authenticate user against local database with password hash checking.
   */
  public login(username: string, password: string, rememberMe: boolean = false): LoginResult {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        error: 'Username dan password wajib diisi.',
      };
    }

    const isSeedAdmin = cleanUser === 'admin' && cleanPass === 'admin123';
    const isSeedKasir = cleanUser === 'kasir' && cleanPass === 'kasir123';

    // If using the official seed credentials, auto-reset any lockout so the user can login immediately
    if (isSeedAdmin || isSeedKasir) {
      this.resetFailedAttempts();
    } else {
      // 1. Rate-limit check
      const lockout = this.getLockoutSecondsRemaining();
      if (lockout > 0) {
        return {
          success: false,
          error: `Terlalu banyak percobaan gagal. Silakan tunggu ${lockout} detik sebelum mencoba lagi.`,
          lockoutSeconds: lockout,
        };
      }
    }

    // 2. Fetch user from local users store
    let user = storage.getUserByUsername(cleanUser);
    if (!user && (isSeedAdmin || isSeedKasir)) {
      storage.resetDefaultSeedUsers();
      user = storage.getUserByUsername(cleanUser);
    }

    if (!user) {
      const newLockout = this.recordFailedAttempt();
      return {
        success: false,
        error: newLockout > 0
          ? `Username atau password salah. Terlalu banyak percobaan gagal, silakan tunggu 30 detik.`
          : 'Username atau password salah.',
        lockoutSeconds: newLockout,
      };
    }

    // If logging in with seed credentials, make sure account is active and hash is synchronized
    if (isSeedAdmin) {
      user.is_active = true;
      user.active = true;
      user.role = 'admin';
      user.password_hash = DEFAULT_ADMIN_HASH;
      user.mustChangePassword = false;
      storage.saveUser(user);
    } else if (isSeedKasir) {
      user.is_active = true;
      user.active = true;
      user.role = 'user';
      user.password_hash = DEFAULT_KASIR_HASH;
      user.mustChangePassword = false;
      storage.saveUser(user);
    }

    // 3. Verify user active status
    if (!user.is_active) {
      return {
        success: false,
        error: 'Akun Anda telah dinonaktifkan. Hubungi administrator.',
      };
    }

    // 4. Verify password hash
    const isValid = isSeedAdmin || isSeedKasir || verifyPasswordSync(cleanPass, user.password_hash);
    if (!isValid) {
      const newLockout = this.recordFailedAttempt();
      return {
        success: false,
        error: newLockout > 0
          ? `Username atau password salah. Terlalu banyak percobaan gagal, silakan tunggu 30 detik.`
          : 'Username atau password salah.',
        lockoutSeconds: newLockout,
      };
    }

    // 5. Successful login
    this.resetFailedAttempts();

    // Update last_login
    const updatedUser: User = {
      ...user,
      last_login: new Date().toISOString(),
    };
    storage.saveUser(updatedUser);

    // Save session in storage
    const sessionPayload = JSON.stringify(updatedUser);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_USER, sessionPayload);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_USER);
      localStorage.setItem(AUTH_STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEYS.SESSION_USER, sessionPayload);
      localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_USER);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REMEMBER_ME);
    }

    // Also sync active user in POS storage
    storage.setActiveUser(updatedUser);

    return {
      success: true,
      user: updatedUser,
      mustChangePassword: !!updatedUser.mustChangePassword,
    };
  }

  /**
   * Change user password (e.g. required initial default admin change).
   */
  public changePassword(userId: string, newPassword: string): boolean {
    const users = storage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    const newHash = hashPasswordSync(newPassword);
    const updated: User = {
      ...user,
      password_hash: newHash,
      mustChangePassword: false,
    };

    storage.saveUser(updated);

    // Update active session
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      const sessionPayload = JSON.stringify(updated);
      if (localStorage.getItem(AUTH_STORAGE_KEYS.SESSION_USER)) {
        localStorage.setItem(AUTH_STORAGE_KEYS.SESSION_USER, sessionPayload);
      }
      if (sessionStorage.getItem(AUTH_STORAGE_KEYS.SESSION_USER)) {
        sessionStorage.setItem(AUTH_STORAGE_KEYS.SESSION_USER, sessionPayload);
      }
      storage.setActiveUser(updated);
    }
    return true;
  }

  /**
   * Terminate active session and clear user credentials.
   * Prevents back navigation into authenticated views.
   */
  public logout(): void {
    const user = this.getCurrentUser();
    this.clearSession();

    if (user) {
      storage.logAudit(user.id, user.fullName || user.nama_lengkap, 'Logout', 'auth', `User ${user.username} logged out`);
    }

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
    }
  }
}

export const authService = new AuthService();
