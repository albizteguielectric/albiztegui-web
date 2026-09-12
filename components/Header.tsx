'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../app/lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function Header() {
  const [session, setSession] = useState<Session | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    // 1. Revisar si hay una sesión activa al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2. Escuchar cambios (cuando inician o cierran sesión)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-orange-500">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex-shrink-0 font-extrabold text-xl sm:text-2xl text-blue-900">
          <Link href="/" onClick={closeMenu}>
            Albiztegui <span className="text-orange-500">Electric</span>
          </Link>
        </div>
        
        {/* MENÚ DE ESCRITORIO (Se oculta en celulares) */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-700 items-center">
          <Link href="/nosotros" className="hover:text-orange-500 transition-colors">Nosotros</Link>
          <Link href="/marcas" className="hover:text-orange-500 transition-colors">Marcas</Link>
          <Link href="/sucursales" className="hover:text-orange-500 transition-colors">Sucursales</Link>
          <Link href="/contacto" className="hover:text-orange-500 transition-colors">Contáctanos</Link>
          
          {/* Botón de Portal para administradores */}
          {session && (
            <Link 
              href="/admin/dashboard" 
              className="bg-blue-900 hover:bg-orange-500 text-white px-5 py-2 rounded-md text-sm font-bold transition-colors shadow-sm ml-4"
            >
              Portal
            </Link>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA (Visible solo en celulares/tabletas) */}
        <div className="flex md:hidden">
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
  )
}