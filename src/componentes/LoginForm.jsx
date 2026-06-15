import { useState } from 'react';
import { supabase } from '../supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (supabaseError) {
      setError(supabaseError.message === 'Invalid login credentials'
        ? 'Correo o contraseña incorrectos.'
        : supabaseError.message);
      setLoading(false);
    } else {
      console.log('¡Usuario autenticado con éxito!', data);
      setLoading(false);
      window.location.assign('/dashboard');
    }
  };

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
          Iniciar Sesión
        </h2>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4 rounded-md">
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
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-zinc-700 bg-zinc-800 rounded transition-all"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400">
              Recordarme
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-zinc-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'CONECTANDO...' : 'INGRESAR'}
          </button>
        </div>

        <p className="text-center text-sm text-zinc-400">
          ¿No tienes cuenta?{' '}
          <a href="/registro" className="font-medium text-amber-500 hover:text-amber-400 transition-colors">
            Crear cuenta
          </a>
        </p>
      </form>
    </div>
  );
}