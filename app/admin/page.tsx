'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Autenticar credenciales en Supabase
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // 2. Consultar el rol en tu tabla de usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('puesto')
      .eq('correo', email) 
      .single()

    if (userError || !userData) {
      await supabase.auth.signOut()
      setError('Error al verificar los permisos del usuario.')
      setLoading(false)
      return
    }

    // 3. Validar accesos permitidos
    if (userData.puesto === 'Administrador' || userData.puesto === 'IT') {
      router.push('/admin/dashboard')
    } else {
      await supabase.auth.signOut()
      setError('Acceso denegado: Tu puesto no tiene permisos para el portal web.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-orange-500">
        <h1 className="text-2xl font-extrabold text-blue-900 mb-2 text-center">
          Acceso Restringido
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Portal exclusivo para administración de Albiztegui Electric.
        </p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="usuario@albiztegui.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center border border-red-100">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-md ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-orange-500'
            }`}
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}