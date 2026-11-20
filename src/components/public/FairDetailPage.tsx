import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  Store,
  UserCheck,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import {
  buildOpenStreetMapEmbedUrl,
  buildOpenStreetMapLink,
} from '../../utils/platformHelpers';
import { SafeImage } from '../common/SafeImage';

interface FairDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectEntrepreneur: (slug: string) => void;
  onRequireAuth: () => void;
}

export const FairDetailPage: React.FC<FairDetailPageProps> = ({
  slug,
  onBack,
  onSelectEntrepreneur,
  onRequireAuth,
}) => {
  const { state, currentUser, ownEntrepreneur, requestFairParticipation } = usePlatform();
  const [requestNote, setRequestNote] = useState('');

  const fair = state.fairs.find((f) => f.slug === slug && !f.deletedAt);

  if (!fair) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-[#141619]">Feria no encontrada</h1>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0F5C4D] text-white rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al portal</span>
        </button>
      </div>
    );
  }

  const location = state.locations.find((l) => l.id === fair.locationId);
  const approvedParticipants = state.participants
    .filter((pt) => pt.fairId === fair.id && pt.status === 'aprobada')
    .map((pt) => ({
      participant: pt,
      entrepreneur: state.entrepreneurs.find(
        (e) => e.id === pt.entrepreneurId && !e.deletedAt && e.status === 'publicado'
      ),
    }))
    .filter((item) => item.entrepreneur);

  const ownRequest = ownEntrepreneur
    ? state.participants.find(
        (pt) => pt.fairId === fair.id && pt.entrepreneurId === ownEntrepreneur.id
      )
    : null;

  const statusLabel =
    fair.status === 'activa'
      ? 'Feria activa'
      : fair.status === 'proxima'
      ? 'Próxima edición'
      : 'Finalizada';

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestFairParticipation(fair.id, requestNote);
    setRequestNote('');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#141619] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al portal</span>
      </button>

      {/* Main Hero Card */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 min-h-[260px] lg:min-h-[380px] bg-[#EFECE6]">
            <SafeImage
              src={fair.mainImageUrl}
              alt={fair.name}
              fallbackLabel={fair.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-medium text-[#0F5C4D] flex items-center gap-2">
                <span>{statusLabel}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {location?.name}, {fair.province}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#141619]">
                {fair.name}
              </h1>
              <p className="text-sm text-[#4B5563] leading-relaxed">{fair.description}</p>
            </div>

            <div className="space-y-3 text-sm pt-4 border-t border-[#E5E7EB]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                <span>{fair.address}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                <span>{fair.operatingDays}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#0F5C4D] mt-0.5 shrink-0" />
                <span>{fair.hours}</span>
              </div>
              {fair.specialDates && (
                <div className="p-3 bg-[#FAF9F6] rounded-lg border border-[#E5E7EB] text-xs text-[#374151]">
                  <span className="font-semibold text-[#141619]">Fechas especiales: </span>
                  {fair.specialDates}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map + Organizer + Participation Request */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#141619]">Ubicación en OpenStreetMap</h2>
              <p className="text-xs font-mono-num text-[#5C636E]">
                {fair.lat.toFixed(5)}, {fair.lng.toFixed(5)}
              </p>
            </div>
            <a
              href={buildOpenStreetMapLink(fair.lat, fair.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5C4D] hover:underline"
            >
              <span>Abrir mapa</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="flex-1 min-h-[280px] bg-[#EFECE6]">
            <iframe
              title={`Mapa de ${fair.name}`}
              src={buildOpenStreetMapEmbedUrl(fair.lat, fair.lng)}
              className="w-full h-full min-h-[280px] border-0"
              loading="lazy"
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#141619]">Organización y horarios</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 py-1.5 border-b border-[#F3F2EE]">
                <span className="text-[#5C636E]">Organizador</span>
                <span className="font-medium text-[#141619] text-right">{fair.organizerName}</span>
              </div>
              <div className="flex justify-between gap-4 py-1.5 border-b border-[#F3F2EE]">
                <span className="text-[#5C636E]">Contacto</span>
                <span className="font-mono-num text-[#141619]">{fair.organizerContact}</span>
              </div>
              {fair.instagram && (
                <div className="flex justify-between gap-4 py-1.5 border-b border-[#F3F2EE]">
                  <span className="text-[#5C636E]">Instagram</span>
                  <span className="inline-flex items-center gap-1 text-[#141619]">
                    <Instagram className="w-3.5 h-3.5" />
                    {fair.instagram}
                  </span>
                </div>
              )}
            </div>

            {fair.schedules.length > 0 && (
              <div className="pt-2 space-y-2">
                <div className="text-xs font-semibold text-[#5C636E]">Cronograma habitual</div>
                {fair.schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB]"
                  >
                    <span className="font-medium text-[#141619]">{sch.dayLabel}</span>
                    <span className="font-mono-num text-[#4B5563]">{sch.hours}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 space-y-3">
            <h2 className="text-base font-semibold text-[#141619]">Participar como vendedor</h2>
            {!currentUser ? (
              <>
                <p className="text-xs text-[#5C636E]">
                  ¿Tenés un emprendimiento y querés sumar tu puesto en esta feria?
                </p>
                <button
                  type="button"
                  onClick={onRequireAuth}
                  className="w-full py-2.5 px-4 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Ingresar como emprendedor
                </button>
              </>
            ) : currentUser.role !== 'vendedor' ? (
              <p className="text-xs text-[#5C636E]">
                Las solicitudes de puesto se realizan desde una cuenta de vendedor con emprendimiento registrado.
              </p>
            ) : !ownEntrepreneur ? (
              <p className="text-xs text-[#5C636E]">
                Completá primero la ficha de tu emprendimiento en "Mi panel" para postularte a ferias.
              </p>
            ) : ownRequest ? (
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#141619]">
                  <UserCheck className="w-4 h-4 text-[#0F5C4D]" />
                  <span>Estado de tu solicitud: {ownRequest.status.toUpperCase()}</span>
                </div>
                {ownRequest.standNumber && (
                  <div className="text-[#5C636E]">Ubicación asignada: {ownRequest.standNumber}</div>
                )}
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-3">
                <input
                  type="text"
                  value={requestNote}
                  onChange={(e) => setRequestNote(e.target.value)}
                  placeholder="Nota opcional (rubro, necesidad eléctrica, fechas)"
                  className="w-full px-3 py-2 text-xs border border-[#D1D5DB] rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#0F5C4D] hover:bg-[#0B473B] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Solicitar participación
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Participating Entrepreneurs */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#141619]">
            Emprendimientos participantes ({approvedParticipants.length})
          </h2>
        </div>

        {approvedParticipants.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center text-sm text-[#5C636E]">
            Aún no hay emprendimientos confirmados para esta edición.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedParticipants.map(({ entrepreneur, participant }) => {
              if (!entrepreneur) return null;
              const cat = state.categories.find(
                (c) => c.id === entrepreneur.primaryCategoryId
              );
              return (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => onSelectEntrepreneur(entrepreneur.slug)}
                  className="text-left bg-white rounded-xl border border-[#E5E7EB] hover:border-[#0F5C4D] p-4 flex items-center gap-4 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E5E7EB] shrink-0 bg-[#EFECE6]">
                    <SafeImage
                      src={entrepreneur.logoUrl}
                      alt={entrepreneur.commercialName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[#5C636E] flex items-center gap-1.5">
                      <span className="truncate">{cat?.name}</span>
                      {participant.standNumber && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#0F5C4D] font-medium whitespace-nowrap">
                            {participant.standNumber}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-base font-semibold text-[#141619] truncate mt-0.5">
                      {entrepreneur.commercialName}
                    </div>
                    <div className="text-xs text-[#5C636E] truncate mt-0.5 inline-flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Ver catálogo</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
