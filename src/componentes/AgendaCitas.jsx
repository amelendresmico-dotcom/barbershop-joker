import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function AgendaCitas({ rol = 'Administrador', usuarioId = null }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const obtenerCitas = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('citas')
        .select(`
          id,
          fecha_hora,
          estado,
          cliente:usuarios!citas_cliente_id_fkey (nombre),
          barbero:usuarios!citas_barbero_id_fkey (nombre),
          servicios!servicio_id (nombre)
        `)
        .order('fecha_hora', { ascending: true });

      // Filtrar según el rol
      if (rol === 'Barbero' && usuarioId) {
        query = query.eq('barbero_id', usuarioId);
      } else if (rol === 'Cliente' && usuarioId) {
        query = query.eq('cliente_id', usuarioId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setCitas(data || []);
    } catch (err) {
      console.error('Error al cargar citas:', err.message);
      setError('No se pudieron sincronizar las citas con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('citas')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    if (!error) obtenerCitas();
  };

  useEffect(() => {
    obtenerCitas();
  }, [rol, usuarioId]);

  if (loading) return (
    <div className="text-center py-8 text-zinc-400 font-medium animate-pulse">
      Sincronizando agenda...
    </div>
  );

  if (error) return (
    <div className="bg-red-950/30 border border-red-500 text-red-200 p-4 rounded-xl text-sm text-center">
      {error}
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
            <th className="p-4 font-semibold">Fecha y Hora</th>
            <th className="p-4 font-semibold">Cliente</th>
            {rol !== 'Cliente' && <th className="p-4 font-semibold">Barbero</th>}
            <th className="p-4 font-semibold">Servicio</th>
            <th className="p-4 font-semibold">Estado</th>
            {rol !== 'Cliente' && <th className="p-4 font-semibold text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
          {citas.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-zinc-500 italic">
                No hay citas programadas.
              </td>
            </tr>
          ) : (
            citas.map((cita) => {
              const fechaCita = cita.fecha_hora
                ? new Date(cita.fecha_hora).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })
                : '--/-- --:--';

              const estadoColor = {
                Pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                en_proceso: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                completado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
              };

              return (
                <tr key={cita.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-mono text-amber-500 font-bold">{fechaCita}</td>
                  <td className="p-4 font-medium text-zinc-100">{cita.cliente?.nombre || 'Cliente General'}</td>
                  {rol !== 'Cliente' && (
                    <td className="p-4">{cita.barbero?.nombre || 'Sin asignar'}</td>
                  )}
                  <td className="p-4">{cita.servicios?.nombre || 'Servicio Regular'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase ${estadoColor[cita.estado] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                      {cita.estado || 'pendiente'}
                    </span>
                  </td>
                  {rol !== 'Cliente' && (
                    <td className="p-4 text-right space-x-2">
                      {cita.estado !== 'completado' && cita.estado !== 'cancelado' && (
                        <>
                          <button
                            onClick={() => cambiarEstado(cita.id, 'completado')}
                            className="text-xs text-emerald-400 hover:underline font-medium"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => cambiarEstado(cita.id, 'cancelado')}
                            className="text-xs text-red-400 hover:underline font-medium"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}