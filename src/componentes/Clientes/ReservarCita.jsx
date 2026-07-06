import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export default function ReservarCita({ usuarioId }) {
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [form, setForm] = useState({ barbero_id: '', servicio_id: '', fecha: '', hora: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const cargarOpciones = async () => {
      const [{ data: barb }, { data: serv }] = await Promise.all([
        supabase.from('usuarios').select('id, nombre').eq('rol_id', 2),
        supabase.from('servicios').select('id, nombre, precio, duracion_minutos'),
      ]);

      setBarberos(barb || []);
      setServicios(serv || []);
    };
    cargarOpciones();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.barbero_id || !form.servicio_id || !form.fecha || !form.hora) {
      setError('Completa todos los campos para agendar la cita.');
      return;
    }

    setLoading(true);
    const fecha_hora = `${form.fecha}T${form.hora}:00`;
    const { error: insertError } = await supabase.from('citas').insert({
      cliente_id: parseInt(usuarioId, 10),
      barbero_id: parseInt(form.barbero_id, 10),
      servicio_id: parseInt(form.servicio_id, 10),
      fecha_hora,
      estado: 'pendiente',
    });
    setLoading(false);

    if (insertError) {
      setError('Error al crear la cita: ' + insertError.message);
    } else {
      setSuccess('Cita agendada correctamente.');
      setForm({ barbero_id: '', servicio_id: '', fecha: '', hora: '' });
    }
  };

  const servicioSeleccionado = servicios.find((s) => s.id === parseInt(form.servicio_id, 10));

  return (
    <section className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-zinc-100">Reservar Cita</h3>
          <p className="text-sm text-zinc-400">Selecciona barbero, servicio, fecha y hora para agendar un nuevo turno.</p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200">
          <p className="font-semibold text-zinc-100">Cliente</p>
          <p>{usuarioId ? `ID: ${usuarioId}` : 'No se identificó el usuario'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Barbero</label>
            <select
              name="barbero_id"
              value={form.barbero_id}
              onChange={handleChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            >
              <option value="">Seleccionar barbero...</option>
              {barberos.map((barbero) => (
                <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Servicio</label>
            <select
              name="servicio_id"
              value={form.servicio_id}
              onChange={handleChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            >
              <option value="">Seleccionar servicio...</option>
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>{servicio.nombre} — Bs. {servicio.precio}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={handleChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Hora</label>
            <input
              type="time"
              name="hora"
              value={form.hora}
              onChange={handleChange}
              className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {servicioSeleccionado && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
            <p className="font-semibold">Servicio seleccionado</p>
            <p>{servicioSeleccionado.nombre}</p>
            <p className="text-zinc-400">Precio: Bs. {servicioSeleccionado.precio}</p>
            <p className="text-zinc-400">Duración: {servicioSeleccionado.duracion_minutos} min</p>
          </div>
        )}

        {error && <div className="rounded-3xl border border-red-600 bg-red-950/40 p-4 text-sm text-red-200">{error}</div>}
        {success && <div className="rounded-3xl border border-emerald-600 bg-emerald-950/30 p-4 text-sm text-emerald-200">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Agendando cita...' : 'Agendar Cita'}
        </button>
      </form>
    </section>
  );
}
