import { useState } from 'react';
import ClientePerfil from './ClientePerfil';
import ClienteHistorialCitas from './ClienteHistorialCitas';
import ClienteServicios from './ClienteServicios';
import ClienteCalificaciones from './ClienteCalificaciones';
import ClientePagos from './ClientePagos';

const TABS = [
  { id: 'perfil', label: '👤 Perfil', icon: '👤' },
  { id: 'citas', label: '📅 Mis Citas', icon: '📅' },
  { id: 'servicios', label: '✂️ Servicios', icon: '✂️' },
  { id: 'calificaciones', label: '⭐ Calificaciones', icon: '⭐' },
  { id: 'pagos', label: '💳 Pagos', icon: '💳' },
];

export default function PanelCliente({ usuarioId }) {
  const [tabActiva, setTabActiva] = useState('perfil');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
              tabActiva === tab.id
                ? 'bg-amber-500 text-zinc-950'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabActiva === 'perfil' && <ClientePerfil usuarioId={usuarioId} />}
      {tabActiva === 'citas' && <ClienteHistorialCitas usuarioId={usuarioId} />}
      {tabActiva === 'servicios' && <ClienteServicios usuarioId={usuarioId} />}
      {tabActiva === 'calificaciones' && <ClienteCalificaciones usuarioId={usuarioId} />}
      {tabActiva === 'pagos' && <ClientePagos usuarioId={usuarioId} />}
    </div>
  );
}
