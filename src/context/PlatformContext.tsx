import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_PLATFORM_STATE } from '../data/seedData';
import {
  AuditLog,
  Category,
  ContentReport,
  Entrepreneur,
  EntrepreneurPublishStatus,
  Fair,
  FairParticipant,
  Location,
  ParticipationStatus,
  PlanTier,
  PlatformState,
  Product,
  Promotion,
  ReportStatus,
  SystemConfig,
  User,
  UserRole,
} from '../types/platform';
import { slugify, TODAY_ISO } from '../utils/platformHelpers';

const STORAGE_KEY = 'ferialocal_platform_state_v1';
const AUTH_STORAGE_KEY = 'ferialocal_current_user_id_v1';

interface LoginAttemptState {
  count: number;
  lockedUntil: number | null;
}

interface ActionResult {
  ok: boolean;
  message: string;
}

interface PlatformContextValue {
  state: PlatformState;
  currentUser: User | null;
  ownEntrepreneur: Entrepreneur | null;
  toastMessage: string | null;
  notify: (msg: string) => void;
  loginWithCredentials: (email: string, password: string) => ActionResult;
  quickLoginAsUser: (userId: string) => void;
  registerAccount: (
    name: string,
    email: string,
    password: string,
    role: 'visitante' | 'vendedor'
  ) => ActionResult;
  verifyCurrentUserEmail: () => void;
  recoverPassword: (email: string) => ActionResult;
  logout: () => void;
  upsertOwnEntrepreneur: (
    data: Omit<Entrepreneur, 'id' | 'userId' | 'slug' | 'status' | 'featured' | 'createdAt' | 'updatedAt'>
  ) => ActionResult;
  moderateEntrepreneurStatus: (
    entrepreneurId: string,
    status: EntrepreneurPublishStatus,
    rejectionReason?: string
  ) => ActionResult;
  toggleEntrepreneurFeatured: (entrepreneurId: string) => void;
  createProduct: (
    data: Omit<Product, 'id' | 'entrepreneurId' | 'updatedAt'>
  ) => ActionResult;
  updateProduct: (productId: string, patch: Partial<Product>) => ActionResult;
  softDeleteProduct: (productId: string) => ActionResult;
  createOrUpdateFair: (fair: Omit<Fair, 'id' | 'slug' | 'createdAt'> & { id?: string }) => ActionResult;
  softDeleteFair: (fairId: string) => ActionResult;
  requestFairParticipation: (fairId: string, note?: string) => ActionResult;
  reviewFairParticipation: (
    participantId: string,
    status: ParticipationStatus,
    standNumber?: string,
    reviewNote?: string
  ) => ActionResult;
  createOrUpdatePromotion: (
    promo: Omit<Promotion, 'id' | 'entrepreneurId' | 'featuredByAdmin' | 'createdAt'> & { id?: string }
  ) => ActionResult;
  softDeletePromotion: (promoId: string) => ActionResult;
  togglePromotionAdminFeatured: (promoId: string) => void;
  saveCategory: (cat: Omit<Category, 'id' | 'slug'> & { id?: string }) => ActionResult;
  toggleCategoryActive: (categoryId: string) => void;
  saveLocation: (loc: Omit<Location, 'id' | 'slug'> & { id?: string }) => ActionResult;
  toggleLocationActive: (locationId: string) => void;
  toggleFavorite: (entrepreneurId: string) => ActionResult;
  recordProfileVisit: (entrepreneurId: string, source: 'portal' | 'feria' | 'buscador') => void;
  recordContactClick: (
    entrepreneurId: string,
    channel: 'whatsapp' | 'instagram' | 'facebook' | 'telefono',
    productId?: string
  ) => void;
  submitReport: (
    targetType: 'emprendimiento' | 'producto',
    targetId: string,
    targetName: string,
    reason: string,
    details: string,
    reporterEmail: string
  ) => ActionResult;
  resolveReport: (reportId: string, status: ReportStatus, moderatorNote: string) => ActionResult;
  updateUserRoleOrActive: (userId: string, patch: { role?: UserRole; active?: boolean; plan?: PlanTier }) => ActionResult;
  updateRolePermissions: (role: UserRole, permissions: string[]) => ActionResult;
  updateSystemConfig: (patch: Partial<SystemConfig>) => ActionResult;
  resetPlatformData: () => void;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

function loadInitialState(): PlatformState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PlatformState;
      if (parsed && Array.isArray(parsed.entrepreneurs) && Array.isArray(parsed.fairs)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to initial seed
  }
  return INITIAL_PLATFORM_STATE;
}

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PlatformState>(loadInitialState);
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptState>({
    count: 0,
    lockedUntil: null,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [state]);

  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(AUTH_STORAGE_KEY, currentUserId);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [currentUserId]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const currentUser = state.users.find((u) => u.id === currentUserId && u.active) || null;

  const ownEntrepreneur = currentUser
    ? state.entrepreneurs.find((e) => e.userId === currentUser.id && !e.deletedAt) || null
    : null;

  const appendAudit = (
    prev: PlatformState,
    action: string,
    entityType: string,
    entityId: string,
    summary: string,
    actorOverride?: User
  ): AuditLog[] => {
    const actor = actorOverride || currentUser;
    if (!actor) return prev.auditLogs;
    const nowLabel = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorUserId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      entityType,
      entityId,
      summary,
      createdAt: nowLabel,
    };
    return [entry, ...prev.auditLogs];
  };

  const loginWithCredentials = (email: string, password: string): ActionResult => {
    const now = Date.now();
    if (loginAttempts.lockedUntil && now < loginAttempts.lockedUntil) {
      const secondsLeft = Math.ceil((loginAttempts.lockedUntil - now) / 1000);
      return {
        ok: false,
        message: `Demasiados intentos fallidos. Esperá ${secondsLeft} segundos para reintentar.`,
      };
    }

    const normalized = email.trim().toLowerCase();
    const user = state.users.find((u) => u.email.toLowerCase() === normalized);

    if (!user || !user.active || password.trim().length < 4) {
      const nextCount = loginAttempts.count + 1;
      if (nextCount >= 5) {
        setLoginAttempts({ count: 0, lockedUntil: now + 30_000 });
        return {
          ok: false,
          message: 'Cuenta bloqueada temporalmente 30s por límite de intentos de autenticación.',
        };
      }
      setLoginAttempts({ count: nextCount, lockedUntil: null });
      return {
        ok: false,
        message: `Credenciales inválidas (intento ${nextCount}/5).`,
      };
    }

    setLoginAttempts({ count: 0, lockedUntil: null });
    setCurrentUserId(user.id);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === user.id ? { ...u, lastLoginAt: TODAY_ISO } : u
      ),
    }));
    notify(`Sesión iniciada como ${user.name}`);
    return { ok: true, message: 'Ingreso exitoso.' };
  };

  const quickLoginAsUser = (userId: string) => {
    const target = state.users.find((u) => u.id === userId && u.active);
    if (!target) return;
    setCurrentUserId(target.id);
    setLoginAttempts({ count: 0, lockedUntil: null });
    notify(`Ingresaste como ${target.name}`);
  };

  const registerAccount = (
    name: string,
    email: string,
    password: string,
    role: 'visitante' | 'vendedor'
  ): ActionResult => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail.includes('@') || password.trim().length < 6) {
      return {
        ok: false,
        message: 'Completá nombre, correo válido y una contraseña de al menos 6 caracteres.',
      };
    }
    if (state.users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return {
        ok: false,
        message: 'Ya existe una cuenta registrada con ese correo electrónico.',
      };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      passwordHash: `sha256:${btoa(password).slice(0, 12)}`,
      role,
      emailVerified: !state.config.requireEmailVerification,
      active: true,
      plan: 'gratuito',
      createdAt: TODAY_ISO,
      lastLoginAt: TODAY_ISO,
    };

    setState((prev) => ({
      ...prev,
      users: [newUser, ...prev.users],
      auditLogs: appendAudit(
        prev,
        'REGISTRO_USUARIO',
        'users',
        newUser.id,
        `Nuevo registro de usuario (${role}): ${newUser.email}.`,
        newUser
      ),
    }));
    setCurrentUserId(newUser.id);
    notify(
      role === 'vendedor'
        ? 'Cuenta creada. Completá los datos de tu emprendimiento.'
        : 'Cuenta de visitante creada correctamente.'
    );
    return { ok: true, message: 'Registro exitoso.' };
  };

  const verifyCurrentUserEmail = () => {
    if (!currentUser) return;
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === currentUser.id ? { ...u, emailVerified: true } : u
      ),
    }));
    notify('Correo electrónico verificado.');
  };

  const recoverPassword = (email: string): ActionResult => {
    const exists = state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      return {
        ok: false,
        message: 'No encontramos una cuenta asociada a ese correo.',
      };
    }
    return {
      ok: true,
      message: 'Enviamos un enlace seguro de recuperación a tu casilla de correo.',
    };
  };

  const logout = () => {
    setCurrentUserId(null);
    notify('Sesión cerrada.');
  };

  const upsertOwnEntrepreneur = (
    data: Omit<Entrepreneur, 'id' | 'userId' | 'slug' | 'status' | 'featured' | 'createdAt' | 'updatedAt'>
  ): ActionResult => {
    if (!currentUser || currentUser.role !== 'vendedor') {
      return { ok: false, message: 'Solo las cuentas de vendedor pueden gestionar un emprendimiento.' };
    }
    if (!data.commercialName.trim() || !data.whatsapp.trim()) {
      return { ok: false, message: 'El nombre comercial y el WhatsApp son obligatorios.' };
    }

    const baseSlug = slugify(data.commercialName);
    const existing = ownEntrepreneur;

    if (existing) {
      if (existing.userId !== currentUser.id) {
        return { ok: false, message: 'No tenés permisos para modificar emprendimientos ajenos.' };
      }
      setState((prev) => ({
        ...prev,
        entrepreneurs: prev.entrepreneurs.map((e) =>
          e.id === existing.id
            ? {
                ...e,
                ...data,
                slug: baseSlug || e.slug,
                updatedAt: TODAY_ISO,
              }
            : e
        ),
        auditLogs: appendAudit(
          prev,
          'EDITAR_EMPRENDIMIENTO',
          'entrepreneurs',
          existing.id,
          `El vendedor actualizó los datos de ${data.commercialName}.`
        ),
      }));
      notify('Ficha comercial actualizada.');
      return { ok: true, message: 'Emprendimiento actualizado.' };
    }

    const uniqueSlug = state.entrepreneurs.some((e) => e.slug === baseSlug)
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const newEnt: Entrepreneur = {
      id: `ent-${Date.now()}`,
      userId: currentUser.id,
      slug: uniqueSlug,
      ...data,
      status: state.config.autoApproveEntrepreneurs ? 'publicado' : 'pendiente',
      featured: false,
      createdAt: TODAY_ISO,
      updatedAt: TODAY_ISO,
    };

    setState((prev) => ({
      ...prev,
      entrepreneurs: [newEnt, ...prev.entrepreneurs],
      auditLogs: appendAudit(
        prev,
        'CREAR_EMPRENDIMIENTO',
        'entrepreneurs',
        newEnt.id,
        `Alta de emprendimiento ${newEnt.commercialName} (estado: ${newEnt.status}).`
      ),
    }));
    notify(
      newEnt.status === 'publicado'
        ? 'Tu emprendimiento fue publicado.'
        : 'Emprendimiento registrado. Quedó pendiente de aprobación por moderación.'
    );
    return { ok: true, message: 'Emprendimiento guardado.' };
  };

  const moderateEntrepreneurStatus = (
    entrepreneurId: string,
    status: EntrepreneurPublishStatus,
    rejectionReason?: string
  ): ActionResult => {
    if (
      !currentUser ||
      !['moderador', 'administrador', 'superadministrador'].includes(currentUser.role)
    ) {
      return { ok: false, message: 'Un vendedor no puede aprobar ni suspender publicaciones.' };
    }

    const target = state.entrepreneurs.find((e) => e.id === entrepreneurId);
    if (!target) return { ok: false, message: 'Emprendimiento no encontrado.' };

    setState((prev) => ({
      ...prev,
      entrepreneurs: prev.entrepreneurs.map((e) =>
        e.id === entrepreneurId
          ? {
              ...e,
              status,
              rejectionReason: status === 'rechazado' || status === 'suspendido' ? rejectionReason : undefined,
              updatedAt: TODAY_ISO,
            }
          : e
      ),
      auditLogs: appendAudit(
        prev,
        `ESTADO_EMPRENDIMIENTO_${status.toUpperCase()}`,
        'entrepreneurs',
        entrepreneurId,
        `Cambió estado de "${target.commercialName}" a ${status}.${rejectionReason ? ` Motivo: ${rejectionReason}` : ''}`
      ),
    }));
    notify(`Estado actualizado a "${status}".`);
    return { ok: true, message: 'Moderación aplicada.' };
  };

  const toggleEntrepreneurFeatured = (entrepreneurId: string) => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) return;
    setState((prev) => {
      const target = prev.entrepreneurs.find((e) => e.id === entrepreneurId);
      const nextVal = target ? !target.featured : false;
      return {
        ...prev,
        entrepreneurs: prev.entrepreneurs.map((e) =>
          e.id === entrepreneurId ? { ...e, featured: nextVal } : e
        ),
        auditLogs: appendAudit(
          prev,
          'DESTACAR_EMPRENDIMIENTO',
          'entrepreneurs',
          entrepreneurId,
          `${nextVal ? 'Destacó' : 'Quitó destacado de'} ${target?.commercialName || entrepreneurId}.`
        ),
      };
    });
  };

  const createProduct = (
    data: Omit<Product, 'id' | 'entrepreneurId' | 'updatedAt'>
  ): ActionResult => {
    if (!currentUser || currentUser.role !== 'vendedor' || !ownEntrepreneur) {
      return { ok: false, message: 'Primero creá tu emprendimiento para cargar productos.' };
    }
    const ownProductsCount = state.products.filter(
      (p) => p.entrepreneurId === ownEntrepreneur.id && !p.deletedAt
    ).length;
    if (currentUser.plan === 'gratuito' && ownProductsCount >= state.config.maxProductsFreePlan) {
      return {
        ok: false,
        message: `El Plan Gratuito permite hasta ${state.config.maxProductsFreePlan} productos activos.`,
      };
    }

    const newProduct: Product = {
      id: `prd-${Date.now()}`,
      entrepreneurId: ownEntrepreneur.id,
      ...data,
      updatedAt: TODAY_ISO,
    };

    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      auditLogs: appendAudit(
        prev,
        'CREAR_PRODUCTO',
        'products',
        newProduct.id,
        `Cargó producto "${newProduct.name}" en ${ownEntrepreneur.commercialName}.`
      ),
    }));
    notify('Producto publicado en tu catálogo.');
    return { ok: true, message: 'Producto creado.' };
  };

  const updateProduct = (productId: string, patch: Partial<Product>): ActionResult => {
    if (!currentUser) return { ok: false, message: 'Debés iniciar sesión.' };
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, message: 'Producto no encontrado.' };

    const isModOrAdmin = ['moderador', 'administrador', 'superadministrador'].includes(currentUser.role);
    const isOwner = ownEntrepreneur && product.entrepreneurId === ownEntrepreneur.id;

    if (!isOwner && !isModOrAdmin) {
      return { ok: false, message: 'No podés modificar productos de otros vendedores.' };
    }

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, ...patch, updatedAt: TODAY_ISO } : p
      ),
      auditLogs: appendAudit(
        prev,
        'ACTUALIZAR_PRODUCTO',
        'products',
        productId,
        `Actualizó producto "${product.name}".`
      ),
    }));
    notify('Producto actualizado.');
    return { ok: true, message: 'Producto actualizado.' };
  };

  const softDeleteProduct = (productId: string): ActionResult => {
    if (!currentUser) return { ok: false, message: 'Debés iniciar sesión.' };
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { ok: false, message: 'Producto no encontrado.' };

    const isModOrAdmin = ['administrador', 'superadministrador'].includes(currentUser.role);
    const isOwner = ownEntrepreneur && product.entrepreneurId === ownEntrepreneur.id;
    if (!isOwner && !isModOrAdmin) {
      return { ok: false, message: 'Acceso denegado.' };
    }

    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, deletedAt: TODAY_ISO, publishStatus: 'oculto' } : p
      ),
      auditLogs: appendAudit(
        prev,
        'BAJA_LOGICA_PRODUCTO',
        'products',
        productId,
        `Baja lógica de producto "${product.name}".`
      ),
    }));
    notify('Producto dado de baja (baja lógica).');
    return { ok: true, message: 'Producto eliminado.' };
  };

  const createOrUpdateFair = (
    fairData: Omit<Fair, 'id' | 'slug' | 'createdAt'> & { id?: string }
  ): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Solo administradores pueden gestionar ferias.' };
    }
    const slug = slugify(fairData.name);
    if (fairData.id) {
      setState((prev) => ({
        ...prev,
        fairs: prev.fairs.map((f) =>
          f.id === fairData.id ? { ...f, ...fairData, slug: slug || f.slug } : f
        ),
        auditLogs: appendAudit(
          prev,
          'EDITAR_FERIA',
          'fairs',
          fairData.id!,
          `Actualizó la feria "${fairData.name}".`
        ),
      }));
      notify('Feria actualizada.');
      return { ok: true, message: 'Feria actualizada.' };
    }

    const newFair: Fair = {
      ...fairData,
      id: `fair-${Date.now()}`,
      slug,
      createdAt: TODAY_ISO,
    };
    setState((prev) => ({
      ...prev,
      fairs: [newFair, ...prev.fairs],
      auditLogs: appendAudit(
        prev,
        'CREAR_FERIA',
        'fairs',
        newFair.id,
        `Registró nueva feria "${newFair.name}".`
      ),
    }));
    notify('Nueva feria creada.');
    return { ok: true, message: 'Feria creada.' };
  };

  const softDeleteFair = (fairId: string): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Acceso denegado.' };
    }
    const target = state.fairs.find((f) => f.id === fairId);
    setState((prev) => ({
      ...prev,
      fairs: prev.fairs.map((f) => (f.id === fairId ? { ...f, deletedAt: TODAY_ISO, status: 'inactiva' } : f)),
      auditLogs: appendAudit(
        prev,
        'BAJA_FERIA',
        'fairs',
        fairId,
        `Dio de baja la feria "${target?.name || fairId}".`
      ),
    }));
    notify('Feria desactivada.');
    return { ok: true, message: 'Feria dada de baja.' };
  };

  const requestFairParticipation = (fairId: string, note?: string): ActionResult => {
    if (!currentUser || currentUser.role !== 'vendedor' || !ownEntrepreneur) {
      return { ok: false, message: 'Necesitás un emprendimiento registrado para postularte.' };
    }
    const existing = state.participants.find(
      (p) => p.fairId === fairId && p.entrepreneurId === ownEntrepreneur.id
    );
    if (existing && (existing.status === 'pendiente' || existing.status === 'aprobada')) {
      return { ok: false, message: 'Ya tenés una solicitud activa o aprobada en esta feria.' };
    }

    const newReq: FairParticipant = {
      id: `part-${Date.now()}`,
      fairId,
      entrepreneurId: ownEntrepreneur.id,
      status: 'pendiente',
      requestNote: note?.trim() || 'Solicitamos puesto para próximas fechas.',
      requestedAt: TODAY_ISO,
    };
    const fairName = state.fairs.find((f) => f.id === fairId)?.name || fairId;

    setState((prev) => ({
      ...prev,
      participants: [newReq, ...prev.participants],
      auditLogs: appendAudit(
        prev,
        'SOLICITAR_FERIA',
        'fair_participants',
        newReq.id,
        `${ownEntrepreneur.commercialName} solicitó participar en ${fairName}.`
      ),
    }));
    notify('Solicitud enviada al organizador.');
    return { ok: true, message: 'Solicitud registrada.' };
  };

  const reviewFairParticipation = (
    participantId: string,
    status: ParticipationStatus,
    standNumber?: string,
    reviewNote?: string
  ): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Solo administradores pueden resolver solicitudes de feria.' };
    }

    const target = state.participants.find((p) => p.id === participantId);
    if (!target) return { ok: false, message: 'Solicitud no encontrada.' };

    const entName =
      state.entrepreneurs.find((e) => e.id === target.entrepreneurId)?.commercialName ||
      target.entrepreneurId;
    const fairName = state.fairs.find((f) => f.id === target.fairId)?.name || target.fairId;

    setState((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.id === participantId
          ? {
              ...p,
              status,
              standNumber: standNumber ?? p.standNumber,
              reviewNote: reviewNote ?? p.reviewNote,
              reviewedAt: TODAY_ISO,
            }
          : p
      ),
      auditLogs: appendAudit(
        prev,
        `PARTICIPACION_${status.toUpperCase()}`,
        'fair_participants',
        participantId,
        `Cambió participación de ${entName} en ${fairName} a ${status}.`
      ),
    }));
    notify(`Participación actualizada a "${status}".`);
    return { ok: true, message: 'Participación actualizada.' };
  };

  const createOrUpdatePromotion = (
    promoData: Omit<Promotion, 'id' | 'entrepreneurId' | 'featuredByAdmin' | 'createdAt'> & { id?: string }
  ): ActionResult => {
    if (!currentUser || currentUser.role !== 'vendedor' || !ownEntrepreneur) {
      return { ok: false, message: 'Necesitás un emprendimiento para publicar promociones.' };
    }
    if (promoData.endDate < promoData.startDate) {
      return { ok: false, message: 'La fecha de finalización debe ser posterior al inicio.' };
    }

    if (promoData.id) {
      const existing = state.promotions.find((p) => p.id === promoData.id);
      if (!existing || existing.entrepreneurId !== ownEntrepreneur.id) {
        return { ok: false, message: 'No podés editar promociones de otro emprendimiento.' };
      }
      setState((prev) => ({
        ...prev,
        promotions: prev.promotions.map((p) =>
          p.id === promoData.id ? { ...p, ...promoData } : p
        ),
        auditLogs: appendAudit(
          prev,
          'EDITAR_PROMOCION',
          'promotions',
          promoData.id!,
          `Actualizó promoción "${promoData.title}".`
        ),
      }));
      notify('Promoción actualizada.');
      return { ok: true, message: 'Promoción actualizada.' };
    }

    const newPromo: Promotion = {
      ...promoData,
      id: `promo-${Date.now()}`,
      entrepreneurId: ownEntrepreneur.id,
      featuredByAdmin: false,
      createdAt: TODAY_ISO,
    };
    setState((prev) => ({
      ...prev,
      promotions: [newPromo, ...prev.promotions],
      auditLogs: appendAudit(
        prev,
        'CREAR_PROMOCION',
        'promotions',
        newPromo.id,
        `Creó promoción "${newPromo.title}" (hasta ${newPromo.endDate}).`
      ),
    }));
    notify('Promoción publicada.');
    return { ok: true, message: 'Promoción creada.' };
  };

  const softDeletePromotion = (promoId: string): ActionResult => {
    if (!currentUser) return { ok: false, message: 'Iniciá sesión.' };
    const promo = state.promotions.find((p) => p.id === promoId);
    if (!promo) return { ok: false, message: 'Promoción no encontrada.' };
    const isAdmin = ['administrador', 'superadministrador'].includes(currentUser.role);
    const isOwner = ownEntrepreneur && promo.entrepreneurId === ownEntrepreneur.id;
    if (!isOwner && !isAdmin) return { ok: false, message: 'Acceso denegado.' };

    setState((prev) => ({
      ...prev,
      promotions: prev.promotions.map((p) =>
        p.id === promoId ? { ...p, deletedAt: TODAY_ISO, status: 'pausada' } : p
      ),
      auditLogs: appendAudit(
        prev,
        'BAJA_PROMOCION',
        'promotions',
        promoId,
        `Eliminó (baja lógica) promoción "${promo.title}".`
      ),
    }));
    notify('Promoción eliminada.');
    return { ok: true, message: 'Promoción eliminada.' };
  };

  const togglePromotionAdminFeatured = (promoId: string) => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) return;
    setState((prev) => {
      const target = prev.promotions.find((p) => p.id === promoId);
      const nextVal = target ? !target.featuredByAdmin : false;
      return {
        ...prev,
        promotions: prev.promotions.map((p) =>
          p.id === promoId ? { ...p, featuredByAdmin: nextVal } : p
        ),
        auditLogs: appendAudit(
          prev,
          'DESTACAR_PROMOCION',
          'promotions',
          promoId,
          `${nextVal ? 'Destacó' : 'Quitó destacado de'} promoción "${target?.title || promoId}".`
        ),
      };
    });
  };

  const saveCategory = (cat: Omit<Category, 'id' | 'slug'> & { id?: string }): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Acceso denegado.' };
    }
    const slug = slugify(cat.name);
    if (cat.id) {
      setState((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === cat.id ? { ...c, ...cat, slug } : c)),
        auditLogs: appendAudit(prev, 'EDITAR_CATEGORIA', 'categories', cat.id!, `Editó rubro "${cat.name}".`),
      }));
      notify('Categoría actualizada.');
      return { ok: true, message: 'Categoría actualizada.' };
    }
    const created: Category = { ...cat, id: `cat-${Date.now()}`, slug };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, created],
      auditLogs: appendAudit(prev, 'CREAR_CATEGORIA', 'categories', created.id, `Creó rubro "${created.name}".`),
    }));
    notify('Categoría creada.');
    return { ok: true, message: 'Categoría creada.' };
  };

  const toggleCategoryActive = (categoryId: string) => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) return;
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === categoryId ? { ...c, active: !c.active } : c)),
    }));
  };

  const saveLocation = (loc: Omit<Location, 'id' | 'slug'> & { id?: string }): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Acceso denegado.' };
    }
    const slug = slugify(loc.name);
    if (loc.id) {
      setState((prev) => ({
        ...prev,
        locations: prev.locations.map((l) => (l.id === loc.id ? { ...l, ...loc, slug } : l)),
        auditLogs: appendAudit(prev, 'EDITAR_LOCALIDAD', 'locations', loc.id!, `Editó localidad "${loc.name}".`),
      }));
      notify('Localidad actualizada.');
      return { ok: true, message: 'Localidad actualizada.' };
    }
    const created: Location = { ...loc, id: `loc-${Date.now()}`, slug };
    setState((prev) => ({
      ...prev,
      locations: [...prev.locations, created],
      auditLogs: appendAudit(prev, 'CREAR_LOCALIDAD', 'locations', created.id, `Agregó localidad "${created.name}, ${created.province}".`),
    }));
    notify('Localidad agregada.');
    return { ok: true, message: 'Localidad creada.' };
  };

  const toggleLocationActive = (locationId: string) => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) return;
    setState((prev) => ({
      ...prev,
      locations: prev.locations.map((l) => (l.id === locationId ? { ...l, active: !l.active } : l)),
    }));
  };

  const toggleFavorite = (entrepreneurId: string): ActionResult => {
    if (!currentUser) {
      return { ok: false, message: 'Ingresá con tu cuenta para guardar favoritos.' };
    }
    const exists = state.favorites.find(
      (f) => f.userId === currentUser.id && f.entrepreneurId === entrepreneurId
    );
    setState((prev) => ({
      ...prev,
      favorites: exists
        ? prev.favorites.filter((f) => f.id !== exists.id)
        : [
            ...prev.favorites,
            {
              id: `fav-${Date.now()}`,
              userId: currentUser.id,
              entrepreneurId,
              createdAt: TODAY_ISO,
            },
          ],
    }));
    notify(exists ? 'Quitado de favoritos.' : 'Guardado en tus favoritos.');
    return { ok: true, message: 'Favorito actualizado.' };
  };

  const recordProfileVisit = (entrepreneurId: string, source: 'portal' | 'feria' | 'buscador') => {
    setState((prev) => ({
      ...prev,
      visits: [
        ...prev.visits,
        {
          id: `vis-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          entrepreneurId,
          date: TODAY_ISO,
          source,
        },
      ],
    }));
  };

  const recordContactClick = (
    entrepreneurId: string,
    channel: 'whatsapp' | 'instagram' | 'facebook' | 'telefono',
    productId?: string
  ) => {
    setState((prev) => ({
      ...prev,
      contactClicks: [
        ...prev.contactClicks,
        {
          id: `clk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          entrepreneurId,
          productId,
          channel,
          createdAt: TODAY_ISO,
        },
      ],
    }));
  };

  const submitReport = (
    targetType: 'emprendimiento' | 'producto',
    targetId: string,
    targetName: string,
    reason: string,
    details: string,
    reporterEmail: string
  ): ActionResult => {
    if (!reason.trim() || !details.trim()) {
      return { ok: false, message: 'Indicá el motivo y el detalle de la denuncia.' };
    }
    const newReport: ContentReport = {
      id: `rep-${Date.now()}`,
      targetType,
      targetId,
      targetName,
      reporterEmail: reporterEmail.trim() || currentUser?.email || 'anonimo@ferialocal.ar',
      reason: reason.trim(),
      details: details.trim(),
      status: 'pendiente',
      createdAt: TODAY_ISO,
    };
    setState((prev) => ({
      ...prev,
      reports: [newReport, ...prev.reports],
    }));
    notify('Denuncia enviada al equipo de moderación.');
    return { ok: true, message: 'Denuncia registrada.' };
  };

  const resolveReport = (
    reportId: string,
    status: ReportStatus,
    moderatorNote: string
  ): ActionResult => {
    if (
      !currentUser ||
      !['moderador', 'administrador', 'superadministrador'].includes(currentUser.role)
    ) {
      return { ok: false, message: 'Acceso denegado.' };
    }
    const target = state.reports.find((r) => r.id === reportId);
    setState((prev) => ({
      ...prev,
      reports: prev.reports.map((r) =>
        r.id === reportId
          ? { ...r, status, moderatorNote, resolvedAt: TODAY_ISO }
          : r
      ),
      auditLogs: appendAudit(
        prev,
        `MOD_DENUNCIA_${status.toUpperCase()}`,
        'reports',
        reportId,
        `Marcó denuncia sobre "${target?.targetName || reportId}" como ${status}.`
      ),
    }));
    notify('Denuncia actualizada.');
    return { ok: true, message: 'Resolución guardada.' };
  };

  const updateUserRoleOrActive = (
    userId: string,
    patch: { role?: UserRole; active?: boolean; plan?: PlanTier }
  ): ActionResult => {
    if (!currentUser || !['administrador', 'superadministrador'].includes(currentUser.role)) {
      return { ok: false, message: 'Acceso denegado.' };
    }
    if (patch.role === 'superadministrador' && currentUser.role !== 'superadministrador') {
      return { ok: false, message: 'Solo un Superadministrador puede asignar el rol Superadministrador.' };
    }
    const target = state.users.find((u) => u.id === userId);
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
      auditLogs: appendAudit(
        prev,
        'GESTION_USUARIO',
        'users',
        userId,
        `Actualizó usuario "${target?.name || userId}" (${JSON.stringify(patch)}).`
      ),
    }));
    notify('Usuario actualizado.');
    return { ok: true, message: 'Usuario actualizado.' };
  };

  const updateRolePermissions = (role: UserRole, permissions: string[]): ActionResult => {
    if (!currentUser || currentUser.role !== 'superadministrador') {
      return { ok: false, message: 'Solo Superadministrador puede modificar permisos.' };
    }
    setState((prev) => ({
      ...prev,
      rolePermissions: prev.rolePermissions.map((rp) =>
        rp.role === role ? { ...rp, permissions } : rp
      ),
      auditLogs: appendAudit(
        prev,
        'ACTUALIZAR_PERMISOS',
        'permissions',
        role,
        `Modificó la matriz de permisos del rol ${role}.`
      ),
    }));
    notify(`Permisos de ${role} actualizados.`);
    return { ok: true, message: 'Permisos guardados.' };
  };

  const updateSystemConfig = (patch: Partial<SystemConfig>): ActionResult => {
    if (!currentUser || currentUser.role !== 'superadministrador') {
      return { ok: false, message: 'Solo Superadministrador puede modificar parámetros globales.' };
    }
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...patch },
      auditLogs: appendAudit(
        prev,
        'ACTUALIZAR_PARAMETROS',
        'system_config',
        'config-1',
        `Modificó configuración global del sistema.`
      ),
    }));
    notify('Parámetros del sistema actualizados.');
    return { ok: true, message: 'Configuración guardada.' };
  };

  const resetPlatformData = () => {
    setState(INITIAL_PLATFORM_STATE);
    localStorage.removeItem(STORAGE_KEY);
    notify('Datos piloto restablecidos.');
  };

  return (
    <PlatformContext.Provider
      value={{
        state,
        currentUser,
        ownEntrepreneur,
        toastMessage,
        notify,
        loginWithCredentials,
        quickLoginAsUser,
        registerAccount,
        verifyCurrentUserEmail,
        recoverPassword,
        logout,
        upsertOwnEntrepreneur,
        moderateEntrepreneurStatus,
        toggleEntrepreneurFeatured,
        createProduct,
        updateProduct,
        softDeleteProduct,
        createOrUpdateFair,
        softDeleteFair,
        requestFairParticipation,
        reviewFairParticipation,
        createOrUpdatePromotion,
        softDeletePromotion,
        togglePromotionAdminFeatured,
        saveCategory,
        toggleCategoryActive,
        saveLocation,
        toggleLocationActive,
        toggleFavorite,
        recordProfileVisit,
        recordContactClick,
        submitReport,
        resolveReport,
        updateUserRoleOrActive,
        updateRolePermissions,
        updateSystemConfig,
        resetPlatformData,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export function usePlatform(): PlatformContextValue {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform debe usarse dentro de PlatformProvider');
  return ctx;
}
