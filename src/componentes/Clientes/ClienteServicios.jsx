import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';

export default function ClienteServicios({ usuarioId }) {
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [usuarioId]);

  async function cargarDatos() {
    if (!usuarioId) return;
    setLoading(true);
    try {
      // Cargar citas completadas del cliente
      const { data: citasData, error: citasErr } = await supabase
        .from('citas')
        .select(`
          id,
          servicios!servicio_id (id, nombre, precio)
        `)
        .eq('cliente_id', usuarioId)
        .eq('estado', 'completado');

      if (!citasErr) {
        setCitas(citasData || []);
      }

      // Cargar todos los servicios
      const { data: svcsData, error: svcsErr } = await supabase
        .from('servicios')
        .select('id, nombre, precio, duracion_minutos')
        .order('nombre');

      if (!svcsErr) {
        setServicios(svcsData || []);
      }
    } catch (e) {
      console.error('Error:', e.message);
    } finally {
      setLoading(false);
    }
  }

  const serviciosFrecuentes = useMemo(() => {
    const frecuencia = {};
    citas.forEach(cita => {
      if (cita.servicios) {
        const id = cita.servicios.id;
        frecuencia[id] = (frecuencia[id] || 0) + 1;
      }
    });
    return Object.entries(frecuencia)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => parseInt(id));
  }, [citas]);

  const serviciosRecomendados = servicios.filter(s => serviciosFrecuentes.includes(s.id));

  if (loading) {
    return (
      <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <p className="text-zinc-400 animate-pulse">Cargando servicios...</p>
      </section>
    );
  }

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-8">
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Mis Servicios</h3>
        <p className="text-sm text-zinc-400">Servicios más frecuentes y catálogo disponible.</p>
      </div>

      {serviciosRecomendados.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-zinc-100 mb-4">🔥 Más Frecuentes</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviciosRecomendados.map((svc) => (
              <div key={svc.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                <div>
                  <p className="font-semibold text-zinc-100">{svc.nombre}</p>
                  <p className="text-xs text-zinc-500 mt-1">{svc.duracion_minutos} min</p>
                </div>
                <p className="text-2xl font-semibold text-amber-300">Bs. {Number(svc.precio).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold text-zinc-100 mb-4">📋 Todos los Servicios</h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.length === 0 ? (
            <p className="text-zinc-500">No hay servicios disponibles.</p>
          ) : (
            servicios.map((svc) => (
              <div key={svc.id} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 space-y-3">
                <div>
                  <p className="font-semibold text-zinc-100">{svc.nombre}</p>
                  <p className="text-xs text-zinc-500 mt-1">{svc.duracion_minutos} min</p>
                </div>
                <p className="text-2xl font-semibold text-amber-300">Bs. {Number(svc.precio).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
