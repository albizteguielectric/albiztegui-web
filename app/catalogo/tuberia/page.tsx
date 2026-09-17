'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

// ESTRUCTURA COMPLETA DE 3 NIVELES PARA TUBERÍA
const ESTRUCTURA_TUBERIA: Record<string, Record<string, string[]>> = {
  'TUBERIA': {
    'Galvanizado': ['Etiqueta Azul', 'Etiqueta Verde', 'Etiqueta Amarilla'],
    'PVC': ['Liguero', 'Pesado'],
    'Poliducto': ['Naranja', 'Naranja Bicapa', 'Negro', 'Narnaja Flexible', 'Manguera Corrugada'],
    'Tubo Flexible': ['Flexible', 'Licuatite'],
    'Tubo Termocontractil': ['Termocontractil']
  },
  'CONEXIONES RIGIDAS': {
    'Cople, Conector y Codo Galvanizado': ['Coples', 'Conectores', 'Codos'],
    'Cople, Conector y Codo PVC': ['Coples', 'Conectores', 'Codos'],
    'Contratuercas, Monitores y Reducciones Bushin': ['Contratuercas', 'Monitores', 'Reducciones Bushing'],
    'Condulets': ['Condulet LB','Condulet LR', 'Condulet LL','Condulet OT','Condulet OC', 'Condulet Multiforma']
  },
  'CONECTORES FLEXIBLES Y GLANDULAS': {
    'Conectores Flexibles': ['HLR', 'FXR'],
    'Uso Rudo y Glandulas': ['Uso Rudo', 'Glandulas']
  },
  'ABRAZADERAS': {
    'Omegas y Uñas': ['Omegas', 'Uñas'],
    'Clip y Unistrut': ['Clip', 'Unistrut']
  },
  'PERFILES UNICANAL Y EVEREST': {
    'Perfiles Unicanal y Everest': ['Perfiles Unicanal y Everest', 'Coples, Soleras y Tipo Piso', 'Mid Clamps, End Clamps e Intermedias']
  }
}

// Función auxiliar para normalizar textos
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
  subcategoria_especifica?: string
  imagen_url: string
  mostrar_precio: boolean
  mostrar_existencias: boolean
  unidad_medida?: string
  imagenes_galeria?: string[]
}

interface DatosInventario {
  codigo: string
  descripcion: string 
  precio: number
  existencias: number
}

interface ModalState {
  codigo: string
  descripcion: string
  listaImagenes: string[]
  indiceActual: number
}

