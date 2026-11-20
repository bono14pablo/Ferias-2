import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Store,
  X,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SEED_MEDIA } from '../../data/seedMedia';
import { Product } from '../../types/platform';
import {
  buildWhatsAppUrl,
  filterActiveFairs,
  filterPublicProducts,
  formatARS,
  isPromotionCurrentlyActive,
} from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';

interface PublicPortalProps {
  onSelectEntrepreneur: (slug: string) => void;
  onSelectFair: (slug: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenRegisterVendor: () => void;
  onRequireAuth: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onSelectEntrepreneur,
  onSelectFair,
  onSelectProduct,
  onOpenRegisterVendor,
  onRequireAuth,
}) => {
  const {
    state,
    currentUser,
    toggleFavorite,
    recordContactClick,
  } = usePlatform();

  const [query, setQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [selectedFairId, setSelectedFairId] = useState<string>('all');
  const [showAllEntrepreneurs, setShowAllEntrepreneurs] = useState(false);

  const activeCategories = useMemo(
    () => state.categories.filter((c) => c.active),
    [state.categories]
  );

  const activeLocations = useMemo(
    () => state.locations.filter((l) => l.active),
    [state.locations]
  );

  const activeFairs = useMemo(
    () => filterActiveFairs(state.fairs),
    [state.fairs]
  );

  const publishedEntrepreneurs = useMemo(
    () =>
      state.entrepreneurs.filter(
        (e) => !e.deletedAt && e.status === 'publicado'
      ),
    [state.entrepreneurs]
  );

  const publicProducts = useMemo(
    () => filterPublicProducts(state.products, state.entrepreneurs),
    [state.products, state.entrepreneurs]
  );

  // Active, non-expired promotions only (acceptance criterion #10)
  const activePromotions = useMemo(() => {
    const publishedIds = new Set(publishedEntrepreneurs.map((e) => e.id));
    return state.promotions
      .filter((pr) => isPromotionCurrentlyActive(pr) && publishedIds.has(pr.entrepreneurId))
      .sort((a, b) => Number(b.featuredByAdmin) - Number(a.featuredByAdmin));
  }, [state.promotions, publishedEntrepreneurs]);

  const normalizedQuery = query.trim().toLowerCase();

  // Map entrepreneur -> participating fairs
  const entrepreneurFairIds = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const pt of state.participants) {
      if (pt.status === 'aprobada') {
        const list = map.get(pt.entrepreneurId) || [];
        list.push(pt.fairId);
        map.set(pt.entrepreneurId, list);
      }
    }
    return map;
  }, [state.participants]);

  const filteredEntrepreneurs = useMemo(() => {
    return publishedEntrepreneurs.filter((ent) => {
      if (
        selectedCategoryId !== 'all' &&
        ent.primaryCategoryId !== selectedCategoryId &&
        !ent.secondaryCategoryIds.includes(selectedCategoryId)
      ) {
        return false;
      }
      if (selectedLocationId !== 'all' && ent.locationId !== selectedLocationId) {
        return false;
      }
      if (selectedFairId !== 'all') {
        const fairs = entrepreneurFairIds.get(ent.id) || [];
        if (!fairs.includes(selectedFairId)) return false;
      }
      if (!normalizedQuery) return true;

      const catName =
        state.categories.find((c) => c.id === ent.primaryCategoryId)?.name.toLowerCase() || '';
      const locName =
        state.locations.find((l) => l.id === ent.locationId)?.name.toLowerCase() || '';
      const fairNames = (entrepreneurFairIds.get(ent.id) || [])
        .map((fid) => state.fairs.find((f) => f.id === fid)?.name.toLowerCase() || '')
        .join(' ');
      const ownProdNames = publicProducts
        .filter((p) => p.entrepreneurId === ent.id)
        .map((p) => p.name.toLowerCase())
        .join(' ');

      return (
        ent.commercialName.toLowerCase().includes(normalizedQuery) ||
        ent.description.toLowerCase().includes(normalizedQuery) ||
        catName.includes(normalizedQuery) ||
        locName.includes(normalizedQuery) ||
        fairNames.includes(normalizedQuery) ||
        ownProdNames.includes(normalizedQuery)
      );
    });
  }, [
    publishedEntrepreneurs,
    selectedCategoryId,
    selectedLocationId,
    selectedFairId,
    normalizedQuery,
    entrepreneurFairIds,
    state.categories,
    state.locations,
    state.fairs,
    publicProducts,
  ]);

  const filteredProducts = useMemo(() => {
    const allowedEntIds = new Set(filteredEntrepreneurs.map((e) => e.id));
    return publicProducts.filter((prod) => {
      const ent = publishedEntrepreneurs.find((e) => e.id === prod.entrepreneurId);
      if (!ent) return false;
      if (selectedCategoryId !== 'all' && prod.categoryId !== selectedCategoryId) {
        return false;
      }
      if (selectedLocationId !== 'all' && ent.locationId !== selectedLocationId) {
        return false;
      }
      if (selectedFairId !== 'all') {
        const fairs = entrepreneurFairIds.get(ent.id) || [];
        if (!fairs.includes(selectedFairId)) return false;
      }
      if (!normalizedQuery) return true;

      const catName =
        state.categories.find((c) => c.id === prod.categoryId)?.name.toLowerCase() || '';
      const locName =
        state.locations.find((l) => l.id === ent.locationId)?.name.toLowerCase() || '';
      const fairNames = (entrepreneurFairIds.get(ent.id) || [])
        .map((fid) => state.fairs.find((f) => f.id === fid)?.name.toLowerCase() || '')
        .join(' ');

      return (
        prod.name.toLowerCase().includes(normalizedQuery) ||
        prod.description.toLowerCase().includes(normalizedQuery) ||
        ent.commercialName.toLowerCase().includes(normalizedQuery) ||
        catName.includes(normalizedQuery) ||
        locName.includes(normalizedQuery) ||
        fairNames.includes(normalizedQuery) ||
        allowedEntIds.has(ent.id)
      );
    });
  }, [
    publicProducts,
    filteredEntrepreneurs,
    publishedEntrepreneurs,
    selectedCategoryId,
    selectedLocationId,
    selectedFairId,
    normalizedQuery,
    entrepreneurFairIds,
    state.categories,
    state.locations,
    state.fairs,
  ]);

  const hasActiveFilters =
    Boolean(normalizedQuery) ||
    selectedCategoryId !== 'all' ||
    selectedLocationId !== 'all' ||
    selectedFairId !== 'all';

  const displayedEntrepreneurs = useMemo(() => {
    const sorted = [...filteredEntrepreneurs].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
    if (hasActiveFilters || showAllEntrepreneurs) return sorted;
    return sorted.slice(0, 6);
  }, [filteredEntrepreneurs, hasActiveFilters, showAllEntrepreneurs]);

  const displayedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
    if (hasActiveFilters) return sorted;
    return sorted.slice(0, 6);
  }, [filteredProducts, hasActiveFilters]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategoryId('all');
    setSelectedLocationId('all');
    setSelectedFairId('all');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero + Buscador Principal + Banner Promocional */}
      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="text-xs font-medium text-[#0F5C4D]">
                  Directorio comercial de ferias y productores · Argentina
                </div>
                <h1
                  className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#141619] leading-[1.12] tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  Descubrí ferias locales, emprendedores y productos hechos a mano
                </h1>
                <p className="text-base text-[#4B5563] leading-relaxed max-w-xl">
                  Explorá catálogos reales de cerámica, cuero, alimentos regionales, textiles y cosmética natural en tu ciudad. Consultá disponibilidad y coordiná directo por WhatsApp.
                </p>
              </div>

              {/* Buscador principal multifiltro */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E7EB] space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#5C636E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscá emprendimiento, producto, rubro, localidad o feria..."
                    aria-label="Buscador principal"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-xl focus:border-[#0F5C4D]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    aria-label="Filtrar por rubro"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="px-3 py-2 text-xs font-medium bg-white border border-[#D1D5DB] rounded-lg text-[#141619]"
                  >
                    <option value="all">Todos los rubros</option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filtrar por localidad"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    className="px-3 py-2 text-xs font-medium bg-white border border-[#D1D5DB] rounded-lg text-[#141619]"
                  >
                    <option value="all">Todas las localidades</option>
                    {activeLocations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.province})
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filtrar por feria"
                    value={selectedFairId}
                    onChange={(e) => setSelectedFairId(e.target.value)}
                    className="px-3 py-2 text-xs font-medium bg-white border border-[#D1D5DB] rounded-lg text-[#141619]"
                  >
                    <option value="all">Todas las ferias</option>
                    {activeFairs.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-1 text-xs text-[#5C636E]">
                    <span>
                      Resultados: <strong className="text-[#141619]">{filteredEntrepreneurs.length}</strong> emprendimientos ·{' '}
                      <strong className="text-[#141619]">{filteredProducts.length}</strong> productos
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 font-medium text-[#0F5C4D] hover:underline"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Limpiar filtros</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-[#E5E7EB] relative bg-[#EFECE6]">
                <SafeImage
                  src={SEED_MEDIA.heroFeria}
                  alt="Feria artesanal al aire libre en plaza argentina"
                  className="w-full h-full lg:h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs font-medium text-white/85">
                    Lanzamiento piloto · Fin de semana en plaza
                  </div>
                  <div className="text-lg sm:text-xl font-bold mt-1">
                    {activeFairs[0]?.name || 'Ferias activas de tu localidad'}
                  </div>
                  {activeFairs[0] && (
                    <button
                      type="button"
                      onClick={() => onSelectFair(activeFairs[0].slug)}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:underline self-start"
                    >
                      <span>Ver puestos, mapa y horarios</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive category strip */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#0F5C4D] text-white border-[#0F5C4D]'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF]'
                }`}
              >
                Todos los rubros
              </button>
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategoryId((prev) => (prev === cat.id ? 'all' : cat.id))
                  }
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg border whitespace-nowrap shrink-0 transition-colors ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#0F5C4D] text-white border-[#0F5C4D]'
                      : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#9CA3AF]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emprendimientos Destacados / Resultados */}
      <section id="emprendimientos" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141619]">
              {hasActiveFilters ? 'Emprendimientos encontrados' : 'Emprendimientos destacados'}
            </h2>
            <p className="text-sm text-[#5C636E] mt-1">
              {filteredEntrepreneurs.length} negocios locales activos con contacto directo
            </p>
          </div>
          {!hasActiveFilters && filteredEntrepreneurs.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllEntrepreneurs((v) => !v)}
              className="text-sm font-medium text-[#0F5C4D] hover:underline whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              {showAllEntrepreneurs
                ? 'Mostrar solo destacados'
                : `Ver los ${filteredEntrepreneurs.length} emprendimientos`}
            </button>
          )}
        </div>

        {displayedEntrepreneurs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center space-y-3">
            <p className="text-sm text-[#5C636E]">
              No encontramos emprendimientos que coincidan con tu búsqueda actual.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-xs font-medium bg-[#0F5C4D] text-white rounded-lg"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedEntrepreneurs.map((ent) => {
              const cat = state.categories.find((c) => c.id === ent.primaryCategoryId);
              const loc = state.locations.find((l) => l.id === ent.locationId);
              const isFav = currentUser
                ? state.favorites.some(
                    (f) => f.userId === currentUser.id && f.entrepreneurId === ent.id
                  )
                : false;

              return (
                <article
                  key={ent.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:border-[#9CA3AF] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectEntrepreneur(ent.slug)}
                    className="aspect-[16/10] w-full bg-[#EFECE6] overflow-hidden relative text-left"
                  >
                    <SafeImage
                      src={ent.coverUrl}
                      alt={ent.commercialName}
                      fallbackLabel={ent.commercialName}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-xs text-[#5C636E] flex items-center gap-1.5 truncate">
                        <span className="truncate">{cat?.name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{loc?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectEntrepreneur(ent.slug)}
                        className="text-lg font-semibold text-[#141619] hover:text-[#0F5C4D] text-left mt-1 block truncate w-full"
                      >
                        {ent.commercialName}
                      </button>
                      <p className="text-xs text-[#5C636E] mt-1.5 line-clamp-2 leading-relaxed">
                        {ent.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectEntrepreneur(ent.slug)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141619] hover:text-[#0F5C4D]"
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Ver ficha</span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser) {
                              onRequireAuth();
                              return;
                            }
                            toggleFavorite(ent.id);
                          }}
                          aria-label={isFav ? 'Quitar de favoritos' : 'Guardar favorito'}
                          className="p-1.5 rounded-lg text-[#5C636E] hover:bg-[#F3F2EE]"
                        >
                          <Heart
                            className={`w-4 h-4 ${isFav ? 'fill-[#0F5C4D] text-[#0F5C4D]' : ''}`}
                          />
                        </button>
                        <a
                          href={buildWhatsAppUrl(ent.whatsapp, ent.commercialName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => recordContactClick(ent.id, 'whatsapp')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#15803D] bg-[#15803D]/10 hover:bg-[#15803D] hover:text-white rounded-lg transition-colors whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Productos Destacados */}
      <section id="productos" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#141619]">
              {hasActiveFilters ? 'Productos coincidentes' : 'Productos destacados'}
            </h2>
            <p className="text-sm text-[#5C636E] mt-1">
              Precios directos de productor. Consultá stock o encargos por WhatsApp.
            </p>
          </div>
        </div>

        {displayedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center text-sm text-[#5C636E]">
            No hay productos publicados para los filtros seleccionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((prod) => {
              const ent = publishedEntrepreneurs.find((e) => e.id === prod.entrepreneurId);
              if (!ent) return null;
              const cat = state.categories.find((c) => c.id === prod.categoryId);

              return (
                <article
                  key={prod.id}
                  className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:border-[#9CA3AF] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(prod)}
                    className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden"
                  >
                    <SafeImage
                      src={prod.images[0]?.url}
                      alt={prod.name}
                      fallbackLabel={prod.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </button>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-xs text-[#5C636E] truncate">
                        {cat?.name} · {ent.commercialName}
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(prod)}
                        className="text-base font-semibold text-[#141619] hover:text-[#0F5C4D] text-left mt-1 line-clamp-1"
                      >
                        {prod.name}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold font-mono-num text-[#141619]">
                          {formatARS(prod.promoPrice || prod.price)}
                        </span>
                        {prod.promoPrice && (
                          <span className="text-xs font-mono-num text-[#5C636E] line-through">
                            {formatARS(prod.price)}
                          </span>
                        )}
                      </div>
                      <a
                        href={buildWhatsAppUrl(ent.whatsapp, ent.commercialName, prod.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordContactClick(ent.id, 'whatsapp', prod.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#15803D] bg-[#15803D]/10 hover:bg-[#15803D] hover:text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Consultar</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Ferias Próximas y Activas */}
      <section id="ferias" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#141619]">
            Ferias activas y próximas fechas
          </h2>
          <p className="text-sm text-[#5C636E] mt-1">
            Consultá ubicación exacta en mapa, horarios y emprendimientos participantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeFairs.map((fair) => {
            const loc = state.locations.find((l) => l.id === fair.locationId);
            const participantCount = state.participants.filter(
              (pt) => pt.fairId === fair.id && pt.status === 'aprobada'
            ).length;

            return (
              <article
                key={fair.id}
                className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:border-[#0F5C4D] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onSelectFair(fair.slug)}
                  className="aspect-[16/10] w-full bg-[#EFECE6] overflow-hidden"
                >
                  <SafeImage
                    src={fair.mainImageUrl}
                    alt={fair.name}
                    fallbackLabel={fair.name}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[#0F5C4D]">
                      {fair.status === 'activa' ? 'Activa' : 'Próxima'} · {loc?.name}, {fair.province}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectFair(fair.slug)}
                      className="text-lg font-semibold text-[#141619] hover:text-[#0F5C4D] text-left block"
                    >
                      {fair.name}
                    </button>
                    <p className="text-xs text-[#5C636E] line-clamp-2">{fair.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E5E7EB] text-xs text-[#4B5563]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#0F5C4D] shrink-0" />
                      <span className="truncate">
                        {fair.operatingDays} · {fair.hours}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[#5C636E]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="font-mono-num">{participantCount}</span> puestos confirmados
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectFair(fair.slug)}
                        className="font-semibold text-[#0F5C4D] hover:underline whitespace-nowrap"
                      >
                        Ver feria
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Promociones Vigentes (auto-oculta vencidas) */}
      <section id="promociones" className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#141619]">
            Promociones vigentes
          </h2>
          <p className="text-sm text-[#5C636E] mt-1">
            Ofertas temporales activas publicadas por los emprendedores. Las promociones vencidas se ocultan automáticamente.
          </p>
        </div>

        {activePromotions.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center text-sm text-[#5C636E]">
            No hay promociones vigentes en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePromotions.map((promo) => {
              const ent = publishedEntrepreneurs.find((e) => e.id === promo.entrepreneurId);
              if (!ent) return null;
              return (
                <article
                  key={promo.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="sm:w-44 h-44 sm:h-auto shrink-0 bg-[#EFECE6]">
                    <SafeImage
                      src={promo.imageUrl}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-[#0F5C4D]">
                        Válida hasta {promo.endDate} · {ent.commercialName}
                      </div>
                      <h3 className="text-base font-semibold text-[#141619] mt-1">
                        {promo.title}
                      </h3>
                      <p className="text-xs text-[#5C636E] mt-1 line-clamp-2">
                        {promo.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB]">
                      <button
                        type="button"
                        onClick={() => onSelectEntrepreneur(ent.slug)}
                        className="text-xs font-medium text-[#141619] hover:text-[#0F5C4D]"
                      >
                        Ver emprendimiento
                      </button>
                      <a
                        href={buildWhatsAppUrl(
                          ent.whatsapp,
                          ent.commercialName,
                          undefined,
                          promo.title
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordContactClick(ent.id, 'whatsapp', promo.productId)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Aprovechar por WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Sección Sumate / Registrar emprendimiento */}
      <section id="sumate" className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="bg-[#141619] text-white rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-medium text-emerald-300">
              Para feriantes, artesanos y productores locales
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold leading-snug">
              ¿Tenés un emprendimiento? Creá tu espacio digital sin costo inicial
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Administrá tu catálogo de productos con fotos, publicá promociones temporales, postulate a ferias de tu localidad y recibí consultas directas en tu WhatsApp sin intermediarios ni comisiones.
            </p>
          </div>
          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenRegisterVendor}
              className="px-6 py-3.5 bg-[#0F5C4D] hover:bg-[#137360] text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Registrar mi emprendimiento
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-[#5C636E]">
          <div className="space-y-1">
            <div className="font-display text-base font-bold text-[#141619]">FeriaLocal</div>
            <p>
              Plataforma Digital de Ferias y Emprendedores · Piloto Argentina (San Isidro, Tandil, Córdoba, Rosario)
            </p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="#emprendimientos" className="hover:text-[#141619]">Emprendimientos</a>
            <a href="#productos" className="hover:text-[#141619]">Productos</a>
            <a href="#ferias" className="hover:text-[#141619]">Ferias</a>
            <a href="#promociones" className="hover:text-[#141619]">Promociones</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
