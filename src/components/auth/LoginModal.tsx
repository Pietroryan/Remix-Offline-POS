import React, { useState } from 'react';
import { User } from '../../types/pos';
import { Lock, KeyRound, Shield, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginModalProps {
  users: User[];
  activeUser: User;
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  users,
  activeUser,
  onSelectUser,
  onClose,
}) => {
  const [selectedUser, setSelectedUser] = useState<User>(activeUser);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleLogin = () => {
    if (pin === selectedUser.pin) {
      onSelectUser(selectedUser);
      onClose();
    } else {
      setError('Invalid PIN code. Please try again.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Cashier Authentication</h2>
          <p className="text-xs text-slate-400">Select user profile and enter 4-digit PIN</p>
        </div>

        {/* User Selector Cards */}
        <div className="grid grid-cols-3 gap-2">
          {users.map((u) => {
            const isSelected = selectedUser.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setSelectedUser(u);
                  setPin('');
                  setError('');
                }}
                className={`flex flex-col items-center p-2.5 rounded-xl border transition text-center ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt={u.fullName}
                    className="w-10 h-10 rounded-full object-cover mb-1 border border-slate-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-sm mb-1">
                    {u.fullName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold truncate w-full">{u.fullName.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
              </button>
            );
          })}
        </div>

        {/* PIN Indicators */}
        <div className="text-center space-y-2">
          <div className="flex justify-center space-x-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border ${
                  pin.length > idx
                    ? 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400'
                    : 'bg-slate-800 border-slate-700'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
        </div>

        {/* Numeric PIN Keypad */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleKeyPress(n)}
              className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 font-bold text-lg border border-slate-700 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={handleDelete}
            className="h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 font-semibold text-xs border border-slate-700 transition"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-lg border border-slate-700 transition"
          >
            0
          </button>
          <button
            onClick={handleLogin}
            disabled={pin.length < 4}
            className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs border border-emerald-500 transition flex items-center justify-center"
          >
            Enter
          </button>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Demo PINs: Admin=1234, Sup=5555, Cashier=1111</span>
          <button onClick={onClose} className="hover:text-slate-200 underline">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
