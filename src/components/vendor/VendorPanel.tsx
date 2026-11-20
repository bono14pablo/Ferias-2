import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Home,
  LogOut,
  Package,
  Plus,
  Store,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SEED_MEDIA } from '../../data/seedMedia';
import {
  isPromotionCurrentlyActive,
  isPromotionExpired,
  readFileAsDataUrl,
  TODAY_ISO,
  validateImageFile,
} from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';
import { VendorProductsTab } from './VendorProductsTab';

type VendorSection =
  | 'inicio'
  | 'emprendimiento'
  | 'productos'
  | 'promociones'
  | 'ferias'
  | 'estadisticas'
  | 'cuenta';

interface VendorPanelProps {
  onBackToPortal: () => void;
  onViewPublicStorefront: (slug: string) => void;
}

export const VendorPanel: React.FC<VendorPanelProps> = ({
  onBackToPortal,
  onViewPublicStorefront,
}) => {
  const {
    state,
    currentUser,
    ownEntrepreneur,
    upsertOwnEntrepreneur,
    createOrUpdatePromotion,
    softDeletePromotion,
    requestFairParticipation,
    verifyCurrentUserEmail,
    logout,
  } = usePlatform();

  const [section, setSection] = useState<VendorSection>('inicio');

  // Form state for "Mi emprendimiento"
  const [commercialName, setCommercialName] = useState(ownEntrepreneur?.commercialName || '');
  const [ownerName, setOwnerName] = useState(
    ownEntrepreneur?.ownerName || currentUser?.name || ''
  );
  const [description, setDescription] = useState(ownEntrepreneur?.description || '');
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    ownEntrepreneur?.primaryCategoryId || state.categories[0]?.id || ''
  );
  const [locationId, setLocationId] = useState(
    ownEntrepreneur?.locationId || state.locations[0]?.id || ''
  );
  const [address, setAddress] = useState(ownEntrepreneur?.address || '');
  const [phone, setPhone] = useState(ownEntrepreneur?.phone || '');
  const [whatsapp, setWhatsapp] = useState(ownEntrepreneur?.whatsapp || '');
  const [instagram, setInstagram] = useState(ownEntrepreneur?.instagram || '');
  const [facebook, setFacebook] = useState(ownEntrepreneur?.facebook || '');
  const [hours, setHours] = useState(ownEntrepreneur?.hours || 'Sáb y Dom 10:30 a 19:00 hs');
  const [logoUrl, setLogoUrl] = useState(ownEntrepreneur?.logoUrl || SEED_MEDIA.ceramica);
  const [coverUrl, setCoverUrl] = useState(ownEntrepreneur?.coverUrl || SEED_MEDIA.heroFeria);
  const [entFeedback, setEntFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  // Form state for "Mis promociones"
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoProductId, setPromoProductId] = useState('');
  const [promoStart, setPromoStart] = useState(TODAY_ISO);
  const [promoEnd, setPromoEnd] = useState('2026-12-31');
  const [promoImageUrl, setPromoImageUrl] = useState<string>(SEED_MEDIA.ceramica);
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);

  // Fair request note
  const [fairRequestNotes, setFairRequestNotes] = useState<Record<string, string>>({});

  const ownProducts = useMemo(
    () =>
      ownEntrepreneur
        ? state.products.filter((p) => p.entrepreneurId === ownEntrepreneur.id && !p.deletedAt)
        : [],
    [ownEntrepreneur, state.products]
  );

  const publishedProductsCount = ownProducts.filter(
    (p) => p.publishStatus === 'publicado'
  ).length;

  const ownPromotions = useMemo(
    () =>
      ownEntrepreneur
        ? state.promotions.filter((pr) => pr.entrepreneurId === ownEntrepreneur.id && !pr.deletedAt)
        : [],
    [ownEntrepreneur, state.promotions]
  );

  const activePromotionsCount = ownPromotions.filter((pr) =>
    isPromotionCurrentlyActive(pr)
  ).length;

  const ownParticipations = useMemo(
    () =>
      ownEntrepreneur
        ? state.participants.filter((pt) => pt.entrepreneurId === ownEntrepreneur.id)
        : [],
    [ownEntrepreneur, state.participants]
  );

  const profileVisits = useMemo(
    () =>
      ownEntrepreneur
        ? state.visits.filter((v) => v.entrepreneurId === ownEntrepreneur.id)
        : [],
    [ownEntrepreneur, state.visits]
  );

  const whatsappClicks = useMemo(
    () =>
      ownEntrepreneur
        ? state.contactClicks.filter(
            (c) => c.entrepreneurId === ownEntrepreneur.id && c.channel === 'whatsapp'
          )
        : [],
    [ownEntrepreneur, state.contactClicks]
  );

  if (!currentUser || currentUser.role !== 'vendedor') {
    return null;
  }

  const menuItems: { id: VendorSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'emprendimiento', label: 'Mi emprendimiento', icon: Store },
    { id: 'productos', label: 'Mis productos', icon: Package },
    { id: 'promociones', label: 'Mis promociones', icon: Tag },
    { id: 'ferias', label: 'Mis ferias', icon: Calendar },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'cuenta', label: 'Mi cuenta', icon: User },
  ];

  const handleUploadEntImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'cover'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, state.config.maxUploadSizeMb);
    if (!validation.valid) {
      setEntFeedback({ ok: false, text: validation.error || 'Archivo inválido.' });
      return;
    }
    const url = await readFileAsDataUrl(file);
    if (target === 'logo') setLogoUrl(url);
    else setCoverUrl(url);
  };

  const handleSaveEntrepreneur = (e: React.FormEvent) => {
    e.preventDefault();
    const res = upsertOwnEntrepreneur({
      commercialName: commercialName.trim(),
      ownerName: ownerName.trim(),
      description: description.trim(),
      logoUrl,
      coverUrl,
      primaryCategoryId,
      secondaryCategoryIds: [],
      locationId,
      address: address.trim() || undefined,
      phone: phone.trim() || whatsapp.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram.trim() || undefined,
      facebook: facebook.trim() || undefined,
      hours: hours.trim(),
    });
    setEntFeedback({ ok: res.ok, text: res.message });
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createOrUpdatePromotion({
      title: promoTitle.trim(),
      description: promoDesc.trim(),
      productId: promoProductId || undefined,
      imageUrl: promoImageUrl,
      startDate: promoStart,
      endDate: promoEnd,
      status: 'activa',
    });
    if (!res.ok) {
      setPromoFeedback(res.message);
      return;
    }
    setPromoTitle('');
    setPromoDesc('');
    setPromoFeedback(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar Desktop + Mobile Top Nav */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-100 shrink-0 flex flex-col justify-between">
        <div>
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-bold text-white">FeriaLocal</div>
              <div className="text-[11px] text-slate-400">Panel del vendedor</div>
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
            aria-label="Menú del vendedor"
            className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 truncate">
            Panel del Vendedor <span aria-hidden="true">/</span>{' '}
            <span className="font-semibold text-slate-900">
              {ownEntrepreneur?.commercialName || currentUser.name}
            </span>
          </div>
          {ownEntrepreneur && ownEntrepreneur.status === 'publicado' && (
            <button
              type="button"
              onClick={() => onViewPublicStorefront(ownEntrepreneur.slug)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5C4D] hover:underline whitespace-nowrap shrink-0"
            >
              <span>Ver mi ficha pública</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </header>

        <div className="p-4 sm:p-8 max-w-5xl space-y-8">
          {/* INICIO */}
          {section === 'inicio' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Hola, {currentUser.name}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Resumen de actividad de tu espacio comercial.
                </p>
              </div>

              {!ownEntrepreneur && (
                <div className="bg-white rounded-xl border border-amber-300 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Completá la ficha de tu emprendimiento
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Para publicar productos, crear promociones y postularte a ferias primero registrá tu nombre comercial y WhatsApp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSection('emprendimiento')}
                    className="px-4 py-2 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg whitespace-nowrap"
                  >
                    Registrar emprendimiento
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Estado del emprendimiento</div>
                  <div className="text-lg font-bold text-slate-900 mt-1 capitalize">
                    {ownEntrepreneur ? ownEntrepreneur.status : 'Sin registrar'}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Productos publicados</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {publishedProductsCount}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Visitas al perfil</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {profileVisits.length}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Consultas por WhatsApp</div>
                  <div className="text-2xl font-bold font-mono-num text-[#15803D] mt-1">
                    {whatsappClicks.length}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Promociones activas</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {activePromotionsCount}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="text-xs text-slate-500">Solicitudes de participación</div>
                  <div className="text-2xl font-bold font-mono-num text-slate-900 mt-1">
                    {ownParticipations.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MI EMPRENDIMIENTO */}
          {section === 'emprendimiento' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mi emprendimiento</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Estado actual:{' '}
                  <strong className="text-slate-800 uppercase">
                    {ownEntrepreneur?.status || 'Nuevo registro (requiere aprobación de moderación)'}
                  </strong>
                </p>
              </div>

              {entFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    entFeedback.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {entFeedback.text}
                </div>
              )}

              <form
                onSubmit={handleSaveEntrepreneur}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre comercial
                    </label>
                    <input
                      type="text"
                      required
                      value={commercialName}
                      onChange={(e) => setCommercialName(e.target.value)}
                      placeholder="Ej. Taller Barro del Sur"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Nombre del responsable
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Categoría principal
                    </label>
                    <select
                      value={primaryCategoryId}
                      onChange={(e) => setPrimaryCategoryId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {state.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Localidad
                    </label>
                    <select
                      value={locationId}
                      onChange={(e) => setLocationId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                      {state.locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.province})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      WhatsApp (con código de país/área)
                    </label>
                    <input
                      type="text"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+54 9 11 5532-4410"
                      className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="11 5532-4410"
                      className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Instagram (opcional)
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@miemprendimiento"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Facebook (opcional)
                    </label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Dirección comercial opcional
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej. Primera Junta 412"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Horarios de atención
                    </label>
                    <input
                      type="text"
                      required
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Descripción comercial
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contale a los visitantes qué elaborás, materiales, historia y forma de entrega..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                      <SafeImage src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Logo</div>
                      <label className="text-xs text-[#0F5C4D] font-medium hover:underline cursor-pointer">
                        <span>Cambiar imagen</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUploadEntImage(e, 'logo')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                      <SafeImage src={coverUrl} alt="Portada" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Imagen de portada</div>
                      <label className="text-xs text-[#0F5C4D] font-medium hover:underline cursor-pointer">
                        <span>Cambiar portada</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleUploadEntImage(e, 'cover')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg"
                  >
                    Guardar ficha comercial
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MIS PRODUCTOS */}
          {section === 'productos' && <VendorProductsTab />}

          {/* MIS PROMOCIONES */}
          {section === 'promociones' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mis promociones</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Las promociones cuya fecha de finalización ya pasó se ocultan automáticamente del portal público.
                </p>
              </div>

              {!ownEntrepreneur ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-600">
                  Primero completá los datos de tu emprendimiento para publicar promociones.
                </div>
              ) : (
                <>
                  <form
                    onSubmit={handleCreatePromo}
                    className="bg-white rounded-xl border border-slate-200 p-5 space-y-4"
                  >
                    <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0F5C4D]" />
                      <span>Nueva promoción temporal</span>
                    </h2>
                    {promoFeedback && (
                      <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                        {promoFeedback}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Título
                        </label>
                        <input
                          type="text"
                          required
                          value={promoTitle}
                          onChange={(e) => setPromoTitle(e.target.value)}
                          placeholder="Ej. 20% OFF en combos de feria"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Producto relacionado (opcional)
                        </label>
                        <select
                          value={promoProductId}
                          onChange={(e) => setPromoProductId(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="">Ninguno / Toda la tienda</option>
                          {ownProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Fecha de inicio
                        </label>
                        <input
                          type="date"
                          required
                          value={promoStart}
                          onChange={(e) => setPromoStart(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Fecha de finalización
                        </label>
                        <input
                          type="date"
                          required
                          value={promoEnd}
                          onChange={(e) => setPromoEnd(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Descripción de la oferta
                      </label>
                      <input
                        type="text"
                        required
                        value={promoDesc}
                        onChange={(e) => setPromoDesc(e.target.value)}
                        placeholder="Condiciones, medios de pago o fechas válidas..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={promoImageUrl}
                        onChange={(e) => setPromoImageUrl(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value={SEED_MEDIA.ceramica}>Imagen Cerámica</option>
                        <option value={SEED_MEDIA.cuero}>Imagen Cuero</option>
                        <option value={SEED_MEDIA.dulces}>Imagen Alimentos</option>
                        <option value={SEED_MEDIA.velas}>Imagen Velas</option>
                        <option value={SEED_MEDIA.textil}>Imagen Textil</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg"
                      >
                        Publicar promoción
                      </button>
                    </div>
                  </form>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                          <th className="py-2.5 px-4">Promoción</th>
                          <th className="py-2.5 px-4">Vigencia</th>
                          <th className="py-2.5 px-4">Estado</th>
                          <th className="py-2.5 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs">
                        {ownPromotions.map((pr) => {
                          const expired = isPromotionExpired(pr);
                          const active = isPromotionCurrentlyActive(pr);
                          return (
                            <tr key={pr.id}>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900">{pr.title}</div>
                                <div className="text-[11px] text-slate-500">{pr.description}</div>
                              </td>
                              <td className="py-3 px-4 font-mono-num text-slate-600">
                                {pr.startDate} → {pr.endDate}
                              </td>
                              <td className="py-3 px-4">
                                {expired ? (
                                  <span className="text-slate-500 font-medium">
                                    Vencida (oculta del portal)
                                  </span>
                                ) : active ? (
                                  <span className="text-emerald-700 font-medium">Vigente</span>
                                ) : (
                                  <span className="text-amber-700 font-medium">Pausada</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => softDeletePromotion(pr.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MIS FERIAS */}
          {section === 'ferias' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mis ferias</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Podés participar en múltiples ferias simultáneamente enviando tu solicitud.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.fairs
                  .filter((f) => !f.deletedAt && f.status !== 'inactiva')
                  .map((fair) => {
                    const loc = state.locations.find((l) => l.id === fair.locationId);
                    const req = ownParticipations.find((pt) => pt.fairId === fair.id);
                    return (
                      <div
                        key={fair.id}
                        className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs text-[#0F5C4D] font-medium">
                            {loc?.name}, {fair.province} · {fair.operatingDays}
                          </div>
                          <h3 className="text-base font-semibold text-slate-900 mt-1">
                            {fair.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{fair.address}</p>
                        </div>

                        {req ? (
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                            <span className="font-semibold text-slate-800 uppercase">
                              Estado: {req.status}
                            </span>
                            {req.standNumber && (
                              <span className="font-mono-num text-[#0F5C4D]">
                                {req.standNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={fairRequestNotes[fair.id] || ''}
                              onChange={(e) =>
                                setFairRequestNotes((prev) => ({
                                  ...prev,
                                  [fair.id]: e.target.value,
                                }))
                              }
                              placeholder="Nota opcional para el organizador"
                              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              disabled={!ownEntrepreneur}
                              onClick={() =>
                                requestFairParticipation(fair.id, fairRequestNotes[fair.id])
                              }
                              className="px-3.5 py-1.5 bg-[#0F5C4D] disabled:opacity-40 text-white text-xs font-medium rounded-lg whitespace-nowrap"
                            >
                              Solicitar lugar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          {section === 'estadisticas' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Estadísticas</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visitas al perfil y clics registrados en tu botón de WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Origen de visitas al perfil ({profileVisits.length})
                  </h2>
                  <div className="space-y-2 text-xs">
                    {(['portal', 'buscador', 'feria'] as const).map((src) => {
                      const count = profileVisits.filter((v) => v.source === src).length;
                      return (
                        <div
                          key={src}
                          className="flex items-center justify-between py-2 border-b border-slate-100"
                        >
                          <span className="capitalize text-slate-600">{src}</span>
                          <span className="font-mono-num font-semibold text-slate-900">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Consultas por WhatsApp ({whatsappClicks.length})
                  </h2>
                  <div className="space-y-2 text-xs">
                    {ownProducts.slice(0, 5).map((p) => {
                      const clicks = whatsappClicks.filter((c) => c.productId === p.id).length;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between py-2 border-b border-slate-100"
                        >
                          <span className="text-slate-700 truncate pr-2">{p.name}</span>
                          <span className="font-mono-num font-semibold text-[#15803D]">
                            {clicks} clics
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MI CUENTA */}
          {section === 'cuenta' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mi cuenta y plan comercial</h1>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Titular</div>
                    <div className="font-semibold text-slate-900">{currentUser.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Correo electrónico</div>
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      <span>{currentUser.email}</span>
                      {currentUser.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verificado
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={verifyCurrentUserEmail}
                          className="text-xs text-[#0F5C4D] font-medium hover:underline"
                        >
                          Verificar ahora
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Plan actual</div>
                    <div className="font-semibold text-[#0F5C4D] capitalize">
                      Plan {currentUser.plan}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Límite de catálogo</div>
                    <div className="font-mono-num text-slate-900">
                      {currentUser.plan === 'gratuito'
                        ? `Hasta ${state.config.maxProductsFreePlan} productos`
                        : 'Productos ilimitados'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
