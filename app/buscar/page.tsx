'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface ProductoResultado {
  id: number
  codigo: string
  descripcion: string
  categoria?: string
  subcategoria?: string
  imagen_url: string
  unidad_medida?: string
  mostrar_precio?: boolean
  mostrar_existencias?: boolean
}

export default function BuscarPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [resultados, setResultados] = useState<ProductoResultado[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const buscarEnSupabase = async () => {
      if (!query.trim()) {
        setResultados([])
        setCargando(false)
        return
      }
      
      setCargando(true)

      const tablas = [
        'productos_tuberia',
        'productos_cableado',
        'productos_cajas',
        'productos_iluminacion',
        'productos_control',
        'productos_placas',
        'productos_media_tension',
        'productos_electronica',
        'productos_temporada'
      ]
      
      let acum: ProductoResultado[] = []

      for (const tabla of tablas) {
        const { data } = await supabase
          .from(tabla)
          .select('*')
          .or(`descripcion.ilike.%${query}%,codigo.ilike.%${query}%`)

        if (data) acum = [...acum, ...data]
      }

      setResultados(acum)
      setCargando(false)
    }

    buscarEnSupabase()
  }, [query])

  return (
    <div 
      className="min-h-screen bg-white bg-cover bg-center bg-no-repeat bg-fixed py-8 px-4"
      style={{ backgroundImage: "url('https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondo-WEB.jpg')" }}
    >
      <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[60vh]">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Resultados para: <span className="text-orange-500">&quot;{query}&quot;</span>
        </h1>

        {cargando ? (
          <div className="py-12 text-center">
            <p className="text-lg font-bold text-blue-900 animate-pulse">Buscando productos en el catálogo...</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/80 rounded-2xl border border-gray-200">
            <p className="text-gray-500 text-base">No se encontraron artículos que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          /* LISTA VERTICAL DE PRODUCTOS (INFORMATIVA) */
          <div className="flex flex-col gap-3">
            {resultados.map((prod) => (
              <div
                key={`${prod.codigo}-${prod.id}`}
                className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm transition-all"
              >
                {/* IMAGEN DEL PRODUCTO */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg relative flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center p-1">
                  <img 
                    src={prod.imagen_url} 
                    alt={prod.codigo} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>

                {/* INFORMACIÓN EN LISTA */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-orange-500 uppercase tracking-wider">
                      CÓD: {prod.codigo}
                    </span>
                    {prod.subcategoria && (
                      <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full truncate">
                        {prod.subcategoria}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-blue-900 leading-tight">
                    {prod.descripcion}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}