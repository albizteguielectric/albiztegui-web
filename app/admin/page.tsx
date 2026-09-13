'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!correo || !password) {
      setError('Por favor, ingresa tu correo y contraseña.')
      return
    }

    setCargando(true)
    setError(null)

    try {
      // 1. Iniciar sesión con Supabase Auth (misma credencial del PWA)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: password,
      })

      if (authError) {
        throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.')
      }

      const userEmail = authData.user?.email

      if (!userEmail) {
        throw new Error('No se pudo verificar el usuario.')
      }

      // 2. Validar rol/puesto en la tabla "usuarios"
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('correo, puesto')
        .eq('correo', userEmail.trim())
        .single()

      if (userError || !usuario) {
        await supabase.auth.signOut()
        throw new Error('El usuario no se encuentra registrado en el sistema de permisos.')
      }

      // 3. Verificar que el puesto sea Administrador o IT (independiente de mayúsculas/minúsculas)
      const puestoLimpio = usuario.puesto ? usuario.puesto.trim().toUpperCase() : ''
      const esAutorizado = puestoLimpio === 'ADMINISTRADOR' || puestoLimpio === 'IT' || puestoLimpio === 'ADMIN'

      if (!esAutorizado) {
        // Cerrar sesión si no tiene los permisos requeridos
        await supabase.auth.signOut()
        throw new Error('Acceso denegado. Se requieren permisos de Administrador o IT.')
      }

      // 4. Redirigir al Dashboard de administración
      router.push('/admin/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error al iniciar sesión.'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 pt-20">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        
        {/* Encabezado del Formulario */}
        <div className="text-center mb-8">
          <Link href="/" className="text-xs font-bold text-orange-500 hover:text-orange-600 mb-2 inline-block">
            &larr; Volver al sitio público
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-blue-900 tracking-tight">
            Acceso Administrativo
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Portal exclusivo para personal de IT y Administración.
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold text-center leading-relaxed animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario de Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@albiztegui.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-blue-900 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
          >
            {cargando ? 'Verificando credenciales...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            Albiztegui Electric &copy; Sistema de Control Interno
          </p>
        </div>

      </div>
    </div>
  )
}