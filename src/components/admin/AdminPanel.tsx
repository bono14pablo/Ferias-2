import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Flag,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  RotateCcw,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  Users,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import {
  EntrepreneurPublishStatus,
  PlanTier,
  ReportStatus,
  UserRole,
} from '../../types/platform';
import {
  canAccessAdmin,
  canAccessSuperadmin,
  formatARS,
  isPromotionCurrentlyActive,
  ROLE_LABELS,
} from '../../utils/platformHelpers';
import {
  AdminCategoriesLocationsTab,
  AdminFairsTab,
  AdminParticipantsTab,
  AdminPromotionsTab,
} from './AdminFairsAndCatalogTabs';

type AdminSection =
  | 'dashboard'
  | 'emprendimientos'
  | 'productos'
  | 'denuncias'
  | 'ferias'
  | 'participantes'
  | 'taxonomias'
  | 'promociones'
  | 'usuarios'
  | 'auditoria'
  | 'configuracion';

interface AdminPanelProps {
  onBackToPortal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToPortal }) => {
  const {
    state,
    currentUser,
    moderateEntrepreneurStatus,
    toggleEntrepreneurFeatured,
    updateProduct,
    resolveReport,
    updateUserRoleOrActive,
    updateSystemConfig,
    resetPlatformData,
    logout,
  } = usePlatform();

  const isAdmin = canAccessAdmin(currentUser?.role);
  const isSuper = canAccessSuperadmin(currentUser?.role);

  const [section, setSection] = useState<AdminSection>(
    isAdmin ? 'dashboard' : 'emprendimientos'
  );
  const [entStatusFilter, setEntStatusFilter] = useState<'todos' | EntrepreneurPublishStatus>('todos');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});

  const stats = useMemo(() => {
    const activeVendors = state.users.filter((u) => u.role === 'vendedor' && u.active).length;
    const activeEnts = state.entrepreneurs.filter((e) => !e.deletedAt && e.status === 'publicado').length;
    const pendingEnts = state.entrepreneurs.filter((e) => !e.deletedAt && e.status === 'pendiente').length;
    const totalFairs = state.fairs.filter((f) => !f.deletedAt).length;
    const publishedProds = state.products.filter((p) => !p.deletedAt && p.publishStatus === 'publicado').length;
    const activePromos = state.promotions.filter((pr) => isPromotionCurrentlyActive(pr)).length;
    const totalVisits = state.visits.length;
    const totalWaClicks = state.contactClicks.filter((c) => c.channel === 'whatsapp').length;
    return {
      activeVendors,
      activeEnts,
      pendingEnts,
      totalFairs,
      publishedProds,
      activePromos,
      totalVisits,
      totalWaClicks,
    };
  }, [state]);

  if (!currentUser || !['moderador', 'administrador', 'superadministrador'].includes(currentUser.role)) {
    return null;
  }

  const navItems: {
    id: AdminSection;
    label: string;
    icon: React.FC<{ className?: string }>;
    visible: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, visible: isAdmin },
    { id: 'emprendimientos', label: 'Emprendimientos', icon: Store, visible: true },
    { id: 'productos', label: 'Productos', icon: Package, visible: true },
    { id: 'denuncias', label: 'Denuncias', icon: Flag, visible: true },
    { id: 'ferias', label: 'Ferias', icon: Calendar, visible: isAdmin },
    { id: 'participantes', label: 'Participantes', icon: Users, visible: isAdmin },
    { id: 'taxonomias', label: 'Categorías y Localidades', icon: FolderTree, visible: isAdmin },
    { id: 'promociones', label: 'Promociones', icon: Tag, visible: isAdmin },
    { id: 'usuarios', label: 'Usuarios', icon: ShieldCheck, visible: isAdmin },
    { id: 'auditoria', label: 'Auditoría', icon: FileText, visible: isAdmin },
    { id: 'configuracion', label: 'Roles y Configuración', icon: Settings, visible: isSuper },
  ];

  const filteredEntrepreneurs = state.entrepreneurs.filter((e) => {
    if (e.deletedAt) return false;
    if (entStatusFilter === 'todos') return true;
    return e.status === entStatusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-100 shrink-0 flex flex-col justify-between">
        <div>
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-bold text-white">FeriaLocal</div>
              <div className="text-[11px] text-slate-400">
                {ROLE_LABELS[currentUser.role]}
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToPortal}
              className="lg:hidden inline-flex items-center gap-1 text-xs text-emerald-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>
          </div>

          <nav
            aria-label="Navegación administrativa"
            className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible"
          >
            {navItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-[#0F5C4D] text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-slate-800 space-y-2">
          <button
            type="button"
            onClick={onBackToPortal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver portal público</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              onBackToPortal();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-14 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Administración Central <span aria-hidden="true">/</span>{' '}
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
          </div>
          <div className="text-xs text-slate-500 font-mono-num">
            {stats.pendingEnts} pendientes · {state.reports.filter((r) => r.status === 'pendiente').length} denuncias
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl space-y-8">
          {/* DASHBOARD */}
          {section === 'dashboard' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard general</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Indicadores operativos de ferias, emprendedores y tráfico comercial.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Total vendedores</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {stats.activeVendors}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Emprendimientos activos</div>
                  <div className="text-2xl font-bold font-mono-num text-emerald-700 mt-1">
                    {stats.activeEnts}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Pendientes de aprobación</div>
                  <div className="text-2xl font-bold font-mono-num text-amber-700 mt-1">
                    {stats.pendingEnts}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Total de ferias</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {stats.totalFairs}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Productos publicados</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {stats.publishedProds}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Promociones activas</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {stats.activePromos}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Visitas generales</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {stats.totalVisits}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Clics en WhatsApp</div>
                  <div className="text-2xl font-bold font-mono-num text-[#15803D] mt-1">
                    {stats.totalWaClicks}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
                <div className="divide-y divide-slate-100 text-xs">
                  {state.auditLogs.slice(0, 6).map((log) => (
                    <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-semibold text-slate-900">{log.actorName}</span>{' '}
                        <span className="text-slate-600">— {log.summary}</span>
                      </div>
                      <span className="font-mono-num text-[11px] text-slate-400 shrink-0">
                        {log.createdAt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* EMPRENDIMIENTOS (MODERACIÓN + ADMIN) */}
          {section === 'emprendimientos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Moderación de emprendimientos</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aprobá nuevas fichas, suspendé publicaciones o configurá destacados en portada.
                  </p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs">
                  {(['todos', 'pendiente', 'publicado', 'suspendido', 'rechazado'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEntStatusFilter(st)}
                        className={`px-2.5 py-1 rounded capitalize font-medium ${
                          entStatusFilter === st
                            ? 'bg-[#0F5C4D] text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Emprendimiento</th>
                        <th className="py-2.5 px-4">Rubro / Localidad</th>
                        <th className="py-2.5 px-4">Estado</th>
                        <th className="py-2.5 px-4">Motivo / Nota</th>
                        <th className="py-2.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {filteredEntrepreneurs.map((ent) => {
                        const cat = state.categories.find((c) => c.id === ent.primaryCategoryId);
                        const loc = state.locations.find((l) => l.id === ent.locationId);
                        return (
                          <tr key={ent.id}>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{ent.commercialName}</div>
                              <div className="text-[11px] text-slate-500">
                                {ent.ownerName} · {ent.whatsapp}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {cat?.name} · {loc?.name}
                            </td>
                            <td className="py-3 px-4 capitalize font-semibold">
                              <span
                                className={
                                  ent.status === 'publicado'
                                    ? 'text-emerald-700'
                                    : ent.status === 'pendiente'
                                    ? 'text-amber-700'
                                    : 'text-red-700'
                                }
                              >
                                {ent.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={rejectionReasons[ent.id] ?? ent.rejectionReason ?? ''}
                                onChange={(e) =>
                                  setRejectionReasons((prev) => ({
                                    ...prev,
                                    [ent.id]: e.target.value,
                                  }))
                                }
                                placeholder="Motivo opcional"
                                className="w-40 px-2 py-1 text-xs border border-slate-200 rounded"
                              />
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => moderateEntrepreneurStatus(ent.id, 'publicado')}
                                className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-medium"
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  moderateEntrepreneurStatus(
                                    ent.id,
                                    'suspendido',
                                    rejectionReasons[ent.id] || 'Suspendido por moderación'
                                  )
                                }
                                className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded text-[11px] font-medium"
                              >
                                Suspender
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  moderateEntrepreneurStatus(
                                    ent.id,
                                    'rechazado',
                                    rejectionReasons[ent.id] || 'No cumple requisitos'
                                  )
                                }
                                className="px-2.5 py-1 bg-red-50 text-red-700 rounded text-[11px] font-medium"
                              >
                                Rechazar
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => toggleEntrepreneurFeatured(ent.id)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                                    ent.featured
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {ent.featured ? 'Destacado' : 'Destacar'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTOS (MODERACIÓN) */}
          {section === 'productos' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Supervisión de productos</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ocultá contenido inapropiado o revisá precios del catálogo general.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-4">Producto</th>
                      <th className="py-2.5 px-4">Emprendimiento</th>
                      <th className="py-2.5 px-4 text-right">Precio</th>
                      <th className="py-2.5 px-4">Estado</th>
                      <th className="py-2.5 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {state.products
                      .filter((p) => !p.deletedAt)
                      .map((p) => {
                        const ent = state.entrepreneurs.find((e) => e.id === p.entrepreneurId);
                        return (
                          <tr key={p.id}>
                            <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                            <td className="py-3 px-4 text-slate-600">{ent?.commercialName}</td>
                            <td className="py-3 px-4 text-right font-mono-num">
                              {formatARS(p.promoPrice || p.price)}
                            </td>
                            <td className="py-3 px-4 capitalize font-medium">
                              {p.publishStatus}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  updateProduct(p.id, {
                                    publishStatus:
                                      p.publishStatus === 'publicado' ? 'oculto' : 'publicado',
                                  })
                                }
                                className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800"
                              >
                                {p.publishStatus === 'publicado' ? 'Ocultar' : 'Publicar'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DENUNCIAS */}
          {section === 'denuncias' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Gestión de denuncias</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reportes enviados por visitantes sobre publicaciones o datos desactualizados.
                </p>
              </div>
              <div className="space-y-3">
                {state.reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-slate-500">
                        {rep.targetType.toUpperCase()} · Reportado el {rep.createdAt} · {rep.reporterEmail}
                      </div>
                      <div className="text-base font-semibold text-slate-900">
                        {rep.targetName} — <span className="text-red-700">{rep.reason}</span>
                      </div>
                      <p className="text-xs text-slate-600">{rep.details}</p>
                      <div className="text-xs font-medium text-slate-800 pt-1">
                        Estado actual: <span className="uppercase">{rep.status}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <input
                        type="text"
                        value={reportNotes[rep.id] ?? rep.moderatorNote ?? ''}
                        onChange={(e) =>
                          setReportNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))
                        }
                        placeholder="Nota de resolución"
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                      />
                      {(['revisada', 'resuelta', 'desestimada'] as ReportStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            resolveReport(
                              rep.id,
                              st,
                              reportNotes[rep.id] || `Marcada como ${st}`
                            )
                          }
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-100 capitalize"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'ferias' && isAdmin && <AdminFairsTab />}
          {section === 'participantes' && isAdmin && <AdminParticipantsTab />}
          {section === 'taxonomias' && isAdmin && <AdminCategoriesLocationsTab />}
          {section === 'promociones' && isAdmin && <AdminPromotionsTab />}

          {/* USUARIOS */}
          {section === 'usuarios' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Usuarios y planes</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Administrá roles de acceso, estado de cuenta y planes comerciales futuros.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Usuario</th>
                        <th className="py-2.5 px-4">Rol</th>
                        <th className="py-2.5 px-4">Plan comercial</th>
                        <th className="py-2.5 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {state.users.map((u) => (
                        <tr key={u.id}>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              disabled={u.role === 'superadministrador' && !isSuper}
                              onChange={(e) =>
                                updateUserRoleOrActive(u.id, { role: e.target.value as UserRole })
                              }
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                            >
                              {Object.entries(ROLE_LABELS).map(([k, label]) => (
                                <option key={k} value={k}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={u.plan}
                              onChange={(e) =>
                                updateUserRoleOrActive(u.id, { plan: e.target.value as PlanTier })
                              }
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white capitalize"
                            >
                              <option value="gratuito">Gratuito</option>
                              <option value="emprendedor">Emprendedor</option>
                              <option value="destacado">Destacado</option>
                              <option value="organizador">Organizador</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() =>
                                updateUserRoleOrActive(u.id, { active: !u.active })
                              }
                              className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                                u.active
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {u.active ? 'Activo' : 'Suspendido'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AUDITORÍA */}
          {section === 'auditoria' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Registro de auditoría</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trazabilidad histórica de acciones administrativas, moderación y cambios de configuración.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-4">Fecha / Hora</th>
                        <th className="py-2.5 px-4">Actor</th>
                        <th className="py-2.5 px-4">Acción</th>
                        <th className="py-2.5 px-4">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {state.auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-4 font-mono-num text-slate-500 whitespace-nowrap">
                            {log.createdAt}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-slate-900">{log.actorName}</span>{' '}
                            <span className="text-[11px] text-slate-500">({log.actorRole})</span>
                          </td>
                          <td className="py-2.5 px-4 font-mono-num text-[11px] text-[#0F5C4D]">
                            {log.action}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700">{log.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUPERADMIN: ROLES Y CONFIGURACIÓN */}
          {section === 'configuracion' && isSuper && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    Configuración global y matriz de permisos
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Acceso exclusivo Superadministrador.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetPlatformData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border border-slate-300 bg-white hover:bg-slate-100 rounded-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer datos piloto</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-900">Parámetros generales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Límite de carga de imágenes (MB)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={state.config.maxUploadSizeMb}
                      onChange={(e) =>
                        updateSystemConfig({ maxUploadSizeMb: Number(e.target.value) || 4 })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Máximo de productos en Plan Gratuito
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={state.config.maxProductsFreePlan}
                      onChange={(e) =>
                        updateSystemConfig({ maxProductsFreePlan: Number(e.target.value) || 12 })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono-num"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-2 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.config.requireEmailVerification}
                      onChange={(e) =>
                        updateSystemConfig({ requireEmailVerification: e.target.checked })
                      }
                    />
                    <span>Exigir verificación de correo electrónico</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.config.autoApproveEntrepreneurs}
                      onChange={(e) =>
                        updateSystemConfig({ autoApproveEntrepreneurs: e.target.checked })
                      }
                    />
                    <span>Auto-aprobar emprendimientos nuevos</span>
                  </label>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Roles y permisos del sistema
                </h2>
                <div className="space-y-3">
                  {state.rolePermissions.map((rp) => (
                    <div
                      key={rp.role}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-900">{rp.label}</div>
                        <div className="text-[11px] font-mono-num text-slate-500">
                          {rp.permissions.length} permisos
                        </div>
                      </div>
                      <p className="text-xs text-slate-600">{rp.description}</p>
                      <div className="text-[11px] font-mono-num text-slate-700 pt-1">
                        {rp.permissions.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
