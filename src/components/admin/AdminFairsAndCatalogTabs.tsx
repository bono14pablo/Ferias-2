import React, { useState } from 'react';
import { Plus, Star, Trash2, Check, X } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import { SEED_MEDIA } from '../../data/seedMedia';
import { Fair, FairStatus } from '../../types/platform';
import {
  isPromotionCurrentlyActive,
  isPromotionExpired,
} from '../../utils/platformHelpers';

export const AdminFairsTab: React.FC = () => {
  const { state, createOrUpdateFair, softDeleteFair } = usePlatform();
  const [editingFair, setEditingFair] = useState<Fair | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [province, setProvince] = useState('Buenos Aires');
  const [locationId, setLocationId] = useState(state.locations[0]?.id || '');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('-34.46712');
  const [lng, setLng] = useState('-58.50895');
  const [operatingDays, setOperatingDays] = useState('Sábados y Domingos');
  const [hours, setHours] = useState('10:30 a 19:00 hs');
  const [specialDates, setSpecialDates] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [status, setStatus] = useState<FairStatus>('activa');

  const openCreate = () => {
    setEditingFair(null);
    setName('');
    setDescription('');
    setProvince('Buenos Aires');
    setLocationId(state.locations[0]?.id || '');
    setAddress('');
    setLat('-34.46712');
    setLng('-58.50895');
    setOperatingDays('Sábados y Domingos');
    setHours('10:30 a 19:00 hs');
    setSpecialDates('');
    setOrganizerName('');
    setOrganizerContact('');
    setStatus('proxima');
    setFormOpen(true);
  };

  const openEdit = (f: Fair) => {
    setEditingFair(f);
    setName(f.name);
    setDescription(f.description);
    setProvince(f.province);
    setLocationId(f.locationId);
    setAddress(f.address);
    setLat(String(f.lat));
    setLng(String(f.lng));
    setOperatingDays(f.operatingDays);
    setHours(f.hours);
    setSpecialDates(f.specialDates || '');
    setOrganizerName(f.organizerName);
    setOrganizerContact(f.organizerContact);
    setStatus(f.status);
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateFair({
      id: editingFair?.id,
      name: name.trim(),
      description: description.trim(),
      mainImageUrl: editingFair?.mainImageUrl || SEED_MEDIA.feriaSanIsidro,
      galleryUrls: editingFair?.galleryUrls || [SEED_MEDIA.feriaSanIsidro],
      province: province.trim(),
      locationId,
      address: address.trim(),
      lat: Number(lat) || -34.6037,
      lng: Number(lng) || -58.3816,
      operatingDays: operatingDays.trim(),
      hours: hours.trim(),
      specialDates: specialDates.trim() || undefined,
      schedules: editingFair?.schedules || [{ id: 'sch-new', dayLabel: operatingDays, hours }],
      organizerName: organizerName.trim(),
      organizerContact: organizerContact.trim(),
      status,
    });
    setFormOpen(false);
  };

  const visibleFairs = state.fairs.filter((f) => !f.deletedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ferias registradas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administrá sedes, coordenadas geográficas para OpenStreetMap, horarios y organizadores.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva feria</span>
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {editingFair ? `Editar: ${editingFair.name}` : 'Registrar nueva feria'}
            </h3>
            <button type="button" onClick={() => setFormOpen(false)} className="text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nombre de la feria</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Localidad</label>
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
              <label className="block text-xs font-medium text-slate-700 mb-1">Provincia</label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Dirección</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Latitud (OSM)</label>
              <input
                type="text"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Longitud (OSM)</label>
              <input
                type="text"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-num border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Días de funcionamiento</label>
              <input
                type="text"
                required
                value={operatingDays}
                onChange={(e) => setOperatingDays(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Horarios</label>
              <input
                type="text"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Organizador</label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FairStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="activa">Activa</option>
                <option value="proxima">Próxima</option>
                <option value="finalizada">Finalizada</option>
                <option value="inactiva">Inactiva</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs border border-slate-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#0F5C4D] text-white rounded-lg"
            >
              Guardar feria
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-4">Feria</th>
                <th className="py-2.5 px-4">Localidad</th>
                <th className="py-2.5 px-4">Días y horario</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {visibleFairs.map((f) => {
                const loc = state.locations.find((l) => l.id === f.locationId);
                return (
                  <tr key={f.id}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{f.name}</div>
                      <div className="text-[11px] text-slate-500">{f.address}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {loc?.name}, {f.province}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {f.operatingDays} · {f.hours}
                    </td>
                    <td className="py-3 px-4 capitalize font-medium text-slate-800">
                      {f.status}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openEdit(f)}
                        className="text-xs font-medium text-[#0F5C4D] hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => softDeleteFair(f.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Baja
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AdminParticipantsTab: React.FC = () => {
  const { state, reviewFairParticipation } = usePlatform();
  const [standInputs, setStandInputs] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Participantes de ferias</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Aprobá o rechazá solicitudes de vendedores y asigná número de puesto.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-4">Emprendimiento</th>
                <th className="py-2.5 px-4">Feria</th>
                <th className="py-2.5 px-4">Puesto</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Resolución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {state.participants.map((pt) => {
                const ent = state.entrepreneurs.find((e) => e.id === pt.entrepreneurId);
                const fair = state.fairs.find((f) => f.id === pt.fairId);
                return (
                  <tr key={pt.id}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {ent?.commercialName || pt.entrepreneurId}
                      </div>
                      {pt.requestNote && (
                        <div className="text-[11px] text-slate-500">{pt.requestNote}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{fair?.name || pt.fairId}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={standInputs[pt.id] ?? pt.standNumber ?? ''}
                        onChange={(e) =>
                          setStandInputs((prev) => ({ ...prev, [pt.id]: e.target.value }))
                        }
                        placeholder="Ej. Puesto 18"
                        className="w-28 px-2 py-1 text-xs border border-slate-200 rounded"
                      />
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold">
                      <span
                        className={
                          pt.status === 'aprobada'
                            ? 'text-emerald-700'
                            : pt.status === 'pendiente'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }
                      >
                        {pt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            reviewFairParticipation(
                              pt.id,
                              'aprobada',
                              standInputs[pt.id] ?? pt.standNumber ?? 'Puesto Asignado'
                            )
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-medium"
                        >
                          <Check className="w-3 h-3" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewFairParticipation(pt.id, 'rechazada')}
                          className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-medium"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewFairParticipation(pt.id, 'finalizada')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Finalizar
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
    </div>
  );
};

export const AdminCategoriesLocationsTab: React.FC = () => {
  const {
    state,
    saveCategory,
    toggleCategoryActive,
    saveLocation,
    toggleLocationActive,
  } = usePlatform();

  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [locName, setLocName] = useState('');
  const [locProv, setLocProv] = useState('Buenos Aires');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Categorías / Rubros</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!catName.trim()) return;
            saveCategory({ name: catName.trim(), description: catDesc.trim(), active: true });
            setCatName('');
            setCatDesc('');
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            placeholder="Nuevo rubro"
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
            placeholder="Descripción breve"
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg whitespace-nowrap"
          >
            Agregar
          </button>
        </form>
        <div className="divide-y divide-slate-200 text-xs">
          {state.categories.map((c) => (
            <div key={c.id} className="py-2.5 flex items-center justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-900">{c.name}</div>
                <div className="text-[11px] text-slate-500">{c.description}</div>
              </div>
              <button
                type="button"
                onClick={() => toggleCategoryActive(c.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {c.active ? 'Activa' : 'Inactiva'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Localidades</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!locName.trim()) return;
            saveLocation({ name: locName.trim(), province: locProv.trim(), active: true });
            setLocName('');
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={locName}
            onChange={(e) => setLocName(e.target.value)}
            placeholder="Localidad (ej. Tigre)"
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <input
            type="text"
            value={locProv}
            onChange={(e) => setLocProv(e.target.value)}
            placeholder="Provincia"
            className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0F5C4D] text-white text-xs font-medium rounded-lg whitespace-nowrap"
          >
            Agregar
          </button>
        </form>
        <div className="divide-y divide-slate-200 text-xs">
          {state.locations.map((l) => (
            <div key={l.id} className="py-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-900">{l.name}</span>
                <span className="text-slate-500"> · {l.province}</span>
              </div>
              <button
                type="button"
                onClick={() => toggleLocationActive(l.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium ${
                  l.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {l.active ? 'Activa' : 'Inactiva'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminPromotionsTab: React.FC = () => {
  const { state, togglePromotionAdminFeatured, softDeletePromotion } = usePlatform();
  const visiblePromos = state.promotions.filter((p) => !p.deletedAt);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Promociones de la plataforma</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configurá promociones destacadas en portada. Las vencidas se muestran aquí con etiqueta informativa y quedan ocultas al público.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
              <th className="py-2.5 px-4">Promoción</th>
              <th className="py-2.5 px-4">Emprendimiento</th>
              <th className="py-2.5 px-4">Vigencia</th>
              <th className="py-2.5 px-4">Estado público</th>
              <th className="py-2.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {visiblePromos.map((pr) => {
              const ent = state.entrepreneurs.find((e) => e.id === pr.entrepreneurId);
              const expired = isPromotionExpired(pr);
              const active = isPromotionCurrentlyActive(pr);
              return (
                <tr key={pr.id}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{pr.title}</td>
                  <td className="py-3 px-4 text-slate-600">{ent?.commercialName}</td>
                  <td className="py-3 px-4 font-mono-num text-slate-600">
                    {pr.startDate} → {pr.endDate}
                  </td>
                  <td className="py-3 px-4">
                    {expired ? (
                      <span className="text-slate-500">Vencida (oculta automáticamente)</span>
                    ) : active ? (
                      <span className="text-emerald-700 font-medium">Visible en portal</span>
                    ) : (
                      <span className="text-amber-700">Pausada</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => togglePromotionAdminFeatured(pr.id)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                        pr.featuredByAdmin
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>{pr.featuredByAdmin ? 'Destacada' : 'Destacar'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => softDeletePromotion(pr.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Dar de baja"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
