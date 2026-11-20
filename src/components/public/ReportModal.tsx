import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

interface ReportModalProps {
  target: {
    type: 'emprendimiento' | 'producto';
    id: string;
    name: string;
  } | null;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Información de contacto o horario desactualizado',
  'Producto prohibido o no artesanal',
  'Precio o promoción engañosa',
  'Contenido inapropiado o suplantación',
];

export const ReportModal: React.FC<ReportModalProps> = ({ target, onClose }) => {
  const { currentUser, submitReport } = usePlatform();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [error, setError] = useState<string | null>(null);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = submitReport(target.type, target.id, target.name, reason, details, email);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setDetails('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-700" />
            <h2 id="report-modal-title" className="text-base font-semibold text-[#141619]">
              Reportar contenido
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-[#5C636E] hover:bg-[#F3F2EE]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-[#5C636E]">
            Publicación reportada:{' '}
            <span className="font-semibold text-[#141619]">{target.name}</span>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#141619] mb-1.5">
              Motivo
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#141619] mb-1.5">
              Detalle para moderación
            </label>
            <textarea
              rows={3}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describí brevemente el inconveniente detectado..."
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#141619] mb-1.5">
              Tu correo de contacto (opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.ar"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D1D5DB] rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#5C636E] border border-[#E5E7EB] rounded-lg hover:bg-[#F3F2EE]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg"
            >
              Enviar denuncia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
