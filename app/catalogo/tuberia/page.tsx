'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// ESTRUCTURA COMPLETA DE CATEGORÍAS Y SUBCATEGORÍAS PARA TUBERÍA
const ESTRUCTURA_TUBERIA: Record<string, string[]> = {
  'TUBERIA': ['Galvanizado', 'PVC', 'Poliducto', 'Flexible', 'Tubo Termocontractil'],
  'CONEXIONES RIGIDAS': [
    'Cople, Conector y Codo Galvanizado',
    'Cople, Conector y Codo PVC',
    'Contratuercas, Monitores y Reducciones Bushin',
    'Condulets'
  ],
  'CONECTORES FLEXIBLES Y GLANDULAS': [
    'Conectores Flexibles', 
    'Conectores Uso Rudo y Glándulas'
  ],
  'ABRAZADERAS': ['Uñas y Omegas', 'Clip y Unistrut'],
  'PERFILES UNICANAL Y EVEREST': [
    'Pefiles Unicanal y Everest',
    'Coples, Soleras y Tipo Piso',
    'Mid Clamps, End Clamps e Intermedias'
  ]
}

// Función auxiliar para normalizar textos (elimina acentos y convierte a minúsculas)
const normalizarTexto = (texto: string) =>
  texto
    ? texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase()
    : ''

