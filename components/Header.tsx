'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../app/lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Header() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  
  // ESTADOS PARA EL POP-UP DE BÚSQUEDA
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)
  const [queryBusqueda, setQueryBusqueda] = useState('')

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // CERRAR MODAL CON LA TECLA "ESCAPE"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBusquedaAbierta(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // FUNCIÓN PARA EJECUTAR LA BÚSQUEDA
  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryBusqueda.trim()) return

    router.push(`/buscar?q=${encodeURIComponent(queryBusqueda.trim())}`)
    setQueryBusqueda('')
    setBusquedaAbierta(false)
    closeMenu()
  }

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-orange-500">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex-shrink-0 font-extrabold text-xl sm:text-2xl text-blue-900">
            <Link href="/" onClick={closeMenu}>
              Albiztegui <span className="text-orange-500">Electric</span>
            </Link>
          </div>
          
          {/* MENÚ DE ESCRITORIO + BOTÓN LUPA */}
          <div className="hidden md:flex space-x-8 font-medium text-gray-700 items-center">
            <Link href="/nosotros" className="hover:text-orange-500 transition-colors">Nosotros</Link>
            <Link href="/marcas" className="hover:text-orange-500 transition-colors">Marcas</Link>
            <Link href="/sucursales" className="hover:text-orange-500 transition-colors">Sucursales</Link>
            <Link href="/contacto" className="hover:text-orange-500 transition-colors">Contáctanos</Link>
            
            {/* BOTÓN LUPA ESCRITORIO */}
            <button
              type="button"
              onClick={() => setBusquedaAbierta(true)}
              className="p-2 text-blue-900 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all flex items-center gap-1 font-bold text-sm"
              title="Buscar productos"
            >
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Portal Administrador */}
            {session && (
              <Link 
                href="/admin/dashboard" 
                className="bg-blue-900 hover:bg-orange-500 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-sm ml-2"
              >
                Portal
              </Link>
            )}
          </div>

          {/* ACCIONES MÓVILES (Lupa + Menú Hamburguesa) */}
          <div className="flex md:hidden items-center gap-2">
            {/* BOTÓN LUPA MÓVIL */}
            <button
              type="button"
              onClick={() => setBusquedaAbierta(true)}
              className="p-2 text-gray-700 hover:text-orange-500 rounded-lg transition-colors"
              aria-label="Abrir buscador"
            >
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* BOTÓN HAMBURGUESA MÓVIL */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-700 hover:text-orange-500 focus:outline-none p-2 rounded-lg"
              aria-label="Abrir menú"
            >
              {!isOpen ? (
                <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-7 w-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

        </nav>

        {/* MENÚ DESPLEGABLE MÓVIL */}
        <div 
          className={`md:hidden bg-gray-50 border-t border-gray-200 transition-all duration-300 overflow-hidden ${
            isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="px-4 pt-3 pb-5 space-y-3 font-medium text-gray-800">
            <Link
              href="/nosotros"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-orange-500 transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/marcas"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-orange-500 transition-colors"
            >
              Marcas
            </Link>
            <Link
              href="/sucursales"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-orange-500 transition-colors"
            >
              Sucursales
            </Link>
            <Link
              href="/contacto"
              onClick={closeMenu}
              className="block px-3 py-2 rounded-md hover:bg-gray-200 hover:text-orange-500 transition-colors"
            >
              Contáctanos
            </Link>

            {session && (
              <Link
                href="/admin/dashboard"
                onClick={closeMenu}
                className="block text-center bg-blue-900 hover:bg-orange-500 text-white font-bold px-4 py-2.5 rounded-lg transition-colors mt-2"
              >
                Portal Administrador
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MODAL POP-UP DE BÚSQUEDA (OPACIDAD DE FONDO) */}
      {busquedaAbierta && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-blue-950/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
          onClick={() => setBusquedaAbierta(false)}
        >
          {/* TARJETA DEL BUSCADOR */}
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-4 sm:p-6 border-2 border-orange-500 transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-blue-900 uppercase tracking-widest">
                Buscar en Catálogo
              </span>
              <button
                type="button"
                onClick={() => setBusquedaAbierta(false)}
                className="text-gray-400 hover:text-orange-500 text-sm font-extrabold px-2 py-1 rounded-md transition-colors"
              >
                ✕ Esc
              </button>
            </div>

            {/* FORMULARIO DE BÚSQUEDA */}
            <form onSubmit={handleBuscar} className="relative flex items-center">
              <input
                type="text"
                placeholder="Escribe el código o descripción del producto..."
                value={queryBusqueda}
                onChange={(e) => setQueryBusqueda(e.target.value)}
                autoFocus
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl py-3.5 pl-4 pr-12 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white shadow-inner transition-all font-medium"
              />
              <button
                type="submit"
                className="absolute right-2 bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg transition-all shadow-md active:scale-95"
                title="Buscar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
           
            <p className="text-[11px] text-gray-400 mt-3 text-center sm:text-left">
              💡 <span className="font-bold">Sugerencia:</span> Puedes ingresar palabras clave como <span className="text-blue-900 font-bold">&quot;Poliducto&quot;</span>, <span className="text-blue-900 font-bold">&quot;Cable&quot;</span> o el código exacto del artículo.
            </p>
          </div>
        </div>
      )}
    </>
  )
}