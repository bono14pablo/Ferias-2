import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Flag,
  Heart,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
  Calendar,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { Product } from '../../types/platform';
import {
  buildWhatsAppUrl,
  formatARS,
  isPromotionCurrentlyActive,
} from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';

interface EntrepreneurProfilePageProps {
  slug: string;
  onBack: () => void;
  onSelectFair: (fairSlug: string) => void;
  onSelectProduct: (product: Product) => void;
  onRequireAuth: () => void;
  onReportTarget: (target: { type: 'emprendimiento' | 'producto'; id: string; name: string }) => void;
}

export const EntrepreneurProfilePage: React.FC<EntrepreneurProfilePageProps> = ({
  slug,
  onBack,
  onSelectFair,
  onSelectProduct,
  onRequireAuth,
  onReportTarget,
}) => {
  const {
    state,
    currentUser,
    toggleFavorite,
    recordProfileVisit,
    recordContactClick,
  } = usePlatform();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const entrepreneur = state.entrepreneurs.find(
    (e) => e.slug === slug && !e.deletedAt && e.status === 'publicado'
  );

  useEffect(() => {
    if (entrepreneur) {
      recordProfileVisit(entrepreneur.id, 'portal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entrepreneur?.id]);

  const products = useMemo(() => {
    if (!entrepreneur) return [];
    return state.products.filter(
      (p) =>
        p.entrepreneurId === entrepreneur.id &&
        !p.deletedAt &&
        p.publishStatus === 'publicado'
    );
  }, [entrepreneur, state.products]);

  const activePromos = useMemo(() => {
    if (!entrepreneur) return [];
    return state.promotions.filter(
      (pr) => pr.entrepreneurId === entrepreneur.id && isPromotionCurrentlyActive(pr)
    );
  }, [entrepreneur, state.promotions]);

  if (!entrepreneur) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#141619]">Emprendimiento no disponible</h1>
        <p className="text-sm text-[#5C636E]">
          Es posible que el perfil esté pendiente de aprobación o ya no se encuentre publicado.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0F5C4D] text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al directorio</span>
        </button>
      </div>
    );
  }

  const primaryCat = state.categories.find((c) => c.id === entrepreneur.primaryCategoryId);
  const secondaryCats = state.categories.filter((c) =>
    entrepreneur.secondaryCategoryIds.includes(c.id)
  );
  const location = state.locations.find((l) => l.id === entrepreneur.locationId);

  const participatingFairs = state.participants
    .filter((pt) => pt.entrepreneurId === entrepreneur.id && pt.status === 'aprobada')
    .map((pt) => ({
      participant: pt,
      fair: state.fairs.find((f) => f.id === pt.fairId && !f.deletedAt),
    }))
    .filter((item) => item.fair);

  const isFav = currentUser
    ? state.favorites.some(
        (f) => f.userId === currentUser.id && f.entrepreneurId === entrepreneur.id
      )
    : false;

  const productCategories = Array.from(new Set(products.map((p) => p.categoryId)))
    .map((id) => state.categories.find((c) => c.id === id))
    .filter(Boolean);

  const filteredProducts =
    selectedCategoryId === 'all'
      ? products
      : products.filter((p) => p.categoryId === selectedCategoryId);

  const whatsappDirect = buildWhatsAppUrl(entrepreneur.whatsapp, entrepreneur.commercialName);

  const handleFavoriteClick = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    toggleFavorite(entrepreneur.id);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#141619] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al portal</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
              isFav
                ? 'border-[#0F5C4D] bg-[#0F5C4D]/10 text-[#0F5C4D]'
                : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#141619]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#0F5C4D]' : ''}`} />
            <span>{isFav ? 'Guardado en favoritos' : 'Guardar favorito'}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onReportTarget({
                type: 'emprendimiento',
                id: entrepreneur.id,
                name: entrepreneur.commercialName,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-white text-[#5C636E] hover:text-red-700 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reportar</span>
          </button>
        </div>
      </div>

      {/* Storefront header */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="h-52 sm:h-64 w-full relative bg-[#EFECE6]">
          <SafeImage
            src={entrepreneur.coverUrl}
            alt={`Portada de ${entrepreneur.commercialName}`}
            fallbackLabel={entrepreneur.commercialName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 -mt-14 sm:-mt-16 relative z-10 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white shrink-0">
                <SafeImage
                  src={entrepreneur.logoUrl}
                  alt={`Logo de ${entrepreneur.commercialName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-[#5C636E] flex flex-wrap items-center gap-2">
                  <span>{primaryCat?.name}</span>
                  {secondaryCats.map((sc) => (
                    <React.Fragment key={sc.id}>
                      <span aria-hidden="true">·</span>
                      <span>{sc.name}</span>
                    </React.Fragment>
                  ))}
                  {location && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {location.name}, {location.province}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#141619]">
                  {entrepreneur.commercialName}
                </h1>
                <p className="text-sm text-[#5C636E]">
                  Responsable: <span className="text-[#141619] font-medium">{entrepreneur.ownerName}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={whatsappDirect}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordContactClick(entrepreneur.id, 'whatsapp')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar por WhatsApp</span>
              </a>
              {entrepreneur.instagram && (
                <a
                  href={`https://instagram.com/${entrepreneur.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordContactClick(entrepreneur.id, 'instagram')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#E5E7EB] hover:border-[#141619] text-sm font-medium text-[#141619] rounded-xl transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{entrepreneur.instagram}</span>
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-[#E5E7EB]">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold text-[#141619]">Sobre el emprendimiento</h2>
              <p className="text-sm sm:text-base text-[#374151] leading-relaxed">
                {entrepreneur.description}
              </p>

              {participatingFairs.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs font-medium text-[#5C636E] mb-2">
                    Ferias donde podés encontrar este puesto
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {participatingFairs.map(({ fair, participant }) => {
                      if (!fair) return null;
                      return (
                        <button
                          key={participant.id}
                          type="button"
                          onClick={() => onSelectFair(fair.slug)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E7EB] bg-[#FAF9F6] hover:border-[#0F5C4D] hover:text-[#0F5C4D] transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#0F5C4D]" />
                          <span>{fair.name}</span>
                          {participant.standNumber && (
                            <span className="text-[#5C636E]">· {participant.standNumber}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm text-[#374151] bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E7EB]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-[#5C636E]">Horarios de atención</div>
                  <div className="text-sm text-[#141619]">{entrepreneur.hours}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-medium text-[#5C636E]">Teléfono / WhatsApp</div>
                  <div className="text-sm font-mono-num text-[#141619]">{entrepreneur.whatsapp}</div>
                </div>
              </div>
              {entrepreneur.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-[#5C636E]">Dirección comercial</div>
                    <div className="text-sm text-[#141619]">{entrepreneur.address}</div>
                  </div>
                </div>
              )}
              <div className="pt-2 border-t border-[#E5E7EB] text-xs text-[#5C636E]">
                URL pública: <span className="font-mono-num text-[#141619]">/emprendimiento/{entrepreneur.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active promotions of this entrepreneur */}
      {activePromos.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#141619]">Promociones vigentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activePromos.map((promo) => (
              <div
                key={promo.id}
                className="flex flex-col sm:flex-row bg-white rounded-xl border border-[#E5E7EB] overflow-hidden"
              >
                <div className="sm:w-40 h-40 sm:h-auto shrink-0 bg-[#EFECE6]">
                  <SafeImage
                    src={promo.imageUrl}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between gap-3 flex-1">
                  <div>
                    <div className="text-xs font-medium text-[#0F5C4D]">
                      Vigente hasta el {promo.endDate}
                    </div>
                    <h3 className="text-base font-semibold text-[#141619] mt-0.5">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-[#5C636E] mt-1">{promo.description}</p>
                  </div>
                  <a
                    href={buildWhatsAppUrl(
                      entrepreneur.whatsapp,
                      entrepreneur.commercialName,
                      undefined,
                      promo.title
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordContactClick(entrepreneur.id, 'whatsapp', promo.productId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Consultar promoción por WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Product catalog */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#141619]">
            Catálogo de productos ({filteredProducts.length})
          </h2>
          {productCategories.length > 1 && (
            <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategoryId === 'all'
                    ? 'bg-white text-[#141619] shadow-xs'
                    : 'text-[#5C636E] hover:text-[#141619]'
                }`}
              >
                Todos
              </button>
              {productCategories.map((cat) => {
                if (!cat) return null;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                      selectedCategoryId === cat.id
                        ? 'bg-white text-[#141619] shadow-xs'
                        : 'text-[#5C636E] hover:text-[#141619]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-10 text-center text-sm text-[#5C636E]">
            Este emprendimiento aún no tiene productos publicados en esta categoría.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const cat = state.categories.find((c) => c.id === prod.categoryId);
              return (
                <article
                  key={prod.id}
                  className="group bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col hover:border-[#9CA3AF] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProduct(prod)}
                    className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden text-left"
                  >
                    <SafeImage
                      src={prod.images[0]?.url}
                      alt={prod.name}
                      fallbackLabel={prod.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </button>
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      <div className="text-xs text-[#5C636E] flex items-center gap-2">
                        <span>{cat?.name || 'Producto'}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {prod.availability === 'disponible'
                            ? 'Disponible'
                            : prod.availability === 'a_pedido'
                            ? 'Por encargo'
                            : 'Agotado'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(prod)}
                        className="text-base font-semibold text-[#141619] hover:text-[#0F5C4D] text-left mt-1 line-clamp-1"
                      >
                        {prod.name}
                      </button>
                      <p className="text-xs text-[#5C636E] mt-1 line-clamp-2">
                        {prod.description}
                      </p>
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
                        href={buildWhatsAppUrl(
                          entrepreneur.whatsapp,
                          entrepreneur.commercialName,
                          prod.name
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordContactClick(entrepreneur.id, 'whatsapp', prod.id)}
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
    </div>
  );
};
