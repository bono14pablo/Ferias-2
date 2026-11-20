import React from 'react';
import { ArrowLeft, Heart, MessageCircle, Store } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { buildWhatsAppUrl } from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';

interface VisitorFavoritesViewProps {
  onBack: () => void;
  onSelectEntrepreneur: (slug: string) => void;
}

export const VisitorFavoritesView: React.FC<VisitorFavoritesViewProps> = ({
  onBack,
  onSelectEntrepreneur,
}) => {
  const { state, currentUser, toggleFavorite, recordContactClick, logout } = usePlatform();

  if (!currentUser) return null;

  const userFavorites = state.favorites
    .filter((f) => f.userId === currentUser.id)
    .map((f) =>
      state.entrepreneurs.find(
        (e) => e.id === f.entrepreneurId && !e.deletedAt && e.status === 'publicado'
      )
    )
    .filter(Boolean);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#141619] mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al portal</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#141619]">
            Mis emprendimientos favoritos
          </h1>
          <p className="text-sm text-[#5C636E] mt-1">
            Cuenta de visitante: {currentUser.name} ({currentUser.email})
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onBack();
          }}
          className="px-4 py-2 text-sm font-medium border border-[#E5E7EB] bg-white rounded-lg hover:bg-[#F3F2EE] self-start sm:self-auto"
        >
          Cerrar sesión
        </button>
      </div>

      {userFavorites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center space-y-3">
          <Heart className="w-8 h-8 mx-auto text-[#9CA3AF]" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-[#141619]">
            Todavía no guardaste favoritos
          </h2>
          <p className="text-sm text-[#5C636E] max-w-md mx-auto">
            Explorá el directorio de ferias y emprendedores y tocá "Guardar favorito" para tenerlos siempre a mano.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-2 px-4 py-2 bg-[#0F5C4D] text-white text-sm font-medium rounded-lg"
          >
            Explorar directorio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userFavorites.map((ent) => {
            if (!ent) return null;
            const cat = state.categories.find((c) => c.id === ent.primaryCategoryId);
            const loc = state.locations.find((l) => l.id === ent.locationId);
            return (
              <article
                key={ent.id}
                className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col"
              >
                <button
                  type="button"
                  onClick={() => onSelectEntrepreneur(ent.slug)}
                  className="aspect-[16/10] w-full bg-[#EFECE6] overflow-hidden"
                >
                  <SafeImage
                    src={ent.coverUrl}
                    alt={ent.commercialName}
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-[#5C636E]">
                      {cat?.name} · {loc?.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectEntrepreneur(ent.slug)}
                      className="text-lg font-semibold text-[#141619] hover:text-[#0F5C4D] text-left mt-1"
                    >
                      {ent.commercialName}
                    </button>
                    <p className="text-xs text-[#5C636E] mt-1 line-clamp-2">
                      {ent.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectEntrepreneur(ent.slug)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#141619] hover:text-[#0F5C4D]"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Ver tienda</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <a
                        href={buildWhatsAppUrl(ent.whatsapp, ent.commercialName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordContactClick(ent.id, 'whatsapp')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#15803D] bg-[#15803D]/10 rounded-lg hover:bg-[#15803D] hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(ent.id)}
                        aria-label="Quitar de favoritos"
                        className="p-1.5 text-[#0F5C4D] hover:bg-[#F3F2EE] rounded-lg"
                      >
                        <Heart className="w-4 h-4 fill-[#0F5C4D]" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
