import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ModalServicio from './ModalServicio';
import ModalConfirmarEliminar from './ModalConfirmarEliminar';

export default function GestionServicios() {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditar, setServicioEditar] = useState(null);
  const [servicioEliminar, setServicioEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const cargarServicios = async () => {
    setCargando(true);
    const { data } = await supabase
      .from('servicios')
      .select('id, nombre, precio, duracion_minutos')
      .order('nombre', { ascending: true });
    setServicios(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarServicios(); }, []);

  const abrirNuevo = () => { setServicioEditar(null); setModalAbierto(true); };
  const abrirEditar = (servicio) => { setServicioEditar(servicio); setModalAbierto(true); };

  const confirmarEliminar = async () => {
    setEliminando(true);
    setErrorEliminar(null);
    const { error } = await supabase.from('servicios').delete().eq('id', servicioEliminar.id);
    setEliminando(false);
    if (error) {
      setErrorEliminar('No se pudo eliminar: ' + error.message);
    } else {
      setServicioEliminar(null);
      cargarServicios();
    }
  };

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
      {modalAbierto && (
        <ModalServicio
          servicio={servicioEditar}
          onClose={() => setModalAbierto(false)}
          onGuardado={cargarServicios}
        />
      )}
      {servicioEliminar && (
        <ModalConfirmarEliminar
          nombre={servicioEliminar.nombre}
          loading={eliminando}
          error={errorEliminar}
          onClose={() => { setServicioEliminar(null); setErrorEliminar(null); }}
          onConfirmar={confirmarEliminar}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-zinc-100">Servicios</h3>
          <p className="text-xs text-zinc-400">Catálogo de servicios ofrecidos en la barbería.</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10"
        >
          + Nuevo Servicio
        </button>
      </div>

      {cargando ? (
        <p className="text-sm text-zinc-500 animate-pulse">Cargando servicios...</p>
      ) : servicios.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay servicios registrados aún.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-500 uppercase text-xs tracking-wider border-b border-zinc-800">
                <th className="py-3 pr-4 font-medium">Nombre</th>
                <th className="py-3 pr-4 font-medium">Precio</th>
                <th className="py-3 pr-4 font-medium">Duración</th>
                <th className="py-3 pr-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {servicios.map((s) => (
                <tr key={s.id} className="text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{s.nombre}</td>
                  <td className="py-3 pr-4 text-amber-500 font-semibold">Bs. {Number(s.precio).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-zinc-400">{s.duracion_minutos} min</td>
                  <td className="py-3 pr-4 text-right space-x-2">
                    <button
                      onClick={() => abrirEditar(s)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-all"
                    >✏️ Editar</button>
                    <button
                      onClick={() => setServicioEliminar(s)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-900 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
                    >🗑️ Eliminar</button>
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