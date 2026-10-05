import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Apple,
  Layers,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Share,
  Sparkles,
  Shield,
  WifiOff,
  Terminal,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ios' | 'bundle'>('pwa');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        setInstallSuccess(false);
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-white font-sans animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-blue-600 p-0.5 shadow-lg shadow-emerald-950/50">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Download & Buat APK / iOS</h2>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  100% OFFLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pasang langsung di HP/Tablet Android & iOS, atau buat file installer APK resmi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('pwa')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install Instan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>APK Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bundle')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'bundle'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Capacitor Sync</span>
          </button>
        </div>

        {/* Tab 1: PWA Instant Install (Android / Desktop) */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs">
            {installSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Aplikasi berhasil dipasang di layar utama perangkat Anda!</span>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Pasang sebagai Aplikasi Mandiri (PWA / WebAPK)
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Aplikasi ini telah memenuhi standar PWA modern. Saat dipasang, ikon aplikasi akan muncul di layar utama (home screen) HP/Tablet Anda, berjalan dalam layar penuh (full-screen) tanpa address bar browser, dan bekerja <strong>100% offline</strong>.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aplikasi ini saat ini sudah berjalan dalam mode aplikasi terpasang (Standalone PWA).</span>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950 transition cursor-pointer text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Aplikasi di Perangkat Ini Sekarang</span>
                </button>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <span>Cara Pasang di Browser Chrome / Edge / Brave:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                    <li>Buka menu browser (titik 3 di pojok kanan atas).</li>
                    <li>Pilih opsi <strong className="text-emerald-400">"Install app"</strong> atau <strong className="text-emerald-400">"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
                    <li>Aplikasi akan langsung terpasang sebagai WebAPK di HP Android Anda.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <WifiOff className="w-3.5 h-3.5" /> 100% Offline
                </div>
                <p className="text-[10px] text-slate-400">
                  Tetap dapat melakukan kasir tanpa sinyal internet atau WiFi.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-blue-400 font-bold flex items-center gap-1 text-[11px]">
                  <Shield className="w-3.5 h-3.5" /> Database Lokal
                </div>
                <p className="text-[10px] text-slate-400">
                  Data produk, stok, dan penjualan tersimpan aman di HP/Tablet.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                <div className="text-purple-400 font-bold flex items-center gap-1 text-[11px]">
                  <Smartphone className="w-3.5 h-3.5" /> Responsif Tablet
                </div>
                <p className="text-[10px] text-slate-400">
                  Layout otomatis menyesuaikan orientasi portrait & landscape.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Generate APK Android */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Cara 1: Buat APK Instan via PWABuilder (Paling Mudah & Cepat)
              </h3>
              <p className="text-slate-400 leading-relaxed">
                PWABuilder (alat resmi Microsoft) mengonversi PWA ini menjadi file installer <strong>.apk</strong> yang ditandatangani digital (*signed APK*), siap di-sideload ke Android atau diunggah ke Google Play Store:
              </p>

              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <li>Buka situs <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-400 font-mono underline hover:text-emerald-300">https://www.pwabuilder.com</a>.</li>
                <li>Masukkan tautan URL web aplikasi POS ini.</li>
                <li>Klik tombol <strong className="text-white">"Start"</strong>, lalu klik <strong className="text-emerald-400">"Package for Stores"</strong>.</li>
                <li>Pilih <strong className="text-white">"Android"</strong> lalu klik <strong className="text-emerald-400">"Generate APK / Package"</strong>.</li>
                <li>Download file <code>.apk</code> dan pasang langsung di HP/Tablet Android Anda!</li>
              </ol>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Cara 2: Build Native APK dengan Capacitor & Android Studio
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Proyek ini telah dilengkapi dengan berkas <code>capacitor.config.json</code>. Anda dapat meng-compile aplikasi ini menjadi APK murni melalui command line:
              </p>

              <div className="space-y-2">
                {[
                  { cmd: 'npm run build', desc: '1. Build file static aplikasi web' },
                  { cmd: 'npx @capacitor/cli add android', desc: '2. Generate project Android Studio' },
                  { cmd: 'npx @capacitor/cli sync', desc: '3. Salin bundle web ke folder Android' },
                  { cmd: 'npx @capacitor/cli open android', desc: '4. Buka di Android Studio dan klik Build > Build APK' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[9px] font-sans">{item.desc}</span>
                      <span className="text-emerald-300 font-semibold">{item.cmd}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.cmd, idx)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Salin Perintah"
                    >
                      {copiedIndex === idx ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: iOS (iPhone & iPad) */}
        {activeTab === 'ios' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-200" />
                Pasang di iPhone & iPad (Safari PWA)
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Di perangkat Apple iOS, aplikasi web dapat dipasang langsung menjadi aplikasi mandiri dengan layar penuh (*fullscreen app*), memiliki icon aplikasi sendiri, dan data tetap tersimpan offline:
              </p>

              <div className="space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Buka Aplikasi di Safari</span>
                    <span className="text-[11px] text-slate-400">Pastikan Anda membuka URL aplikasi ini menggunakan browser bawaan Safari di iPhone / iPad.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      Ketuk Tombol Share <Share className="w-3.5 h-3.5 text-blue-400 inline" />
                    </span>
                    <span className="text-[11px] text-slate-400">Ketuk ikon tombol "Share" (kotak dengan panah ke atas) di bilah bawah Safari.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">Pilih "Add to Home Screen" (Tambah ke Layar Utama)</span>
                    <span className="text-[11px] text-slate-400">Gulir ke bawah pada menu Share, lalu ketuk "Add to Home Screen" dan tekan tombol "Add".</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-300 block">Selesai!</span>
                    <span className="text-[11px] text-slate-400">Ikon <strong>Offline POS</strong> akan muncul di beranda iPad / iPhone Anda dan berjalan mandiri tanpa bilah URL Safari.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-slate-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                Build Project iOS Native untuk App Store / TestFlight
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jika Anda ingin menerbitkan aplikasi ke Apple App Store menggunakan Xcode di Mac:
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-blue-300">
                npm run build && npx @capacitor/cli add ios && npx @capacitor/cli open ios
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bundle & Configuration */}
        {activeTab === 'bundle' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                Konfigurasi Mobile & Service Worker
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Aplikasi ini telah siap dibundel (*production ready*) dengan metadata PWA lengkap dan file <code>capacitor.config.json</code> untuk integrasi mobile native.
              </p>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-[11px]">
                <div className="text-slate-400 text-[10px] font-sans">Berkas konfigurasi yang tersedia:</div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /capacitor.config.json</span>
                  <span className="text-emerald-400 text-[10px]">App ID: com.offlinepos.app</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /public/icon.svg</span>
                  <span className="text-emerald-400 text-[10px]">Vector Master Icon</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /public/pwa-192x192.png</span>
                  <span className="text-emerald-400 text-[10px]">Android Icon</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /public/pwa-512x512.png</span>
                  <span className="text-emerald-400 text-[10px]">Splash & Store Icon</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /public/apple-touch-icon.png</span>
                  <span className="text-emerald-400 text-[10px]">iOS Safari 180px</span>
                </div>
                <div className="flex items-center justify-between text-slate-200">
                  <span>• /public/pwa-maskable-512x512.png</span>
                  <span className="text-emerald-400 text-[10px]">Android Maskable</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Cek Manifest Browser</span>
                <span className="text-[10px] text-slate-400">Verifikasi bahwa manifest dan service worker terdeteksi oleh browser</span>
              </div>
              <a
                href="/manifest.webmanifest"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1"
              >
                <span>Lihat Manifest</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA & Service Worker Aktif</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
