import React, { useState } from 'react';
import { X, Lock, Mail, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { ROLE_LABELS } from '../../utils/platformHelpers';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'register' | 'recover';
  initialRegisterRole?: 'visitante' | 'vendedor';
  onClose: () => void;
  onSuccessNavigateToPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  initialRegisterRole = 'vendedor',
  onClose,
  onSuccessNavigateToPanel,
}) => {
  const {
    state,
    loginWithCredentials,
    quickLoginAsUser,
    registerAccount,
    recoverPassword,
  } = usePlatform();

  const [tab, setTab] = useState<'login' | 'register' | 'recover'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerRole, setRegisterRole] = useState<'visitante' | 'vendedor'>(initialRegisterRole);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const pilotQuickUsers = [
    state.users.find((u) => u.id === 'usr-visitante'),
    state.users.find((u) => u.id === 'usr-vendedor-1'),
    state.users.find((u) => u.id === 'usr-moderador'),
    state.users.find((u) => u.id === 'usr-admin'),
    state.users.find((u) => u.id === 'usr-superadmin'),
  ].filter(Boolean);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginWithCredentials(email, password);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      onClose();
      if (onSuccessNavigateToPanel) onSuccessNavigateToPanel();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerAccount(name, email, password, registerRole);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      onClose();
      if (registerRole === 'vendedor' && onSuccessNavigateToPanel) {
        onSuccessNavigateToPanel();
      }
    }
  };

  const handleRecoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = recoverPassword(email);
    setFeedback({ ok: res.ok, text: res.message });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 id="auth-modal-title" className="text-lg font-semibold text-[#141619]">
              {tab === 'login' && 'Ingresar a FeriaLocal'}
              {tab === 'register' && 'Crear cuenta'}
              {tab === 'recover' && 'Recuperar contraseña'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-2 rounded-lg text-[#5C636E] hover:bg-[#F3F2EE] hover:text-[#141619] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex gap-1 p-1 bg-[#F3F2EE] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === 'login'
                  ? 'bg-white text-[#141619] shadow-xs'
                  : 'text-[#5C636E] hover:text-[#141619]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setFeedback(null);
              }}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                tab === 'register'
                  ? 'bg-white text-[#141619] shadow-xs'
                  : 'text-[#5C636E] hover:text-[#141619]'
              }`}
            >
              Registrarse
            </button>
          </div>

          {feedback && (
            <div
              className={`flex items-start gap-2.5 p-3 rounded-lg text-sm border ${
                feedback.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-700" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#141619] mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#5C636E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mateo@barrodelsur.ar"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[#141619]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('recover');
                      setFeedback(null);
                    }}
                    className="text-xs font-medium text-[#0F5C4D] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#5C636E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Ingresar
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#141619] mb-1.5">
                  Tipo de cuenta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('vendedor')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      registerRole === 'vendedor'
                        ? 'border-[#0F5C4D] bg-[#0F5C4D]/5'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#141619]">Soy Emprendedor</div>
                    <div className="text-xs text-[#5C636E] mt-0.5">
                      Publicá tu catálogo y participá en ferias
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterRole('visitante')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      registerRole === 'visitante'
                        ? 'border-[#0F5C4D] bg-[#0F5C4D]/5'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#141619]">Soy Visitante</div>
                    <div className="text-xs text-[#5C636E] mt-0.5">
                      Guardá tus emprendimientos favoritos
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#141619] mb-1.5">
                  Nombre y apellido
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Laura Martínez"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141619] mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="laura@ejemplo.com.ar"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141619] mb-1.5">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Creá una clave segura"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Crear cuenta
              </button>
            </form>
          )}

          {tab === 'recover' && (
            <form onSubmit={handleRecoverSubmit} className="space-y-4">
              <p className="text-sm text-[#5C636E]">
                Ingresá tu correo electrónico registrado para recibir un enlace de restablecimiento.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com.ar"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg focus:border-[#0F5C4D]"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="px-4 py-2.5 text-sm font-medium text-[#5C636E] hover:text-[#141619] border border-[#E5E7EB] rounded-lg"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Enviar enlace
                </button>
              </div>
            </form>
          )}

          <div className="pt-5 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#5C636E] mb-3">
              <UserCheck className="w-4 h-4 text-[#0F5C4D]" />
              <span>Acceso rápido piloto por rol</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pilotQuickUsers.map((u) => {
                if (!u) return null;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      quickLoginAsUser(u.id);
                      onClose();
                      if (u.role !== 'visitante' && onSuccessNavigateToPanel) {
                        onSuccessNavigateToPanel();
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2 text-left rounded-lg border border-[#E5E7EB] hover:border-[#0F5C4D] hover:bg-[#0F5C4D]/5 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-[#141619] truncate">{u.name}</div>
                      <div className="text-[11px] text-[#5C636E] truncate">{u.email}</div>
                    </div>
                    <span className="text-[11px] font-medium text-[#0F5C4D] whitespace-nowrap shrink-0">
                      {ROLE_LABELS[u.role]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
