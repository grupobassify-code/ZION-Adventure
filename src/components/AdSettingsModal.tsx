import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Globe,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { useAdConfig, excludeCurrentIp, includeCurrentIp, ADSENSE_CLIENT_ID } from '../utils/adManager';
import { sound } from '../audio/soundEngine';

interface AdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUIRED_CODE_PRIMARY = "djosiwno92884’;#;#’";
const REQUIRED_CODE_ALT = "djosiwno92884';#;#'";

const validateAccessCode = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const normalized = trimmed.replace(/[’'´`]/g, "'");
  return (
    trimmed === REQUIRED_CODE_PRIMARY ||
    trimmed === REQUIRED_CODE_ALT ||
    normalized === "djosiwno92884';#;#'"
  );
};

export const AdSettingsModal: React.FC<AdSettingsModalProps> = ({ isOpen, onClose }) => {
  const adConfig = useAdConfig();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [shake, setShake] = useState(false);

  const [manualIp, setManualIp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (!isOpen) {
      setIsUnlocked(false);
      setAccessCode('');
      setCodeError(false);
      setShowCode(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAccessCode(accessCode)) {
      sound.playSfx('upgrade');
      setIsUnlocked(true);
      setCodeError(false);
    } else {
      sound.playSfx('hurt');
      setCodeError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleToggleExclusion = async () => {
    sound.playSfx('menuSelect');
    setIsProcessing(true);
    if (adConfig.isExcluded) {
      await includeCurrentIp();
    } else {
      await excludeCurrentIp();
    }
    setIsProcessing(false);
  };

  const handleAddManualIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp.trim()) return;
    setIsProcessing(true);
    await excludeCurrentIp(manualIp.trim());
    setManualIp('');
    setIsProcessing(false);
    sound.playSfx('upgrade');
  };

  const handleRemoveIp = async (ip: string) => {
    setIsProcessing(true);
    await includeCurrentIp(ip);
    setIsProcessing(false);
    sound.playSfx('dash');
  };

  const handleCopyAdsTxt = () => {
    navigator.clipboard.writeText('google.com, pub-9363587326808424, DIRECT, f08c47fec0942fa0');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    sound.playSfx('menuSelect');
  };

  // If not unlocked, display the Security Access Gate
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className={`relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-[#070b19] border-2 ${
          codeError ? 'border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-amber-500/40 shadow-2xl'
        } p-5 sm:p-6 text-slate-100 transition-all ${shake ? 'translate-x-1 animate-bounce' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white font-heading">
                  Control de Anuncios IP
                </h2>
                <p className="text-[11px] sm:text-xs text-amber-400/90 font-mono flex items-center gap-1">
                  <span>Acceso Restringido · Código Requerido</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Gate Form */}
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Para entrar al panel de exclusión de IP y control de Google AdSense debes ingresar el código de autorización del creador.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Código de Autorización
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    if (codeError) setCodeError(false);
                  }}
                  placeholder="Introduce el código..."
                  autoFocus
                  className={`w-full bg-slate-900 border rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition-all ${
                    codeError
                      ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-500'
                      : 'border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showCode ? 'Ocultar código' : 'Mostrar código'}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {codeError && (
                <p className="mt-2 text-[11px] font-mono font-bold text-red-400 flex items-center gap-1.5 animate-in fade-in">
                  <span>❌ Código incorrecto. Acceso denegado.</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  sound.playSfx('menuSelect');
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!accessCode.trim()}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-pointer active:scale-95 transition-all"
              >
                <span>Desbloquear</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Once Unlocked: Full Ad Control Panel
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-slate-900 to-[#070b19] border-2 border-cyan-500/40 shadow-2xl p-4 sm:p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-heading">
                Control de Anuncios AdSense
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                Exclusión de IP para el Creador & Verificación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                setIsUnlocked(false);
                setAccessCode('');
              }}
              className="p-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              title="Bloquear panel de nuevo"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>
            <button
              onClick={() => {
                sound.playSfx('menuSelect');
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current IP Status Card */}
        <div className={`p-4 rounded-xl border-2 mb-4 transition-all ${
          adConfig.isExcluded
            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
            : 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              {adConfig.isExcluded ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
              )}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Tu Dirección IP Detectada
                </span>
                <div className="text-base sm:text-lg font-black font-mono text-cyan-300">
                  {adConfig.clientIp || '127.0.0.1'}
                </div>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider border ${
              adConfig.isExcluded
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}>
              {adConfig.isExcluded ? 'IP Excluida (Seguro)' : 'Anuncios Visibles'}
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
            {adConfig.isExcluded ? (
              <>
                <strong className="text-emerald-400">Modo Creador Activo:</strong> Los anuncios están completamente desactivados para tu conexión. Google AdSense no registrará impresiones ni clics desde tu dispositivo, protegiendo tu cuenta de suspensiones.
              </>
            ) : (
              <>
                <strong className="text-amber-400">Modo Visitante Activo:</strong> Estás navegando como un jugador normal y los anuncios son visibles en el menú principal.
              </>
            )}
          </p>

          <button
            onClick={handleToggleExclusion}
            disabled={isProcessing}
            className={`mt-3 w-full py-2 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
              adConfig.isExcluded
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : adConfig.isExcluded ? (
              <>
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Desactivar exclusión temporalmente (Probar como visitante)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Excluir mi dirección IP de anuncios ahora (Recomendado)</span>
              </>
            )}
          </button>
        </div>

        {/* Integration Details Check */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 mb-4 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/80">
            <span className="font-bold text-slate-300">Cuenta de AdSense:</span>
            <span className="text-cyan-400">{ADSENSE_CLIENT_ID}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800/80">
            <span className="font-bold text-slate-300">Ubicación de anuncios:</span>
            <span className="text-emerald-400">Solo en Menú Principal (No invasivo)</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-300">Archivo ads.txt obligatorio:</span>
              <a
                href="/ads.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
              >
                <span>Ver /ads.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              <span className="truncate mr-2">google.com, pub-9363587326808424, DIRECT, f08c47fec0942fa0</span>
              <button
                onClick={handleCopyAdsTxt}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] shrink-0"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Manual IP Addition */}
        <div className="bg-slate-950/40 rounded-xl p-3.5 border border-slate-800/80 mb-3">
          <span className="text-[11px] font-mono font-bold text-slate-300 block mb-2">
            Añadir otra IP a la lista de exclusión (Oficina, Móvil o Wi-Fi secundaria):
          </span>
          <form onSubmit={handleAddManualIp} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: 189.145.20.10"
              value={manualIp}
              onChange={(e) => setManualIp(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isProcessing || !manualIp.trim()}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </form>

          {adConfig.excludedIps && adConfig.excludedIps.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                IPs actualmente excluidas en el servidor ({adConfig.excludedIps.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {adConfig.excludedIps.map((ip) => (
                  <span
                    key={ip}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300"
                  >
                    <span>{ip}</span>
                    <button
                      onClick={() => handleRemoveIp(ip)}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                      title="Eliminar de la lista de exclusión"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
          <span>Los cambios se guardan permanentemente en el servidor</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
