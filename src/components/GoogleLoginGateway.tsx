import React from "react";
import { useAuth } from "../context/AuthContext";
import { 
  ShieldCheck, 
  Bot, 
  Receipt, 
  Bell, 
  Sparkles, 
  LogOut, 
  User as UserIcon, 
  CheckCircle2, 
  Cloud, 
  ArrowRight,
  Database
} from "lucide-react";

interface GoogleLoginGatewayProps {
  onOpenDaemonModal?: () => void;
  onOpenVault?: () => void;
  savedProductsCount?: number;
  activeAlertsCount?: number;
}

export const GoogleLoginGateway: React.FC<GoogleLoginGatewayProps> = ({
  onOpenDaemonModal,
  onOpenVault,
  savedProductsCount = 0,
  activeAlertsCount = 0,
}) => {
  const { currentUser, userProfile, signInWithGoogle, logout, isSyncing } = useAuth();

  // If user is already authenticated, show user status summary widget
  if (currentUser) {
    return (
      <div 
        id="google-user-session-banner"
        className="w-full bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md mb-6"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || "Usuario"}
                className="w-12 h-12 rounded-full border-2 border-emerald-400/80 shadow-md object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Bóveda Personal Conectada
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-400">
                  <Cloud className="w-3.5 h-3.5 text-sky-400" />
                  Firebase Cloud Sync
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                {currentUser.displayName || "Usuario AURA"}
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <button
              id="btn-gateway-vault"
              type="button"
              onClick={onOpenVault}
              className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Mi Bóveda ({savedProductsCount})</span>
            </button>

            {onOpenDaemonModal && (
              <button
                id="btn-gateway-daemon"
                type="button"
                onClick={onOpenDaemonModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-cyan-900/30"
              >
                <Bot className="w-4 h-4 text-cyan-200" />
                <span>Demonio de Verificación</span>
              </button>
            )}

            <button
              id="btn-gateway-logout"
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-neutral-900/80 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 border border-neutral-800 hover:border-red-900/50 text-xs font-medium transition-all flex items-center gap-1.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in: Show Google Login Gateway Card
  return (
    <div 
      id="google-login-gateway-card"
      className="w-full bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-slate-900 border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden mb-8"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-8">
        {/* Left column: Value proposition */}
        <div className="flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acceso Seguro & Bóvedas Privadas Individuales
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Inicia Sesión con Google para Activar tu Bóveda Privada
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            Guarda tus búsquedas e historial de forma 100% aislada de otros usuarios. Conéctate con el 
            <strong className="text-white"> Demonio de Verificación AURA</strong> para auditar compras y entregas con agentes de comercios o subir tickets físicos.
          </p>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Bóveda Fotográfica Privada</h4>
                <p className="text-[11px] text-neutral-400">Historial y trazabilidad .log exclusivo de tu cuenta en Firebase.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Demonio Autónomo Post-Compra</h4>
                <p className="text-[11px] text-neutral-400">Handshake agente-a-agente para validar pagos y entregas con la tienda.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Validación de Tickets Físicos</h4>
                <p className="text-[11px] text-neutral-400">OCR multimodal de recibos y fotos de artículos recibidos estilo Trivago.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Alertas de Precio en la Nube</h4>
                <p className="text-[11px] text-neutral-400">Monitoreo continuo de rebajas sincronizado en todos tus dispositivos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Action CTA Box */}
        <div className="w-full lg:w-80 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 shadow-xl text-center shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 shadow-inner">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-base font-bold text-white mb-1">
            Tu Cuenta Google
          </h3>
          <p className="text-xs text-neutral-400 mb-5">
            Autenticación segura en 1 clic protegida por Firebase Auth.
          </p>

          <button
            id="btn-google-login-primary"
            type="button"
            onClick={signInWithGoogle}
            disabled={isSyncing}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-white/20 active:scale-98 disabled:opacity-50 mb-3 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSyncing ? "Conectando..." : "Iniciar Sesión con Google"}</span>
          </button>

          <span className="text-[11px] text-neutral-500">
            Sin contraseñas. Cada usuario accede únicamente a sus propios datos.
          </span>
        </div>
      </div>
    </div>
  );
};
