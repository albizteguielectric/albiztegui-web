'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Conductores
const tiposCableado = [
  {
    id: 'thhw-aluminio',
    nombre: 'Conductores de Fuerza (Cobre y Aluminio)',
    uso: 'Instalaciones eléctricas de fuerza, alumbrado residencial, comercial e introducciones de acometidas principales.',
    norma: 'Aislamiento de PVC 90°C, 600V, autoextinguible y resistente a la humedad.',
    medidas: [
      { modelo: 'THHW-LS Cobre (Cal. 16 al 8)', empaque: 'Carrete 500m / Caja 100m', usoComun: 'Instalación residencial en tubería (Colores: Negro, Rojo, Blanco, Verde)' },
      { modelo: 'THHW-LS Cobre (Cal. 1/0 a 4/0)', empaque: 'Por Metro', usoComun: 'Alimentadores principales y tableros de alta demanda (Color Negro)' },
      { modelo: 'Aluminio Acometida (Aéreo / Subterráneo)', empaque: 'Por Metro (Cal. 6 al 1/0)', usoComun: 'Conexión desde poste/red (Monopolar, Duplex 1+1, Triplex 2+1)' }
    ]
  },
  {
    id: 'automotriz-solar',
    nombre: 'Automotriz, Solar y Soldadora',
    uso: 'Circuitos automotrices de bajo voltaje, arneses de vehículos, sistemas fotovoltaicos e hilos de soldar.',
    norma: 'Resistencia a aceites, abrasión, rayos UV (Solar) y flexibilidad extrema.',
    medidas: [
      { modelo: 'Cable Automotriz (Cal. 18 al 10)', empaque: 'Bolsas de 100 metros', usoComun: 'Arneses vehiculares, luces y accesorios (Variedad de colores)' },
      { modelo: 'Cable Fotovoltaico Cal. 10', empaque: 'Por Metro', usoComun: 'Conexión entre paneles solares e inversores (Rojo y Negro, UV 1000V)' },
      { modelo: 'Cable Portaelectrodo (Cal. 8 al 3/0)', empaque: 'Por Metro', usoComun: 'Máquinas de soldar portátiles e industriales (Rojo y Negro)' }
    ]
  },
  {
    id: 'uso-rudo-romex',
    nombre: 'Uso Rudo, Dúplex y Romex',
    uso: 'Extensiones industriales, alimentación de equipos móviles, conexiones visibles y cableado plano en muro dry-wall.',
    norma: 'Aislamiento flexible termoplástico resistente al maltrato mecánico.',
    medidas: [
      { modelo: 'Cable Uso Rudo (2, 3 y 4 hilos)', empaque: 'Por Metro (Cal. 18 hasta 6)', usoComun: 'Maquinaria, extensiones de alto impacto y herramientas' },
      { modelo: 'Cable Dúplex (POT) Cal. 18 al 10', empaque: 'Carrete 500m / Caja 100m', usoComun: 'Extensiones domésticas y conexiones fijas visibles' },
      { modelo: 'Cable Romex (NMD90 / UF)', empaque: 'Rollo de 100 metros', usoComun: 'Cable plano con tierra (2 y 3 hilos en Cal. 14, 12 y 10)' }
    ]
  }
]

// 2. Sub-Pestañas de Filtrado
const categoriasCableado = [
  { id: 'Todas', nombre: 'Todas' },
  { id: 'Fuerza y Acometida', nombre: 'Fuerza y Acometida' },
  { id: 'Automotriz y Solar', nombre: 'Automotriz y Solar' },
  { id: 'Uso Rudo, Duplex y Romex', nombre: 'Uso Rudo, Dúplex y Romex' },
  { id: 'Redes Ethernet y Bocina', nombre: 'Redes Ethernet y Bocina' }
]

interface ProductoCableado {
  id: number
  codigo: string
  descripcion: string // Nombre comercial / Ficha técnica de la tabla
  categoria: string
  subcategoria: string
  imagen_url: string
  mostrar_precio: boolean
  mostrar_existencias: boolean
}

interface DatosInventario {
  codigo: string
  descripcion: string 
  precio: number
  existencias: number
}

export default function CableadoPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposCableado[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState('Todas')
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})
  
  // Estado para controlar la imagen abierta en el Pop-up / Modal
  const [imagenModal, setImagenModal] = useState<{ url: string; codigo: string } | null>(null)

  // Estados dinámicos de Supabase
  const [productos, setProductos] = useState<ProductoCableado[]>([])
  const [datosInventario, setDatosInventario] = useState<Record<string, DatosInventario>>({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let active = true

    const fetchProductos = async () => {
      // 1. Cargar catálogo de productos_cableado
      const { data: prods, error } = await supabase
        .from('productos_cableado')
        .select('*')
        .order('id', { ascending: false })

      if (!active) return

      if (error) {
        console.error('Error al cargar productos_cableado:', error.message || error)
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

  const tipoSeleccionado = tiposCableado.find(t => t.id === tipoActivo) || tiposCableado[0]
  
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
            Cableado y Conductores Eléctricos
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Catálogo completo de cables de cobre, aluminio, uso rudo, automotriz, fotovoltaico, red y sistemas de sonido.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px]">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cables.jpg"
                alt="Muestrario de Cables y Conductores"
                fill={true}
                className="object-cover rounded-xl"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Conductores de Alta Eficiencia
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Conductores para Vivienda, Automotriz e Industria
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Contamos con stock disponible tanto en rollos y cajas cerradas de 100 y 500 metros como en cortes por metro lineal. Aislamientos con baja emisión de humos (THHW-LS), conductores solares UV y cables especiales de alta flexibilidad.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ 100% Cobre / Aluminio Certificado</h3>
                <p className="text-xs text-gray-600">Garantía de calibre real y conductividad conforme a la NOM.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Venta por Metro o Carretes</h3>
                <p className="text-xs text-gray-600">Surtimos el kilometraje o los metros exactos que requiera tu proyecto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* GUÍA TÉCNICA Y TABLA DE CABLES */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Especificaciones de Presentación y Aislamiento
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta las modalidades de empaque y usos principales de cada tipo de conductor.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposCableado.map((tipo) => (
              <button
                key={tipo.id}
                onClick={() => setTipoActivo(tipo.id)}
                className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                  tipoActivo === tipo.id 
                    ? 'bg-blue-900 text-white shadow-md scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tipo.nombre}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Aplicación Principal</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Propiedades de Aislamiento</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Tipo / Calibres</th>
                  <th className="py-3.5 px-4 font-extrabold">Presentación / Empaque</th>
                  <th className="py-3.5 px-4 font-extrabold">Aplicación Típica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.modelo}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">{item.empaque}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS COMPACTAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Variedad de Conductores
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Gama Completa de Cables
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en la imagen para verla en pantalla completa, o en el texto para girar la tarjeta.
            </p>
          </div>

          {/* FILTRO DE CATEGORÍAS */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasCableado.map((cat) => (
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
              <p className="text-lg font-bold text-blue-900 animate-pulse">Cargando productos de cableado...</p>
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

                          {/* PRECIO Y STOCK DINÁMICO */}
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
                                  {existenciasFinales > 0 ? `${existenciasFinales} pza(s)` : 'Agotado'}
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Requieres un metraje especial o bobinas completas?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos precios por mayoreo en bobinas de cableado de aluminio, THHW y uso rudo para contratistas y obras públicas.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Cableado
          </Link>
        </div>

      </div>
    </div>
  )
}