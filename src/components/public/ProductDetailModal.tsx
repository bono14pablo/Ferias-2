import React, { useState } from 'react';
import { X, MessageCircle, Flag, Store } from 'lucide-react';
import { Entrepreneur, Product } from '../../types/platform';
import { buildWhatsAppUrl, formatARS } from '../../utils/platformHelpers';
import { usePlatform } from '../../context/PlatformContext';
import { SafeImage } from '../common/SafeImage';

interface ProductDetailModalProps {
  product: Product | null;
  entrepreneur: Entrepreneur | null;
  onClose: () => void;
  onNavigateEntrepreneur: (slug: string) => void;
  onReportProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  entrepreneur,
  onClose,
  onNavigateEntrepreneur,
  onReportProduct,
}) => {
  const { state, recordContactClick } = usePlatform();
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!product || !entrepreneur) return null;

  const images = product.images.length > 0 ? product.images : [];
  const activeImage = images[selectedIndex] || images[0];
  const category = state.categories.find((c) => c.id === product.categoryId);
  const location = state.locations.find((l) => l.id === entrepreneur.locationId);

  const availabilityLabel =
    product.availability === 'disponible'
      ? 'Disponible'
      : product.availability === 'a_pedido'
      ? 'Por encargo'
      : 'Sin stock momentáneo';

  const whatsappUrl = buildWhatsAppUrl(
    entrepreneur.whatsapp,
    entrepreneur.commercialName,
    product.name
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="text-xs text-[#5C636E] flex items-center gap-2 truncate">
            <span>{category?.name || 'Producto'}</span>
            <span aria-hidden="true">·</span>
            <span>{location?.name || ''}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha de producto"
            className="p-2 rounded-lg text-[#5C636E] hover:bg-[#F3F2EE] hover:text-[#141619] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 overflow-y-auto">
          <div className="p-6 bg-[#FAF9F6] border-b md:border-b-0 md:border-r border-[#E5E7EB] space-y-3">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-white">
              <SafeImage
                src={activeImage?.url}
                alt={activeImage?.alt || product.name}
                fallbackLabel={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
                      idx === selectedIndex
                        ? 'border-[#0F5C4D] ring-2 ring-[#0F5C4D]/25'
                        : 'border-[#E5E7EB] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium text-[#0F5C4D] mb-1">
                  {availabilityLabel}
                </div>
                <h2
                  id="product-modal-title"
                  className="text-2xl font-bold text-[#141619] leading-snug"
                >
                  {product.name}
                </h2>
              </div>

              <div className="flex items-baseline gap-3">
                {product.promoPrice ? (
                  <>
                    <span className="text-2xl font-bold font-mono-num text-[#141619]">
                      {formatARS(product.promoPrice)}
                    </span>
                    <span className="text-sm font-mono-num text-[#5C636E] line-through">
                      {formatARS(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold font-mono-num text-[#141619]">
                    {formatARS(product.price)}
                  </span>
                )}
              </div>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                {product.description}
              </p>

              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="text-xs text-[#5C636E] mb-1.5">Emprendimiento</div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateEntrepreneur(entrepreneur.slug);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] hover:border-[#0F5C4D] transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E5E7EB] shrink-0">
                      <SafeImage
                        src={entrepreneur.logoUrl}
                        alt={entrepreneur.commercialName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#141619] truncate">
                        {entrepreneur.commercialName}
                      </div>
                      <div className="text-xs text-[#5C636E] truncate">
                        {entrepreneur.ownerName} · {location?.name}
                      </div>
                    </div>
                  </div>
                  <Store className="w-4 h-4 text-[#0F5C4D] shrink-0" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordContactClick(entrepreneur.id, 'whatsapp', product.id)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar por WhatsApp</span>
              </a>
              <div className="flex items-center justify-between text-xs text-[#5C636E] pt-1">
                <span>Actualizado: {product.updatedAt}</span>
                <button
                  type="button"
                  onClick={() => onReportProduct(product)}
                  className="inline-flex items-center gap-1 hover:text-red-700 transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Reportar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
