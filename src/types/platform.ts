export type UserRole =
  | 'visitante'
  | 'vendedor'
  | 'moderador'
  | 'administrador'
  | 'superadministrador';

export type PlanTier = 'gratuito' | 'emprendedor' | 'destacado' | 'organizador';

export interface RolePermissionMatrix {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  active: boolean;
  plan: PlanTier;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Location {
  id: string;
  name: string;
  province: string;
  slug: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

export type EntrepreneurPublishStatus = 'pendiente' | 'publicado' | 'suspendido' | 'rechazado';

export interface Entrepreneur {
  id: string;
  userId: string;
  slug: string;
  commercialName: string;
  ownerName: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  primaryCategoryId: string;
  secondaryCategoryIds: string[];
  locationId: string;
  address?: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  facebook?: string;
  hours: string;
  status: EntrepreneurPublishStatus;
  featured: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type ProductAvailability = 'disponible' | 'a_pedido' | 'agotado';
export type ProductPublishStatus = 'publicado' | 'oculto' | 'pendiente';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Product {
  id: string;
  entrepreneurId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  images: ProductImage[];
  availability: ProductAvailability;
  publishStatus: ProductPublishStatus;
  featured: boolean;
  updatedAt: string;
  deletedAt?: string;
}

export type FairStatus = 'activa' | 'proxima' | 'finalizada' | 'inactiva';

export interface FairSchedule {
  id: string;
  dayLabel: string;
  hours: string;
  specialDates?: string;
}

export interface Fair {
  id: string;
  slug: string;
  name: string;
  description: string;
  mainImageUrl: string;
  galleryUrls: string[];
  province: string;
  locationId: string;
  address: string;
  lat: number;
  lng: number;
  operatingDays: string;
  hours: string;
  specialDates?: string;
  schedules: FairSchedule[];
  instagram?: string;
  facebook?: string;
  organizerName: string;
  organizerContact: string;
  status: FairStatus;
  createdAt: string;
  deletedAt?: string;
}

export type ParticipationStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'finalizada';

export interface FairParticipant {
  id: string;
  fairId: string;
  entrepreneurId: string;
  status: ParticipationStatus;
  standNumber?: string;
  requestNote?: string;
  reviewNote?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export type PromotionStatus = 'activa' | 'pausada';

export interface Promotion {
  id: string;
  entrepreneurId: string;
  productId?: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: PromotionStatus;
  featuredByAdmin: boolean;
  createdAt: string;
  deletedAt?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  entrepreneurId: string;
  createdAt: string;
}

export interface ProfileVisit {
  id: string;
  entrepreneurId: string;
  date: string;
  source: 'portal' | 'feria' | 'buscador';
}

export interface ContactClick {
  id: string;
  entrepreneurId: string;
  productId?: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'telefono';
  createdAt: string;
}

export type ReportStatus = 'pendiente' | 'revisada' | 'resuelta' | 'desestimada';

export interface ContentReport {
  id: string;
  targetType: 'emprendimiento' | 'producto';
  targetId: string;
  targetName: string;
  reporterEmail: string;
  reason: string;
  details: string;
  status: ReportStatus;
  moderatorNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface SystemConfig {
  platformName: string;
  pilotProvince: string;
  maxUploadSizeMb: number;
  requireEmailVerification: boolean;
  autoApproveEntrepreneurs: boolean;
  maxProductsFreePlan: number;
  maintenanceMode: boolean;
}

export interface PlatformState {
  users: User[];
  locations: Location[];
  categories: Category[];
  entrepreneurs: Entrepreneur[];
  products: Product[];
  fairs: Fair[];
  participants: FairParticipant[];
  promotions: Promotion[];
  favorites: Favorite[];
  visits: ProfileVisit[];
  contactClicks: ContactClick[];
  reports: ContentReport[];
  auditLogs: AuditLog[];
  config: SystemConfig;
  rolePermissions: RolePermissionMatrix[];
}
