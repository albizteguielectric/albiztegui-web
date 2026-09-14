'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// Sub-Pestañas de Filtrado para Media Tensión
const categoriasMediaTension = [
  { id: 'Todas', nombre: 'Todas' },
  { id: 'TRANSFORMADORES', nombre: 'Transformadores y Protección' },
  { id: 'HERRAJES Y AISLADORES', nombre: 'Herrajes y Aisladores' },
  { id: 'CONECTORES DE FUERZA', nombre: 'Conectores y Múltiples' }
]

interface ProductoMediaTension {
  id: number
  codigo: string
  descripcion: string
  categoria: string
  subcategoria: string
  imagen_url: string
  mostrar_precio: boolean
  mostrar_existencias: boolean
  unidad_medida?: string
}

interface DatosInventario {
  codigo: string
  descripcion: string 
  precio: number
  existencias: number
}

export default function MediaTensionPage() {
  const [catAccesorioActiva, setCatAccesorioActiva] = useState('Todas')
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})
  
  // Estado para controlar la imagen abierta en el Pop-up / Modal
  const [imagenModal, setImagenModal] = useState<{ url: string; codigo: string } | null>(null)

  // Estados dinámicos de Supabase
  const [productos, setProductos] = useState<ProductoMediaTension[]>([])
  const [datosInventario, setDatosInventario] = useState<Record<string, DatosInventario>>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let active = true

    const fetchProductos = async () => {
      // 1. Cargar catálogo de productos_media_tension ordenados alfabéticamente por descripción
      const { data: prods, error } = await supabase
        .from('productos_media_tension')
        .select('*')
        .order('descripcion', { ascending: true })

      if (!active) return

      if (error) {
        console.error('Error al cargar productos_media_tension:', error.message || error)
        setCargando(false)
        return
      }

      if (prods && prods.length > 0) {
        setProductos(prods)

        // 2. Extraer códigos limpios en mayúsculas
        const codigosLimpios = Array.from(
          new Set(
            prods
              .map(p => (p.codigo ? p.codigo.trim().toUpperCase() : ''))
              .filter(c => c.length > 0)
          )
        )

        // 3. Consultar la tabla "productos" para sincronizar precios y stock
        if (codigosLimpios.length > 0) {
          const { data: invData, error: invError } = await supabase
            .from('productos')
            .select('codigo, descripcion, precio, existencias')
            .in('codigo', codigosLimpios)

          if (invError) {
            console.error('Error al consultar tabla productos:', invError.message || invError)
          }

          if (active && invData) {
            const mapInv: Record<string, DatosInventario> = {}
            invData.forEach(item => {
              if (item.codigo) {
                mapInv[item.codigo.trim().toUpperCase()] = {
                  codigo: item.codigo.trim().toUpperCase(),
                  descripcion: item.descripcion || '',
                  precio: Number(item.precio) || 0,
                  existencias: Number(item.existencias) || 0
                }
              }
            })
            setDatosInventario(mapInv)
          }
        }
      }

      if (active) {
        setCargando(false)
      }
    }

    fetchProductos()

    return () => {
      active = false
    }
  }, [])

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const abrirImagenModal = (e: React.MouseEvent, url: string, codigo: string) => {
    // Evita que la tarjeta gire al hacer clic sobre la imagen
    e.stopPropagation()
    setImagenModal({ url, codigo })
  }

  // Función para formatear las existencias según la unidad de medida
  const formatearExistencias = (existencias: number, unidad?: string) => {
    if (existencias <= 0) return 'Agotado'

    const u = (unidad || 'pieza').toLowerCase()
    let etiqueta = 'pza(s)'

    if (u === 'metro' || u === 'm') etiqueta = 'm'
    else if (u === 'kilogramo' || u === 'kg') etiqueta = 'kg'
    else if (u === 'rollo') etiqueta = 'rollo(s)'
    else if (u === 'caja') etiqueta = 'caja(s)'

    return `${existencias} ${etiqueta}`
  }

  const productosFiltrados = catAccesorioActiva === 'Todas'
    ? productos
    : productos.filter(p => p.categoria === catAccesorioActiva || p.subcategoria === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      
      {/* MODAL POP-UP DE IMAGEN COMPLETA */}
      {imagenModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setImagenModal(null)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÓN DE CIERRE (X) */}
            <button
              type="button"
              onClick={() => setImagenModal(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-colors shadow-md z-10"
              title="Cerrar vista previa"
            >
              ✕
            </button>

            {/* ENCABEZADO DEL MODAL */}
            <div className="w-full text-left border-b border-gray-100 pb-3 mb-4 pr-12">
              <span className="text-xs font-black text-orange-500 uppercase tracking-wider block">Vista de Producto</span>
              <h3 className="text-lg font-extrabold text-blue-900">Código: {imagenModal.codigo}</h3>
            </div>

            {/* CONTENEDOR DE LA IMAGEN AMPLIADA */}
            <div className="relative w-full h-[60vh] sm:h-[70vh] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              <Image
                src={imagenModal.url}
                alt={imagenModal.codigo}
                fill={true}
                className="object-contain p-4"
                unoptimized={true}
              />
            </div>
            
            <p className="text-xs text-gray-400 mt-3 font-medium">
              Haz clic fuera o presiona la X para cerrar
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="mb-8">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-sm flex items-center gap-1 mb-2">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-blue-900 tracking-tight">
            Equipos y Materiales de Media Tensión
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Transformadores secos de 3, 5, 10 y 30 kVA, crucetas PT y PR (200 y 250), herrajes de galvanizado, aisladores, cortacircuitos y conectores de fuerza.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/media-tension.jpg"
                alt="Muestrario de Media Tensión"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Infraestructura Aérea y Subterránea
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Transformadores, Protección y Herrajes de Distribución
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Suministramos transformadores secos de aislamiento de 3 a 30 kVA, la línea completa de crucetas PT/PR, herrajes normados CFE, cortacircuitos en 15, 27 y 38 kV, apartarrayos y conectores de potencia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Transformadores Secos</h3>
                <p className="text-xs text-gray-600">Disponibilidad en 3 kVA, 5 kVA, 10 kVA y 30 kVA para interiores.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Normativa CFE</h3>
                <p className="text-xs text-gray-600">Crucetas PT/PR, herrajes galvanizados y aisladores normados.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS COMPACTAS (CATÁLOGO DIRECTO) */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo de Líneas Primarias
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Equipos de Red y Herrajes
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en la imagen para verla en pantalla completa, o en el texto para girar la tarjeta.
            </p>
          </div>

          {/* FILTRO DE CATEGORÍAS */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasMediaTension.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCatAccesorioActiva(cat.id)}
                className={`px-4 py-2.5 rounded-lg font-extrabold text-xs sm:text-sm transition-all ${
                  catAccesorioActiva === cat.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-blue-900 hover:bg-orange-100 border border-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* ESTADO CARGANDO / SIN PRODUCTOS */}
          {cargando ? (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-blue-900 animate-pulse">Cargando productos de media tensión...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-semibold">No hay productos registrados en esta categoría aún.</p>
            </div>
          ) : (
            /* RETÍCULA DE TARJETAS COMPACTAS */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {productosFiltrados.map((item) => {
                const isFlipped = flippedCards[item.id] || false;
                const codigoClave = item.codigo ? item.codigo.trim().toUpperCase() : '';
                
                // Mapeo con fallback hacia la descripción propia del producto
                const invData = datosInventario[codigoClave];
                const descripcionReverso = (invData && invData.descripcion && invData.descripcion.trim() !== '')
                  ? invData.descripcion
                  : item.descripcion;

                const precioFinal = invData ? invData.precio : 0;
                const existenciasFinales = invData ? invData.existencias : 0;

                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleFlip(item.id)}
                    className="h-56 w-full cursor-pointer [perspective:1000px] group"
                  >
                    <div className={`relative h-full w-full rounded-xl shadow-sm transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      
                      {/* FRENTE DE LA TARJETA */}
                      <div className="absolute inset-0 h-full w-full rounded-xl bg-white p-3 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                        
                        {/* CONTENEDOR DE IMAGEN (ABRE EL POP-UP AL DAR CLIC) */}
                        <div 
                          onClick={(e) => abrirImagenModal(e, item.imagen_url, item.codigo)}
                          className="w-full h-24 bg-gray-50 rounded-lg relative overflow-hidden border border-gray-100 flex items-center justify-center p-1 group/img hover:border-orange-400 transition-colors"
                          title="Haz clic para ampliar imagen"
                        >
                          <Image 
                            src={item.imagen_url} 
                            alt={item.codigo} 
                            fill={true} 
                            className="object-contain w-full h-full group-hover/img:scale-105 transition-transform" 
                            unoptimized={true}
                          />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded opacity-0 group-hover/img:opacity-100 transition-opacity">
                            🔍 Ampliar
                          </span>
                        </div>

                        {/* TEXTO DE LA TARJETA (HACER CLIC AQUÍ GIRA LA TARJETA) */}
                        <div className="text-center w-full mt-1">
                          <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider block truncate">
                            CÓD: {item.codigo}
                          </span>
                          <h3 className="text-xs font-bold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2 mt-0.5 leading-tight" title={item.descripcion}>
                            {item.descripcion}
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-0.5">Girar Ficha 🔄</p>
                        </div>
                      </div>

                      {/* REVERSO DE LA TARJETA */}
                      <div className="absolute inset-0 h-full w-full rounded-xl bg-blue-950 p-3 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border-2 border-orange-500">
                        <div>
                          <div className="flex justify-between items-center mb-1 border-b border-blue-900 pb-1">
                            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider truncate">
                              CÓD: {item.codigo}
                            </span>
                            <span className="text-[9px] text-gray-400">🔄</span>
                          </div>
                          
                          <p className="text-[10px] text-gray-200 mb-2 leading-tight line-clamp-3" title={descripcionReverso}>
                            {descripcionReverso}
                          </p>

                          {/* PRECIO Y STOCK DINÁMICO CON UNIDAD DE MEDIDA */}
                          <div className="bg-blue-900/60 p-1.5 rounded-lg border border-blue-800/60 space-y-0.5">
                            {item.mostrar_precio && (
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Precio:</span>
                                <span className="text-xs font-black text-orange-400">
                                  ${precioFinal > 0 ? precioFinal.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
                                </span>
                              </div>
                            )}

                            {item.mostrar_existencias && (
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">Stock:</span>
                                <span className={`text-[10px] font-extrabold ${existenciasFinales > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatearExistencias(existenciasFinales, item.unidad_medida)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* BOTÓN WHATSAPP COMPACTO */}
                        <a
                          href={`https://wa.me/526361109087?text=Hola,%20me%20interesa%20cotizar%20el%20producto%20código:%20${item.codigo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold text-[10px] py-1.5 rounded-lg text-center transition-colors shadow-sm block mt-1"
                        >
                          Cotizar WhatsApp
                        </a>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* COTIZADOR */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white border-b-8 border-orange-500">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Requieres transformadores secos o paquetes para electrificación?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos transformadores secos de 3 a 30 kVA, crucetas PT/PR, herrajes CFE, cortacircuitos y apartarrayos por volumen para contratistas.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Media Tensión
          </Link>
        </div>

      </div>
    </div>
  )
}