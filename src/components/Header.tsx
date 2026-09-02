import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Volume2, 
  VolumeX, 
  History, 
  MessageSquare, 
  Globe, 
  Radio,
  ChevronDown,
  Check,
  LogIn,
  LogOut,
  Cloud,
  CloudCheck,
  User as UserIcon,
  Loader2,
  BarChart3,
  Flame
} from "lucide-react";
import { REGIONS, getRegionConfig } from "../utils/regionUtils";
import { useAuth } from "../context/AuthContext";
import { AmerioPayButton } from "./AmerioPayButton";

interface HeaderProps {
  isLiveActive: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenHistory: () => void;
  onOpenChat: () => void;
  onOpenDaemon?: () => void;
  onOpenRanking?: () => void;
  unreadChatCount?: number;
  historyCount: number;
  selectedRegion: string;
  onChangeRegion: (region: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  voiceEnabled,
  onToggleVoice,
  onOpenHistory,
  onOpenChat,
  onOpenDaemon,
  onOpenRanking,
  historyCount,
  selectedRegion,
  onChangeRegion,
}) => {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { currentUser, userProfile, isSyncing, signInWithGoogle, logout } = useAuth();
  const activeRegion = getRegionConfig(selectedRegion);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRegionDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Agent Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AURA <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">AGENTE VIVO</span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Reconocimiento Multimodal • Rastreo en Tiempo Real
            </p>
          </div>
        </div>

        {/* Global Controls & Region Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Enhanced Region & Currency Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="btn-select-region"
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/90 hover:bg-slate-750 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-slate-200 shadow-sm transition-all"
              title="Cambiar País, Región y Moneda Local"
            >
              <span className="text-base sm:text-lg leading-none">{activeRegion.flag}</span>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono hidden sm:inline leading-none">País / Moneda</span>
                <span className="text-xs font-bold text-cyan-300 leading-tight">
                  {activeRegion.name} <span className="text-slate-400 font-mono text-[11px]">({activeRegion.currency})</span>
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isRegionDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isRegionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl shadow-black/80 py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    Seleccionar Región y Moneda
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ajusta precios, enlaces directos a tiendas locales y divisas oficiales.
                  </p>
                </div>

                <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
                  {Object.values(REGIONS).map((reg) => {
                    const isSelected = activeRegion.id === reg.id;
                    return (
                      <button
                        key={reg.id}
                        onClick={() => {
                          onChangeRegion(reg.id);
                          setIsRegionDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                          isSelected
                            ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{reg.flag}</span>
                          <div className="text-left">
                            <p className="font-semibold">{reg.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              Moneda: {reg.currency} ({reg.symbol})
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Voice Feedback toggle */}
          <button
            id="btn-toggle-voice"
            onClick={onToggleVoice}
            title={voiceEnabled ? "Desactivar voz del agente" : "Activar voz del agente"}
            className={`p-2 rounded-xl border transition-all ${
              voiceEnabled
                ? "bg-cyan-950/60 text-cyan-400 border-cyan-800 hover:bg-cyan-900/60"
                : "bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Memory Vault / History */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all text-xs font-medium"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Recuerdos</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] border border-indigo-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Ranking General & Estadísticas */}
          {onOpenRanking && (
            <button
              id="btn-header-ranking"
              onClick={onOpenRanking}
              className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 hover:text-amber-200 border border-amber-800/60 transition-all text-xs font-medium"
              title="Listado General de Productos Más Buscados y Ranking de Precios"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Ranking & Precios</span>
            </button>
          )}

          {/* Demonio de Verificación */}
          {onOpenDaemon && (
            <button
              id="btn-header-daemon"
              onClick={onOpenDaemon}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 hover:text-cyan-200 border border-cyan-800/60 transition-all text-xs font-medium"
              title="Módulo de Demonio & Validación Post-Compra"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Demonio Post-Compra</span>
            </button>
          )}

          {/* Amerio Pay Test Button */}
          <div className="hidden lg:block scale-90 origin-right">
            <AmerioPayButton
              amount={299.00}
              itemTitle="Acceso Pro AURA Agent"
              onPaymentSuccess={(recibo) => {
                console.log("Código de autorización:", recibo.authorizationCode);
                alert(`¡Gracias! Tu pago de $${recibo.amount} AMR-IO fue aprobado.`);
              }}
            />
          </div>

          {/* Chat with Agent */}
          <button
            id="btn-open-chat"
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs shadow-md shadow-indigo-500/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Conversar con AURA</span>
          </button>

          {/* Firebase Authentication & Cloud Sync */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="btn-user-profile"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-slate-800/90 hover:bg-slate-750 border border-indigo-500/30 hover:border-indigo-400/60 rounded-xl transition-all"
                title="Perfil y Estado de Nube Firebase"
              >
                <div className="flex flex-col items-end text-right hidden sm:flex">
                  <span className="text-xs font-semibold text-slate-200 leading-tight">
                    {currentUser.displayName || "Usuario"}
                  </span>
                  <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Firebase Sync
                  </span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-400/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {(currentUser.displayName || currentUser.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl shadow-black/80 py-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">
                      {currentUser.displayName || "Usuario"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-cyan-400" />
                        Firestore Database
                      </span>
                      <span className="text-emerald-400 font-mono font-semibold">Conectado</span>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    {onOpenDaemon && (
                      <button
                        id="btn-usermenu-daemon"
                        onClick={() => {
                          onOpenDaemon();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-950/40 rounded-xl transition-all font-medium"
                      >
                        <Bot className="w-4 h-4 text-cyan-400" />
                        Demonio de Verificación
                      </button>
                    )}
                    <button
                      id="btn-logout"
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-signin-google"
              onClick={signInWithGoogle}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500/50 text-xs font-medium shadow-sm transition-all"
            >
              {isSyncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              )}
              <span className="hidden sm:inline">Acceder</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
