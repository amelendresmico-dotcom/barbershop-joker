import { useState } from 'react';
import { supabase } from '../supabase';

export default function RegistroForm() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          telefono,
        },
      },
    });

    setLoading(false);

    if (supabaseError) {
      if (supabaseError.message.includes('already registered')) {
        setError('Este correo ya está registrado. Prueba iniciar sesión.');
      } else {
        setError(supabaseError.message);
      }
    } else {
      setExito(true);
    }
  };

  if (exito) {
    return (
      <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl text-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-wider text-amber-500 font-serif">
            JOKER
          </h1>
          <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1">
            Barber Shop & Hair Club
          </p>
        </div>
        <div className="bg-green-900/30 border border-green-500 text-green-200 p-6 rounded-2xl space-y-3">
          <div className="text-4xl">✓</div>
          <p className="text-lg font-semibold">¡Cuenta creada con éxito!</p>
          <p className="text-sm text-zinc-400">
            Ya puedes iniciar sesión con tu correo y contraseña.
          </p>
        </div>
        <a
          href="/login"
          className="block w-full py-3 px-4 text-sm font-bold rounded-xl text-zinc-950 bg-amber-500 hover:bg-amber-400 transition-all text-center shadow-lg shadow-amber-500/20"
        >
          IR AL INICIO DE SESIÓN
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-wider text-amber-500 font-serif">
          JOKER
        </h1>
        <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1">
          Barber Shop & Hair Club
        </p>
        <h2 className="mt-6 text-2xl font-bold text-zinc-100 tracking-tight">
          Crear Cuenta
        </h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleRegistro}>
        <div className="space-y-4 rounded-md">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-zinc-300 mb-1">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 bg-zinc-800 placeholder-zinc-500 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-zinc-300 mb-1">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 bg-zinc-800 placeholder-zinc-500 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
              placeholder="Ej: 70012345"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 bg-zinc-800 placeholder-zinc-500 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 bg-zinc-800 placeholder-zinc-500 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmar" className="block text-sm font-medium text-zinc-300 mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              required
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="appearance-none relative block w-full px-3 py-3 border border-zinc-700 bg-zinc-800 placeholder-zinc-500 text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all"
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-zinc-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARSE'}
          </button>
        </div>

        <p className="text-center text-sm text-zinc-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  );
}