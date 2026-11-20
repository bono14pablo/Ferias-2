import {
  Entrepreneur,
  Fair,
  PlatformState,
  Product,
  Promotion,
  RolePermissionMatrix,
  UserRole,
} from '../types/platform';

export const TODAY_ISO = new Date().toISOString().slice(0, 10);

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('54')) return digits;
  if (digits.startsWith('0')) return `54${digits.slice(1)}`;
  return `549${digits}`;
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  entrepreneurName: string,
  productName?: string,
  promoTitle?: string
): string {
  const cleanNumber = normalizeWhatsAppDigits(whatsappNumber);
  let text = `Hola ${entrepreneurName}, te contacto desde FeriaLocal.`;
  if (productName) {
    text = `Hola ${entrepreneurName}, vi "${productName}" en FeriaLocal y quiero consultar disponibilidad y precio.`;
  } else if (promoTitle) {
    text = `Hola ${entrepreneurName}, me interesa la promoción "${promoTitle}" publicada en FeriaLocal.`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function isPromotionCurrentlyActive(promo: Promotion, referenceDate = TODAY_ISO): boolean {
  if (promo.deletedAt) return false;
  if (promo.status !== 'activa') return false;
  return promo.startDate <= referenceDate && promo.endDate >= referenceDate;
}

export function isPromotionExpired(promo: Promotion, referenceDate = TODAY_ISO): boolean {
  return promo.endDate < referenceDate;
}

export function buildOpenStreetMapEmbedUrl(lat: number, lng: number): string {
  const delta = 0.008;
  const bbox = `${(lng - delta).toFixed(5)},${(lat - delta).toFixed(5)},${(lng + delta).toFixed(5)},${(lat + delta).toFixed(5)}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export function buildOpenStreetMapLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat.toFixed(5)}&mlon=${lng.toFixed(5)}#map=16/${lat.toFixed(5)}/${lng.toFixed(5)}`;
}

export function validateImageFile(file: File, maxSizeMb: number): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no permitido. Usá JPG, PNG o WebP.' };
  }
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `La imagen supera el límite máximo de ${maxSizeMb} MB.` };
  }
  return { valid: true };
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No se pudo leer el archivo.'));
    };
    reader.onerror = () => reject(new Error('Error al leer la imagen.'));
    reader.readAsDataURL(file);
  });
}

export function canAccessModeration(role?: UserRole): boolean {
  return role === 'moderador' || role === 'administrador' || role === 'superadministrador';
}

export function canAccessAdmin(role?: UserRole): boolean {
  return role === 'administrador' || role === 'superadministrador';
}

export function canAccessSuperadmin(role?: UserRole): boolean {
  return role === 'superadministrador';
}

export function hasPermission(
  role: UserRole | undefined,
  permissionKey: string,
  matrix: RolePermissionMatrix[]
): boolean {
  if (!role) return false;
  const entry = matrix.find((m) => m.role === role);
  return entry ? entry.permissions.includes(permissionKey) : false;
}

export function filterPublicProducts(
  products: Product[],
  entrepreneurs: Entrepreneur[]
): Product[] {
  const publishedEntIds = new Set(
    entrepreneurs
      .filter((e) => !e.deletedAt && e.status === 'publicado')
      .map((e) => e.id)
  );
  return products.filter(
    (p) => !p.deletedAt && p.publishStatus === 'publicado' && publishedEntIds.has(p.entrepreneurId)
  );
}

export function filterActiveFairs(fairs: Fair[]): Fair[] {
  return fairs.filter((f) => !f.deletedAt && f.status !== 'inactiva');
}

export const ROLE_LABELS: Record<UserRole, string> = {
  visitante: 'Visitante',
  vendedor: 'Vendedor',
  moderador: 'Moderador',
  administrador: 'Administrador',
  superadministrador: 'Superadministrador',
};

export function sanitizeStateForPersistence(state: PlatformState): PlatformState {
  return state;
}
