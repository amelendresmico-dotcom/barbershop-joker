import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ModalBarbero from './ModalBarbero';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';

export default function GestionBarberos() {
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [barberoEditar, setBarberoEditar] = useState(null);
  const [barberoEliminar, setBarberoEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const cargarBarberos = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, telefono, estado, fecha_registro')
      .eq('rol_id', 2)
      .order('nombre', { ascending: true });
    setBarberos(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarBarberos(); }, []);

  const abrirNuevo = () => { setBarberoEditar(null); setModalAbierto(true); };
  const abrirEditar = (barbero) => { setBarberoEditar(barbero); setModalAbierto(true); };

  const confirmarEliminar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    const { error } = await supabase
      .from('usuarios')
      .update({ estado: 'inactivo' })
      .eq('id', barberoEliminar.id);
    setEliminando(false);
    if (error) {
      setErrorEliminar('No se pudo desactivar: ' + error.message);
    } else {
      setBarberoEliminar(null);
      cargarBarberos();
    }
  };

  const estadoBadge = (estado) => {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border';
    if (estado === 'activo') return `${base} bg-green-900/30 text-green-400 border-green-800`;
    return `${base} bg-zinc-800 text-zinc-500 border-zinc-700`;
  };

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
      {modalAbierto && (
        <ModalBarbero
          barbero={barberoEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarBarberos}
        />
      )}
      {barberoEliminar && (
        <ModalConfirmarEliminar
          nombre={barberoEliminar.nombre}
          loading={eliminando}
          error={errorEliminar}
          onClose={() => { setBarberoEliminar(null); setErrorEliminar(null); }}
          onConfirmar={confirmarEliminar}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Barberos</h3>
          <p className="text-xs text-zinc-400">Equipo de barberos registrados en el sistema.</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10"
        >
          + Nuevo Barbero
        </button>
      </div>

      {cargando ? (
        <p className="text-sm text-zinc-500 animate-pulse">Cargando barberos...</p>
      ) : barberos.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay barberos registrados aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 uppercase text-xs tracking-wider border-b border-zinc-800">
                <th className="py-3 pr-4 font-medium">Nombre</th>
                <th className="py-3 pr-4 font-medium">Correo</th>
                <th className="py-3 pr-4 font-medium">Teléfono</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {barberos.map((b) => (
                <tr key={b.id} className="text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{b.nombre}</td>
                  <td className="py-3 pr-4 text-zinc-400">{b.correo}</td>
                  <td className="py-3 pr-4 text-zinc-400">{b.telefono || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={estadoBadge(b.estado)}>{b.estado || 'activo'}</span>
                  </td>
                  <td className="py-3 pr-4 text-right space-x-2">
                    <button
                      onClick={() => abrirEditar(b)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
                    >✏️ Editar</button>
                    <button
                      onClick={() => setBarberoEliminar(b)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
                    >🚫 Desactivar</button>
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