import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function GestionComisiones() {
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState({});
  const [error, setError] = useState(null);

  const cargarBarberos = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, porcentaje_comision, estado')
      .eq('rol_id', 2)
      .order('nombre', { ascending: true });
    setBarberos(data || []);
    setCargando(false);
  };

  useEffect(() => { 
    cargarBarberos(); 
  }, []);

  const actualizarComision = async (barberoId, nuevoValor) => {
    setGuardando(prev => ({ ...prev, [barberoId]: true }));
    setError(null);

    if (Number(nuevoValor) < 0 || Number(nuevoValor) > 100) {
      setError('El porcentaje debe estar entre 0 y 100');
      setGuardando(prev => ({ ...prev, [barberoId]: false }));
      return;
    }

    const { error: dbError } = await supabase
      .from('usuarios')
      .update({ porcentaje_comision: Number(nuevoValor) })
      .eq('id', barberoId);

    setGuardando(prev => ({ ...prev, [barberoId]: false }));
    
    if (dbError) {
      setError('Error al guardar: ' + dbError.message);
    } else {
      cargarBarberos();
    }
  };

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-zinc-100">Comisiones por Barbero</h3>
        <p className="text-xs text-zinc-400">Gestiona el porcentaje de comisión de cada barbero.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-zinc-500 animate-pulse">Cargando barberos...</p>
      ) : barberos.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay barberos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 uppercase text-xs tracking-wider border-b border-zinc-800">
                <th className="py-3 pr-4 font-medium">Barbero</th>
                <th className="py-3 pr-4 font-medium">Correo</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">% Comisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {barberos.map((b) => (
                <tr key={b.id} className="text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{b.nombre}</td>
                  <td className="py-3 pr-4 text-zinc-400">{b.correo}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                      b.estado === 'activo' 
                        ? 'bg-green-900/30 text-green-400 border-green-800' 
                        : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                    }`}>
                      {b.estado || 'activo'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={b.porcentaje_comision ?? 30}
                        onChange={(e) => actualizarComision(b.id, e.target.value)}
                        disabled={guardando[b.id]}
                        className="w-16 px-2 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                      />
                      <span className="text-zinc-400">%</span>
                      {guardando[b.id] && (
                        <span className="text-xs text-amber-400 animate-pulse">Guardando...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
