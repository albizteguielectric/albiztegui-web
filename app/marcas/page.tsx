'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

interface Marca {
  id: number
  nombre: string
  logo_url: string
  sitio_web: string
}

export default function MarcasPage() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const { data, error } = await supabase
          .from('marcas')
          .select('*')
          .order('nombre', { ascending: true })

        if (error) throw error
        if (data) setMarcas(data)
      } catch (err) {
        console.error('Error al cargar marcas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMarcas()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="bg-orange-100 text-orange-600 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            Nuestros Aliados
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 mt-3 tracking-tight">
            Marcas Oficiales y Distribución
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-3">
            Trabajamos con los fabricantes líderes de material eléctrico, iluminación y automatización para ofrecerte la máxima calidad.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* GRID DE MARCAS */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {marcas.map((marca) => (
              <a
                key={marca.id}
                href={marca.sitio_web}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-orange-500 transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {/* LOGO DE LA MARCA */}
                <div className="w-full aspect-square relative flex items-center justify-center p-2 mb-3">
                  <Image
                    src={marca.logo_url}
                    alt={`Logo de ${marca.nombre}`}
                    fill={true}
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    unoptimized={true}
                  />
                </div>

                {/* NOMBRE DE LA EMPRESA */}
                <h3 className="font-extrabold text-blue-900 text-sm sm:text-base group-hover:text-orange-500 transition-colors">
                  {marca.nombre}
                </h3>
                <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                  Sitio Oficial ↗
                </span>
              </a>
            ))}
          </div>
        )}

        {/* MENSAGE SI NO HAY MARCAS */}
        {!loading && marcas.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 max-w-md mx-auto">
            <p className="text-gray-500 font-medium">Aún no se han agregado marcas al catálogo.</p>
          </div>
        )}

      </div>
    </div>
  )
}