export default function TuberiaPage() {
  // ESTADOS DE FILTRADO JERÁRQUICO
  const [categoriaPrincipal, setCategoriaPrincipal] = useState<string>('Todas')
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string>('Todas')
  const [subcategoriaEspecialActiva, setSubcategoriaEspecialActiva] = useState<string>('Todas')

  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})
  
  // ESTADO DEL MODAL CON SLIDER / CARRUSEL
  const [imagenModal, setImagenModal] = useState<ModalState | null>(null)

  // ESTADOS DINÁMICOS DE SUPABASE
  const [productos, setProductos] = useState<ProductoTuberia[]>([])
  const [datosInventario, setDatosInventario] = useState<Record<string, DatosInventario>>({})
  const [cargando, setCargando] = useState(true)

  // ESTADOS DE PAGINACIÓN (30 Artículos por vista)
  const [paginaActual, setPaginaActual] = useState(1)
  const elementosPorPagina = 30

  // VARIABLES PARA DESLIZAMIENTO TÁCTIL (SWIPE)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  useEffect(() => {
    let active = true

    const fetchProductos = async () => {
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

        const codigosLimpios = Array.from(
          new Set(
            prods
              .map(p => (p.codigo ? p.codigo.trim().toUpperCase() : ''))
              .filter(c => c.length > 0)
          )
        )

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

  // ABRIR POP-UP CON LISTA COMPLETA DE IMÁGENES
  const abrirImagenModal = (e: React.MouseEvent, item: ProductoTuberia) => {
    e.stopPropagation()
    const galeria = item.imagenes_galeria && item.imagenes_galeria.length > 0 ? item.imagenes_galeria : []
    const listaCompilada = [item.imagen_url, ...galeria]

    setImagenModal({
      codigo: item.codigo,
      descripcion: item.descripcion,
      listaImagenes: listaCompilada,
      indiceActual: 0
    })
  }

  // NAVEGACIÓN CARRUSEL
  const imagenAnterior = () => {
    if (!imagenModal) return
    setImagenModal(prev => {
      if (!prev) return null
      const nuevoIndice = prev.indiceActual === 0 ? prev.listaImagenes.length - 1 : prev.indiceActual - 1
      return { ...prev, indiceActual: nuevoIndice }
    })
  }

  const imagenSiguiente = () => {
    if (!imagenModal) return
    setImagenModal(prev => {
      if (!prev) return null
      const nuevoIndice = prev.indiceActual === prev.listaImagenes.length - 1 ? 0 : prev.indiceActual + 1
      return { ...prev, indiceActual: nuevoIndice }
    })
  }

  // SWIPE MÓVIL
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diferencia = touchStartX.current - touchEndX.current

    if (diferencia > 50) imagenSiguiente()
    else if (diferencia < -50) imagenAnterior()

    touchStartX.current = 0
    touchEndX.current = 0
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

  // LÓGICA DE SELECCIÓN DE CATEGORÍA PRINCIPAL
  const seleccionarCategoriaPrincipal = (cat: string) => {
    setCategoriaPrincipal(cat)
    setSubcategoriaActiva('Todas')
    setSubcategoriaEspecialActiva('Todas')
    setPaginaActual(1)
  }

  // OPCIONES DISPONIBLES PARA COMBOBOX
  const subcategoriasDisponibles = categoriaPrincipal !== 'Todas' && ESTRUCTURA_TUBERIA[categoriaPrincipal]
    ? Object.keys(ESTRUCTURA_TUBERIA[categoriaPrincipal])
    : Array.from(new Set(Object.values(ESTRUCTURA_TUBERIA).flatMap(c => Object.keys(c))))

  const subcategoriasEspecialesDisponibles = (categoriaPrincipal !== 'Todas' && subcategoriaActiva !== 'Todas' && ESTRUCTURA_TUBERIA[categoriaPrincipal]?.[subcategoriaActiva])
    ? ESTRUCTURA_TUBERIA[categoriaPrincipal][subcategoriaActiva]
    : []

  // FILTRADO COMPLETO DE PRODUCTOS
  const productosFiltrados = productos.filter(p => {
    if (categoriaPrincipal !== 'Todas') {
      const coincideCat = normalizarTexto(p.categoria) === normalizarTexto(categoriaPrincipal)
      if (!coincideCat) return false
    }

    if (subcategoriaActiva !== 'Todas') {
      const coincideSub = normalizarTexto(p.subcategoria) === normalizarTexto(subcategoriaActiva)
      if (!coincideSub) return false
    }

    if (subcategoriaEspecialActiva !== 'Todas') {
      const coincideSubEsp = normalizarTexto(p.subcategoria_especifica || '') === normalizarTexto(subcategoriaEspecialActiva)
      if (!coincideSubEsp) return false
    }

    return true
  })

  // CÁLCULO DE PAGINACIÓN DINÁMICA
  const totalPaginas = Math.ceil(productosFiltrados.length / elementosPorPagina)
  const indiceInicial = (paginaActual - 1) * elementosPorPagina
  const indiceFinal = indiceInicial + elementosPorPagina
  const productosPaginados = productosFiltrados.slice(indiceInicial, indiceFinal)

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina)
      window.scrollTo({ top: 600, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20">
      
      {/* MODAL POP-UP DE IMAGEN COMPLETA */}
      {imagenModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 transition-all duration-300"
          onClick={() => setImagenModal(null)}
        >
          <div 
            className="relative bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full p-3 sm:p-6 shadow-2xl overflow-hidden flex flex-col items-center border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setImagenModal(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-base sm:text-lg transition-colors shadow-md z-20"
              title="Cerrar vista previa"
            >
              ✕
            </button>

            <div className="w-full text-left border-b border-gray-100 pb-2 sm:pb-3 mb-2 sm:mb-3 pr-10 sm:pr-12">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-wider block">
                  CÓD: {imagenModal.codigo}
                </span>
                <span className="text-[9px] sm:text-[10px] bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
                  Foto {imagenModal.indiceActual + 1} de {imagenModal.listaImagenes.length}
                </span>
              </div>
              <h3 className="text-xs sm:text-lg font-extrabold text-blue-950 truncate mt-0.5">
                {imagenModal.descripcion}
              </h3>
            </div>

            <div 
              className="relative w-full h-[50vh] sm:h-[65vh] bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imagenModal.listaImagenes.length > 1 && (
                <button
                  type="button"
                  onClick={imagenAnterior}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-lg z-10 backdrop-blur-sm"
                  title="Imagen anterior"
                >
                  ❮
                </button>
              )}

              <Image
                src={imagenModal.listaImagenes[imagenModal.indiceActual]}
                alt={imagenModal.codigo}
                fill={true}
                className="object-contain p-2 sm:p-6 transition-all duration-300"
                unoptimized={true}
              />

              {imagenModal.listaImagenes.length > 1 && (
                <button
                  type="button"
                  onClick={imagenSiguiente}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg sm:text-xl transition-all shadow-lg z-10 backdrop-blur-sm"
                  title="Siguiente imagen"
                >
                  ❯
                </button>
              )}
            </div>

            {imagenModal.listaImagenes.length > 1 && (
              <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 max-w-full overflow-x-auto py-1">
                {imagenModal.listaImagenes.map((urlImg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImagenModal(prev => prev ? { ...prev, indiceActual: idx } : null)}
                    className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-gray-50 ${
                      imagenModal.indiceActual === idx
                        ? 'border-orange-500 scale-105 shadow-md ring-2 ring-orange-200'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={urlImg}
                      alt={`Vista previa ${idx}`}
                      fill={true}
                      className="object-contain"
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-2 sm:mt-3 font-medium text-center">
              Desliza en móviles o usa las flechas para navegar entre las fotos.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="mb-6 sm:mb-8">
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-bold text-xs sm:text-sm flex items-center gap-1 mb-2">
            &larr; Volver al Inicio
          </Link>
          <h1 className="text-2xl sm:text-5xl font-black text-blue-900 tracking-tight">
            Canalización y Tubería Eléctrica
          </h1>
          <p className="text-gray-600 text-xs sm:text-lg mt-1 sm:mt-2">
            Sistemas de protección mecánica y soportería para conductores en instalaciones residenciales, comerciales e industriales.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8 sm:mb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-4 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[220px] sm:h-[400px]">
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

          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Familia de Materiales
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-blue-900 leading-tight">
              Muestrario Completo de Tubos, Mangueras y Soportería
            </h2>
            <p className="text-gray-600 leading-relaxed text-xs sm:text-base">
              Manejamos todas las variedades exigidas por las normas de construcción eléctrica. Desde tuberías plásticas ligeras para vivienda hasta canalización metálica pesada, ductos flexibles herméticos y rieles Unicanal / Everest de soporte.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t border-gray-100 pt-4 sm:pt-6">
              <div className="bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-xs sm:text-sm mb-1">✓ Variedad de Materiales</h3>
                <p className="text-[11px] sm:text-xs text-gray-600">PVC Ligero/Pesado, Galvanizado, Poliducto, Tubo Flexible, Licuatite y Perfiles Unicanal/Everest.</p>
              </div>
              <div className="bg-orange-50/50 p-3 sm:p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-xs sm:text-sm mb-1">✓ Medidas Comerciales</h3>
                <p className="text-[11px] sm:text-xs text-gray-600">Disponibilidad en mostrador desde 1/2 pulgada hasta 4 pulgadas y perfiles de montaje de 3.00 mts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN Y CATÁLOGOS DE PRODUCTO */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Sistemas de Canalización
            </span>
            <h2 className="text-xl sm:text-4xl font-extrabold text-blue-900 mt-2 sm:mt-3">
              Catálogo de Tubería, Conexiones y Soportería
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
              Selecciona una categoría principal y filtra mediante los selectores para encontrar rápidamente tus productos.
            </p>
          </div>

          {/* NIVEL 1: CATEGORÍAS PRINCIPALES (DESPLAZAMIENTO FLUIDO EN MÓVIL) */}
          <div className="relative mb-6">
            <div className="flex overflow-x-auto gap-2 pb-3 pt-1 px-1 sm:flex-wrap sm:justify-center sm:overflow-visible scroll-smooth snap-x snap-mandatory">
              <button
                onClick={() => seleccionarCategoriaPrincipal('Todas')}
                className={`flex-none snap-start px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm ${
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
                  className={`flex-none snap-start px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all shadow-sm ${
                    categoriaPrincipal === catKey
                      ? 'bg-orange-500 text-white ring-2 ring-orange-600 shadow-md'
                      : 'bg-white text-blue-900 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  {catKey}
                </button>
              ))}
            </div>
            {/* Sombras difuminadas indicadoras para deslizamiento táctil en móviles */}
            <div className="absolute right-0 top-0 bottom-3 w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none sm:hidden" />
          </div>

          {/* BARRA DE FILTROS EN COMBOBOX ADAPTADOS PARA MÓVILES */}
          <div className="bg-gray-100 p-3 sm:p-4 rounded-2xl border border-gray-200 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-[11px] font-black text-blue-950 uppercase tracking-wider hidden sm:inline">Filtros:</span>

              {/* COMBOBOX 1: SUBCATEGORÍA */}
              <select
                value={subcategoriaActiva}
                onChange={(e) => {
                  setSubcategoriaActiva(e.target.value)
                  setSubcategoriaEspecialActiva('Todas')
                  setPaginaActual(1)
                }}
                className="w-full sm:w-auto sm:max-w-[220px] truncate px-3 py-2 sm:py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                <option value="Todas">Subcategoría (Todas)</option>
                {subcategoriasDisponibles.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              {/* COMBOBOX 2: SUBCATEGORÍA ESPECÍFICA DEPENDIENTE */}
              <select
                value={subcategoriaEspecialActiva}
                disabled={subcategoriaActiva === 'Todas'}
                onChange={(e) => {
                  setSubcategoriaEspecialActiva(e.target.value)
                  setPaginaActual(1)
                }}
                className="w-full sm:w-auto sm:max-w-[220px] truncate px-3 py-2 sm:py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm disabled:bg-gray-200 disabled:text-gray-400"
              >
                <option value="Todas">
                  {subcategoriaActiva === 'Todas' ? 'Específica (Elige Subcat)' : 'Específica (Todas)'}
                </option>
                {subcategoriasEspecialesDisponibles.map((subEspecial) => (
                  <option key={subEspecial} value={subEspecial}>{subEspecial}</option>
                ))}
              </select>
            </div>

            {/* CONTROLES Y CONTEO RÁPIDO */}
            {!cargando && productosFiltrados.length > 0 && (
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs font-bold text-gray-500 border-t border-gray-200 pt-2 sm:pt-0 sm:border-0">
                <span>
                  Mostrando <strong className="text-orange-500">{indiceInicial + 1}</strong> - <strong className="text-orange-500">{Math.min(indiceFinal, productosFiltrados.length)}</strong> de <strong className="text-blue-900">{productosFiltrados.length}</strong>
                </span>

                {totalPaginas > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      &laquo;
                    </button>
                    <span className="px-1 text-blue-900 font-extrabold text-[11px]">
                      {paginaActual}/{totalPaginas}
                    </span>
                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ESTADO CARGANDO / SIN PRODUCTOS */}
          {cargando ? (
            <div className="text-center py-16">
              <p className="text-lg font-bold text-blue-900 animate-pulse">Cargando productos de tubería y canalización...</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-semibold text-sm">No hay productos registrados con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              {/* RETÍCULA DE TARJETAS COMPACTAS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                {productosPaginados.map((item) => {
                  const isFlipped = flippedCards[item.id] || false;
                  const codigoClave = item.codigo ? item.codigo.trim().toUpperCase() : '';
                  
                  const invData = datosInventario[codigoClave];
                  const descripcionReverso = (invData && invData.descripcion && invData.descripcion.trim() !== '')
                    ? invData.descripcion
                    : item.descripcion;

                  const precioFinal = invData ? invData.precio : 0;
                  const existenciasFinales = invData ? invData.existencias : 0;
                  const cantidadFotos = (item.imagenes_galeria?.length || 0) + 1;

                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleFlip(item.id)}
                      className="h-56 w-full cursor-pointer [perspective:1000px] group"
                    >
                      <div className={`relative h-full w-full rounded-xl shadow-sm transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                        
                        {/* FRENTE DE LA TARJETA */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-white p-2.5 sm:p-3 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-center gap-2">
                          
                          <div 
                            onClick={(e) => abrirImagenModal(e, item)}
                            className="w-full h-28 bg-gray-50 rounded-lg relative overflow-hidden border border-gray-100 flex items-center justify-center p-1 group/img hover:border-orange-400 transition-colors cursor-pointer"
                            title="Haz clic para ver la galería de fotos"
                          >
                            <Image 
                              src={item.imagen_url} 
                              alt={item.codigo} 
                              fill={true} 
                              className="object-contain w-full h-full group-hover/img:scale-105 transition-transform" 
                              unoptimized={true}
                            />
                            
                            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded backdrop-blur-sm">
                              📷 {cantidadFotos} {cantidadFotos > 1 ? 'fotos' : 'foto'}
                            </span>
                          </div>

                          <div className="text-center w-full px-1">
                            <span className="text-[11px] sm:text-xs font-black text-orange-500 uppercase tracking-wider block truncate">
                              CÓD: {item.codigo}
                            </span>
                            <h3 className="text-xs sm:text-sm font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2 mt-0.5 sm:mt-1 leading-snug" title={item.descripcion}>
                              {item.descripcion}
                            </h3>
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 mt-1 flex items-center justify-center gap-1">
                              Girar Ficha 🔄
                            </p>
                          </div>

                        </div>

                        {/* REVERSO DE LA TARJETA */}
                        <div className="absolute inset-0 h-full w-full rounded-xl bg-blue-950 p-2.5 sm:p-3 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border-2 border-orange-500">
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
                <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-white border border-gray-200 text-xs sm:text-sm font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                  >
                    &laquo; Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => cambiarPagina(num)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg text-xs font-bold transition-all ${
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
                    className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-white border border-gray-200 text-xs sm:text-sm font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                  >
                    Siguiente &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* LLAMADO A COTIZAR */}
        <div className="bg-gradient-to-r from-blue-950 to-blue-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white border-b-6 sm:border-b-8 border-orange-500">
          <h2 className="text-xl sm:text-3xl font-extrabold mb-2 sm:mb-3">¿Necesitas una cotización por volumen?</h2>
          <p className="text-gray-300 text-xs sm:text-base max-w-2xl mx-auto mb-5 sm:mb-6">
            Envíanos la lista de tuberías, conexiones y soportería que requiere tu proyecto y te preparamos un presupuesto especial.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-xs sm:text-sm"
          >
            Solicitar Cotización de Tubería
          </Link>
        </div>

      </div>
    </div>
  )
}