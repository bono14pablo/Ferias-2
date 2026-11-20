import React, { useMemo, useState } from 'react';
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SEED_MEDIA } from '../../data/seedMedia';
import {
  Product,
  ProductAvailability,
  ProductImage,
  ProductPublishStatus,
} from '../../types/platform';
import {
  formatARS,
  readFileAsDataUrl,
  validateImageFile,
} from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';

export const VendorProductsTab: React.FC = () => {
  const {
    state,
    ownEntrepreneur,
    createProduct,
    updateProduct,
    softDeleteProduct,
  } = usePlatform();

  const [filterCatId, setFilterCatId] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('15000');
  const [promoPrice, setPromoPrice] = useState('');
  const [categoryId, setCategoryId] = useState(state.categories[0]?.id || '');
  const [availability, setAvailability] = useState<ProductAvailability>('disponible');
  const [publishStatus, setPublishStatus] = useState<ProductPublishStatus>('publicado');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const ownProducts = useMemo(() => {
    if (!ownEntrepreneur) return [];
    return state.products.filter(
      (p) => p.entrepreneurId === ownEntrepreneur.id && !p.deletedAt
    );
  }, [ownEntrepreneur, state.products]);

  const filteredProducts =
    filterCatId === 'all'
      ? ownProducts
      : ownProducts.filter((p) => p.categoryId === filterCatId);

  if (!ownEntrepreneur) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-600">
        Primero completá la ficha de <strong>Mi emprendimiento</strong> para administrar tu catálogo de productos.
      </div>
    );
  }

  const openNewForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('15000');
    setPromoPrice('');
    setCategoryId(ownEntrepreneur.primaryCategoryId || state.categories[0]?.id || '');
    setAvailability('disponible');
    setPublishStatus('publicado');
    setFeatured(false);
    setImages([
      {
        id: `img-${Date.now()}`,
        url: SEED_MEDIA.ceramica,
        alt: 'Imagen principal del producto',
        order: 1,
      },
    ]);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setPromoPrice(product.promoPrice ? String(product.promoPrice) : '');
    setCategoryId(product.categoryId);
    setAvailability(product.availability);
    setPublishStatus(product.publishStatus);
    setFeatured(product.featured);
    setImages(product.images);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file, state.config.maxUploadSizeMb);
    if (!validation.valid) {
      setFormError(validation.error || 'Archivo inválido.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImages((prev) => [
        ...prev,
        {
          id: `img-${Date.now()}`,
          url: dataUrl,
          alt: name || 'Fotografía de producto',
          order: prev.length + 1,
        },
      ]);
      setFormError(null);
    } catch {
      setFormError('No se pudo procesar la imagen.');
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}`,
        url: newImageUrl.trim(),
        alt: name || 'Fotografía de producto',
        order: prev.length + 1,
      },
    ]);
    setNewImageUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(price);
    const numericPromo = promoPrice.trim() ? Number(promoPrice) : undefined;
    if (!name.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setFormError('Ingresá un nombre y un precio válido en pesos argentinos.');
      return;
    }
    if (numericPromo !== undefined && numericPromo >= numericPrice) {
      setFormError('El precio promocional debe ser menor al precio regular.');
      return;
    }
    if (images.length === 0) {
      setFormError('Cargá al menos una fotografía del producto.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      promoPrice: numericPromo,
      categoryId,
      availability,
      publishStatus,
      featured,
      images,
    };

    const res = editingProduct
      ? updateProduct(editingProduct.id, payload)
      : createProduct(payload);

    if (!res.ok) {
      setFormError(res.message);
      return;
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mis productos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrá precios, múltiples fotos, disponibilidad y visibilidad en el portal.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Filtrar categoría:</label>
          <select
            value={filterCatId}
            onChange={(e) => setFilterCatId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="all">Todas ({ownProducts.length})</option>
            {state.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-500 font-mono-num">
          {filteredProducts.length} registros activos
        </div>
      </div>

      {/* Product modal/drawer form */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">
              {editingProduct ? `Editar: ${editingProduct.name}` : 'Nuevo producto'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Mate artesanal de gres"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Categoría
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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
                  Precio regular (ARS)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio promocional opcional (ARS)
                </label>
                <input
                  type="number"
                  min={1}
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  placeholder="Dejar vacío si no aplica"
                  className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Disponibilidad
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as ProductAvailability)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="disponible">Disponible</option>
                  <option value="a_pedido">A pedido / por encargo</option>
                  <option value="agotado">Agotado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Estado de publicación
                </label>
                <select
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value as ProductPublishStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="publicado">Publicado</option>
                  <option value="oculto">Oculto temporalmente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Materiales, medidas, cuidados o detalles de elaboración..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            {/* Multiple images */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Fotografías del producto ({images.length})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    JPG, PNG o WebP hasta {state.config.maxUploadSizeMb} MB por imagen.
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Subir fotografía</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="O pegá una URL de imagen..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg"
                >
                  Agregar URL
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-300 bg-white group"
                  >
                    <SafeImage src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setImages((prev) => prev.filter((item) => item.id !== img.id))
                      }
                      aria-label="Quitar imagen"
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/70 text-white opacity-90 hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-slate-300 text-[#0F5C4D]"
              />
              <span>Destacar este producto en mi catálogo</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-[#0F5C4D] hover:bg-[#0B473B] rounded-lg"
              >
                {editingProduct ? 'Guardar cambios' : 'Publicar producto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product list table/cards */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm text-slate-600">
            No tenés productos cargados en esta vista.
          </p>
          <button
            type="button"
            onClick={openNewForm}
            className="px-4 py-2 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg"
          >
            Cargar primer producto
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Producto</th>
                  <th className="py-2.5 px-4">Categoría</th>
                  <th className="py-2.5 px-4 text-right">Precio</th>
                  <th className="py-2.5 px-4">Disponibilidad</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredProducts.map((prod) => {
                  const cat = state.categories.find((c) => c.id === prod.categoryId);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-9 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                            <SafeImage
                              src={prod.images[0]?.url}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{prod.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono-num">
                              {prod.images.length} fotos · Act. {prod.updatedAt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{cat?.name}</td>
                      <td className="py-3 px-4 text-right font-mono-num">
                        <div className="font-semibold text-slate-900">
                          {formatARS(prod.promoPrice || prod.price)}
                        </div>
                        {prod.promoPrice && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {formatARS(prod.price)}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {prod.availability === 'disponible'
                          ? 'Disponible'
                          : prod.availability === 'a_pedido'
                          ? 'Por encargo'
                          : 'Agotado'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${
                            prod.publishStatus === 'publicado'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {prod.publishStatus === 'publicado' ? 'Publicado' : 'Oculto'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title={prod.featured ? 'Quitar destacado' : 'Destacar'}
                            onClick={() => updateProduct(prod.id, { featured: !prod.featured })}
                            className={`p-1.5 rounded-md hover:bg-slate-100 ${
                              prod.featured ? 'text-amber-600' : 'text-slate-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${prod.featured ? 'fill-amber-500' : ''}`} />
                          </button>
                          <button
                            type="button"
                            title={
                              prod.publishStatus === 'publicado'
                                ? 'Ocultar temporalmente'
                                : 'Volver a publicar'
                            }
                            onClick={() =>
                              updateProduct(prod.id, {
                                publishStatus:
                                  prod.publishStatus === 'publicado' ? 'oculto' : 'publicado',
                              })
                            }
                            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                          >
                            {prod.publishStatus === 'publicado' ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            title="Editar producto"
                            onClick={() => openEditForm(prod)}
                            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Dar de baja"
                            onClick={() => softDeleteProduct(prod.id)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