interface ProductoTuberia {
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

export default function TuberiaPage() {
  // ESTADOS DE FILTRADO JERÁRQUICO
  const [categoriaPrincipal, setCategoriaPrincipal] = useState<string>('Todas')
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string>('Todas')

  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})
  const [imagenModal, setImagenModal] = useState<{ url: string; codigo: string } | null>(null)

  // ESTADOS DINÁMICOS DE SUPABASE
  const [productos, setProductos] = useState<ProductoTuberia[]>([])
  const [datosInventario, setDatosInventario] = useState<Record<string, DatosInventario>>({})
  const [cargando, setCargando] = useState(true)

  // ESTADOS DE PAGINACIÓN (30 Artículos por vista)
  const [paginaActual, setPaginaActual] = useState(1)
  const elementosPorPagina = 30

  useEffect(() => {
    let active = true

    const fetchProductos = async () => {
      // 1. Cargar catálogo completo de productos_tuberia ordenados por código de menor a mayor
      const { data: prods, error } = await supabase
        .from('productos_tuberia')
        .select('*')
        .range(0, 9999)
        .order('codigo', { ascending: true })

      if (!active) return

      if (error) {
        console.error('Error al cargar productos_tuberia:', error.message || error)
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
            .range(0, 9999)
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
    e.stopPropagation()
    setImagenModal({ url, codigo })
  }

  const formatearExistencias = (existencias: number, unidad?: string) => {
    if (existencias <= 0) return 'Agotado'

    const u = (unidad || 'pieza').toLowerCase()
    let etiqueta = 'pza(s)'

    if (u === 'metro' || u === 'm') etiqueta = 'm'
    else if (u === 'kilogramo' || u === 'kg') etiqueta = 'kg'
    else if (u === 'rollo') etiqueta = 'rollo(s)'
    else if (u === 'caja') etiqueta = 'caja(s)'
    else if (u === 'tramo') etiqueta = 'tramo(s)'

    return `${existencias} ${etiqueta}`
  }

  // LÓGICA DE SELECCIÓN Y FILTRADO JERÁRQUICO FLEXIBLE (TOLERANTE A ACENTOS)
  const seleccionarCategoriaPrincipal = (cat: string) => {
    setCategoriaPrincipal(cat)
    setSubcategoriaActiva('Todas')
    setPaginaActual(1)
  }

  const seleccionarSubcategoria = (subcat: string) => {
    setSubcategoriaActiva(subcat)
    setPaginaActual(1)
  }

  const productosFiltrados = productos.filter(p => {
    if (categoriaPrincipal === 'Todas') return true

    const coincideCat = normalizarTexto(p.categoria) === normalizarTexto(categoriaPrincipal)
    if (subcategoriaActiva === 'Todas') return coincideCat

    const subcatProd = normalizarTexto(p.subcategoria)
    const subcatBuscada = normalizarTexto(subcategoriaActiva)

    // Permite coincidencia flexible (por ejemplo si en la BD dice "Termocontractil" o "Termocontráctil")
    const coincideSubcat = subcatProd === subcatBuscada || subcatProd.includes('termocontract')

    return coincideCat && coincideSubcat
  })

  // CÁLCULO DE PAGINACIÓN DINÁMICA
  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina)
  const indiceInicial = (paginaActual - 1) * elementosPorPagina
  const indiceFinal = indiceInicial + elementosPorPagina
  const productosPaginados = productosFiltrados.slice(indiceInicial, indiceFinal)

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina)
      window.scrollTo({ top: 650, behavior: 'smooth' })
    }
  }

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
            <button
              type="button"
              onClick={() => setImagenModal(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg transition-colors shadow-md z-10"
              title="Cerrar vista previa"
            >
              ✕
            </button>

            <div className="w-full text-left border-b border-gray-100 pb-3 mb-4 pr-12">
              <span className="text-xs font-black text-orange-500 uppercase tracking-wider block">Vista de Producto</span>
              <h3 className="text-lg font-extrabold text-blue-900">Código: {imagenModal.codigo}</h3>
            </div>

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
            Canalización y Tubería Eléctrica
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Sistemas de protección mecánica y soportería para conductores en instalaciones residenciales, comerciales e industriales.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[400px]">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/Tuberia.png"
                alt="Muestrario de Tubería Eléctrica"
                fill={true}
                className="object-contain"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Familia de Materiales
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Muestrario Completo de Tubos, Mangueras y Soportería
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Manejamos todas las variedades exigidas por las normas de construcción eléctrica. Desde tuberías plásticas ligeras para vivienda hasta canalización metálica pesada, ductos flexibles herméticos y rieles Unicanal / Everest de soporte.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Variedad de Materiales</h3>
                <p className="text-xs text-gray-600">PVC Ligero/Pesado, Galvanizado, Poliducto, Tubo Flexible, Licuatite y Perfiles Unicanal/Everest.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Medidas Comerciales</h3>
                <p className="text-xs text-gray-600">Disponibilidad en mostrador desde 1/2 pulgada hasta 4 pulgadas y perfiles de montaje de 3.00 mts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN Y CATÁLOGOS DE PRODUCTO */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Sistemas de Canalización
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Catálogo de Tubería, Conexiones y Soportería
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Selecciona una categoría principal y filtra por subcategoría para encontrar rápidamente tus productos.
            </p>
          </div>

          {/* NIVEL 1: CATEGORÍAS PRINCIPALES (PESTAÑAS DESTACADAS) */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
            <button
              onClick={() => seleccionarCategoriaPrincipal('Todas')}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm ${
                categoriaPrincipal === 'Todas'
                  ? 'bg-blue-950 text-white ring-2 ring-orange-500 shadow-md'
                  : 'bg-white text-blue-900 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Ver Todo
            </button>

            {Object.keys(ESTRUCTURA_TUBERIA).map((catKey) => (
              <button
                key={catKey}
                onClick={() => seleccionarCategoriaPrincipal(catKey)}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm ${
                  categoriaPrincipal === catKey
                    ? 'bg-orange-500 text-white ring-2 ring-orange-600 shadow-md'
                    : 'bg-white text-blue-900 hover:bg-orange-50 border border-gray-200'
                }`}
              >
                {catKey}
              </button>
            ))}
          </div>

          {/* NIVEL 2: SUBCATEGORÍAS SECUNDARIAS (FILTRADO FINO EN PÍLDORAS) */}
          {categoriaPrincipal !== 'Todas' && ESTRUCTURA_TUBERIA[categoriaPrincipal] && (
            <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100 max-w-4xl mx-auto mb-8 transition-all">
              <span className="text-[11px] font-black text-orange-600 uppercase tracking-wider block text-center mb-2">
                Subcategorías de {categoriaPrincipal}:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => seleccionarSubcategoria('Todas')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    subcategoriaActiva === 'Todas'
                      ? 'bg-blue-900 text-white shadow'
                      : 'bg-white text-gray-700 hover:bg-orange-100 border border-orange-200'
                  }`}
                >
                  Todas las subcategorías
                </button>

                {ESTRUCTURA_TUBERIA[categoriaPrincipal].map((subcat) => (
                  <button
                    key={subcat}
                    onClick={() => seleccionarSubcategoria(subcat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      subcategoriaActiva === subcat
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-white text-gray-700 hover:bg-orange-100 border border-orange-200'
                    }`}
                  >
                    {subcat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BARRA DE INFORMACIÓN Y CONTROLES DE PAGINACIÓN SUPERIOR */}
          {!cargando && productosFiltrados.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-2 text-xs font-bold text-gray-500 gap-2">
              <span>
                Mostrando <strong className="text-orange-500">{indiceInicial + 1}</strong> - <strong className="text-orange-500">{Math.min(indiceFinal, productosFiltrados.length)}</strong> de <strong className="text-blue-900">{productosFiltrados.length}</strong> artículos
              </span>

              {totalPaginas > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1 rounded bg-white border border-gray-200 text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    &laquo; Anterior
                  </button>
                  <span className="px-2 text-blue-900">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-2.5 py-1 rounded bg-white border border-gray-200 text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    Siguiente &raquo;
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ESTADO CARGANDO / SIN PRODUCTOS */}
          {cargando ? (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-blue-900 animate-pulse">Cargando productos de tubería y canalización...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-semibold">No hay productos registrados en esta subcategoría aún.</p>
            </div>
          ) : (
            <>
              {/* RETÍCULA DE TARJETAS COMPACTAS (PAGINADAS) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {productosPaginados.map((item) => {
                  const isFlipped = flippedCards[item.id] || false;
                  const codigoClave = item.codigo ? item.codigo.trim().toUpperCase() : '';
                  
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
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-white p-3 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-center gap-2">
                          
                          {/* CONTENEDOR DE IMAGEN */}
                          <div 
                            onClick={(e) => abrirImagenModal(e, item.imagen_url, item.codigo)}
                            className="w-full h-28 bg-gray-50 rounded-lg relative overflow-hidden border border-gray-100 flex items-center justify-center p-1 group/img hover:border-orange-400 transition-colors cursor-pointer"
                            title="Haz clic para ampliar imagen"
                          >
                            <Image 
                              src={item.imagen_url} 
                              alt={item.codigo} 
                              fill={true} 
                              className="object-contain w-full h-full group-hover/img:scale-105 transition-transform" 
                              unoptimized={true}
                            />
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/img:opacity-100 transition-opacity">
                              🔍 Ampliar
                            </span>
                          </div>

                          {/* TEXTO DE LA TARJETA */}
                          <div className="text-center w-full px-1">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-wider block truncate">
                              CÓD: {item.codigo}
                            </span>
                            <h3 className="text-sm font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2 mt-1 leading-snug" title={item.descripcion}>
                              {item.descripcion}
                            </h3>
                            <p className="text-xs font-semibold text-gray-400 mt-1 flex items-center justify-center gap-1">
                              Girar Ficha 🔄
                            </p>
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

              {/* BARRA DE PAGINACIÓN INFERIOR */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-sm font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                  >
                    &laquo; Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => cambiarPagina(num)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                          paginaActual === num
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-blue-900 hover:bg-orange-100 border border-gray-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-sm font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                  >
                    Siguiente &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* LLAMADO A COTIZAR */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white border-b-8 border-orange-500">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Necesitas una cotización por volumen?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Envíanos la lista de tuberías, conexiones y soportería que requiere tu proyecto y te preparamos un presupuesto especial.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Tubería
          </Link>
        </div>

      </div>
    </div>
  )
}