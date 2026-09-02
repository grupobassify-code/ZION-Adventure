import React from 'react';
import { ShieldCheck, ExternalLink, Lock, HardDrive, UserCheck, X, FileText, CheckCircle2 } from 'lucide-react';

export const PRIVACY_POLICY_URL =
  'https://docs.google.com/document/d/1MDXzu64pcBKIH1s2EPW5X4_Si0nJJm9ljPrqmIYoELE/edit?usp=drivesdk';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.25)] relative overflow-hidden flex flex-col gap-4 max-h-[92vh]">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white font-heading tracking-wide">
                POLÍTICA DE PRIVACIDAD
              </h2>
              <p className="text-[11px] text-emerald-400 font-mono">
                Conforme a las Directrices de Seguridad de Google Play
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / Scrollable */}
        <div className="overflow-y-auto pr-1 flex flex-col gap-3 text-xs sm:text-sm text-slate-300">
          {/* Quick Summary Banner */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-200">
                Tu privacidad está 100% protegida en Zion Adventure.
              </p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                No recopilamos ni compartimos ningún dato personal. Todo el progreso del juego se guarda exclusivamente de forma local en tu dispositivo.
              </p>
            </div>
          </div>

          {/* Cards Grid of Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
                <HardDrive className="w-4 h-4" />
                <span>1. ALMACENAMIENTO LOCAL</span>
              </div>
              <p className="text-xs text-slate-400">
                El progreso (niveles desbloqueados, cristales, records) reside en el almacenamiento interno de tu navegador o dispositivo. Nunca se envía a servidores externos.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
                <Lock className="w-4 h-4" />
                <span>2. CERO RECOPILACIÓN</span>
              </div>
              <p className="text-xs text-slate-400">
                No solicitamos ni registramos nombres reales, correos electrónicos, contraseñas, ubicación GPS ni datos sensibles de ningún tipo.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-xs font-mono">
                <UserCheck className="w-4 h-4" />
                <span>3. APTO PARA TODAS LAS EDADES</span>
              </div>
              <p className="text-xs text-slate-400">
                Cumple con las directrices de seguridad familiar (COPPA y GDPR-K). No contiene compras integradas (*microtransacciones*) ni rastreo de anuncios.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs font-mono">
                <FileText className="w-4 h-4" />
                <span>4. CONTROL TOTAL DEL USUARIO</span>
              </div>
              <p className="text-xs text-slate-400">
                Tienes la libertad total de reiniciar, borrar o sobrescribir tus partidas en cualquier momento desde el menú de opciones.
              </p>
            </div>
          </div>

          {/* Official Document Link Box */}
          <div className="bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">
                  Documento Completo de Política de Privacidad
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md">
                  Consulta el documento oficial en Google Docs
                </div>
              </div>
            </div>

            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 active:scale-95 transition-all"
            >
              <span>Abrir Documento Oficial</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500">
            ZION ADVENTURE · VERSIÓN DE CONFORMIDAD 2026
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all active:scale-95"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
