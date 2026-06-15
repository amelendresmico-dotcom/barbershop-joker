import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import ModalCliente from './ModalCliente';
import ModalConfirmarEliminar from '../compartido/ModalConfirmarEliminar';

export default function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('usuarios')
      .select('id, nombre, correo, telefono, estado, fecha_registro')
      .eq('rol_id', 3)
      .order('nombre');
    setClientes(data || []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const abrirEditar = (cliente) => {
    setClienteEditando(cliente);
    setModalAbierto(true);
  };

  const handleEliminar = async (id) => {
    await supabase.from('usuarios').delete().eq('id', id);
    setConfirmEliminar(null);
    cargar();
  };

  const clientesFiltrados = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.correo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  return (
    <>
      {modalAbierto && (
        <ModalCliente
          cliente={clienteEditando}
          onClose={() => { setModalAbierto(false); setClienteEditando(null); }}
          onGuardado={cargar}
        />
      )}

      {confirmEliminar && (
        <ModalConfirmarEliminar
          mensaje="¿Eliminar cliente? Esta acción no se puede deshacer y eliminará también sus citas asociadas."
          onConfirmar={() => handleEliminar(confirmEliminar)}
          onCancelar={() => setConfirmEliminar(null)}
        />
      )}

      <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-zinc-100">Gestión de Clientes</h3>
            <p className="text-xs text-zinc-400">{clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre, correo o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder-zinc-500"
        />

        {loading ? (
          <p className="text-center py-8 text-zinc-400 text-sm animate-pulse">Cargando clientes...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Correo</th>
                  <th className="p-4 font-semibold">Teléfono</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold">Registro</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-sm text-zinc-300">
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-zinc-500 italic">
                      {busqueda ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados.'}
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 font-semibold text-zinc-100">👤 {c.nombre || '—'}</td>
                      <td className="p-4 text-zinc-400">{c.correo}</td>
                      <td className="p-4">{c.telefono || '—'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase ${
                          c.estado === 'activo'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {c.estado || 'activo'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString('es-BO') : '—'}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button onClick={() => abrirEditar(c)} className="text-xs text-blue-400 hover:underline font-medium">Editar</button>
                        <button onClick={() => setConfirmEliminar(c.id)} className="text-xs text-red-400 hover:underline font-medium">Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}