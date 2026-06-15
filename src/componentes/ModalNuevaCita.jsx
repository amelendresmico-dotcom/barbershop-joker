import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function ModalNuevaCita({ onClose, onCitaCreada }) {
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', barbero_id: '', servicio_id: '', fecha: '', hora: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const [{ data: barb }, { data: serv }, { data: cli }] = await Promise.all([
        supabase.from('usuarios').select('id, nombre').eq('rol_id', 2),
        supabase.from('servicios').select('id, nombre, precio, duracion_minutos'),
        supabase.from('usuarios').select('id, nombre, correo').eq('rol_id', 3),
      ]);
      setBarberos(barb || []);
      setServicios(serv || []);
      setClientes(cli || []);
    };
    cargarDatos();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.cliente_id || !form.barbero_id || !form.servicio_id || !form.fecha || !form.hora) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    const fecha_hora = `${form.fecha}T${form.hora}:00`;
    const { error: insertError } = await supabase.from('citas').insert({
      cliente_id: parseInt(form.cliente_id),
      barbero_id: parseInt(form.barbero_id),
      servicio_id: parseInt(form.servicio_id),
      fecha_hora,
      estado: 'pendiente',
    });
    setLoading(false);
    if (insertError) {
      setError('Error al crear la cita: ' + insertError.message);
    } else {
      onCitaCreada();
      onClose();
    }
  };

  const servicioSeleccionado = servicios.find(s => s.id === parseInt(form.servicio_id));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Nueva Cita</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Completa los datos para agendar</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800"
          >✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Cliente</label>
            <select name="cliente_id" value={form.cliente_id} onChange={handleChange} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all">
              <option value="">Seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre || c.correo}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Barbero</label>
            <select name="barbero_id" value={form.barbero_id} onChange={handleChange} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all">
              <option value="">Seleccionar barbero...</option>
              {barberos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Servicio</label>
            <select name="servicio_id" value={form.servicio_id} onChange={handleChange} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all">
              <option value="">Seleccionar servicio...</option>
              {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — Bs. {s.precio}</option>)}
            </select>
            {servicioSeleccionado && (
              <p className="text-xs text-zinc-500 mt-1">⏱ Duración: {servicioSeleccionado.duracion_minutos} min</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Hora</label>
              <input type="time" name="hora" value={form.hora} onChange={handleChange} className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all" />
            </div>
          </div>
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 text-sm font-medium rounded-xl border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-4 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}