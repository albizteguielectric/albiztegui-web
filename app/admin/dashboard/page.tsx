'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import React from 'react'

interface ImagenCarrusel {
  id: number
  imagen_url: string
  orden: number
  activa: boolean
}

interface MensajeContacto {
  id: number
  nombre: string
  telefono: string
  mensaje: string
  leido: boolean
  created_at: string
}

interface Marca {
  id: number
  nombre: string
  logo_url: string
  sitio_web: string
}

interface ProductoCatalogo {
  id?: number
  codigo: string
  descripcion: string
  categoria: string
  subcategoria: string
  imagen_url: string
  mostrar_precio: boolean
  mostrar_existencias: boolean
  unidad_medida?: string
  precio?: number
  existencias?: number
}

// 1. ESTRUCTURAS DE CATEGORÍAS Y SUBCATEGORÍAS PARA CADA SECCIÓN
const ESTRUCTURAS_POR_CATALOGO: Record<string, Record<string, string[]>> = {
  tuberia: {
    'TUBERIA': ['Galvanizado', 'PVC', 'Poliducto', 'Flexible', 'Termocontractil'],
    'CONEXIONES RIGIDAS': [
      'Cople, Conector y Codo Galvanizado',
      'Cople, Conector y Codo PVC',
      'Contratuercas, Monitores y Reducciones Bushin',
      'Condulets'
    ],
    'CONECTORES FLEXIBLES Y GLANDULAS': ['Conectores Flexibles', 'Conectores Uso Rudo y Glándulas'],
    'ABRAZADERAS': ['Uñas y Omegas', 'Clip y Unistrut'],
    'PERFILES UNICANAL Y EVEREST': [
      'Pefiles Unicanal y Everest',
      'Coples, Soleras y Tipo Piso',
      'Mid Clamps, End Clamps e Intermedias'
    ]
  },
  cajas_registros: {
    'CAJAS METALICAS': ['Cajas 2x4', 'Cajas 4x4, 5x5, 6x6, 8x8', 'Cajas Octagonales'],
    'PLASTICAS Y CANALETAS': ['Chalupas Plasticas', 'Cajas de Reparacion', 'Cajas Estanca', 'Canaletas'],
    'INTERPERIE Y TIPO ZAPATO': ['Chalupas de Interperie', 'Armarios', 'Cajas tipo Zapato'],
    'TAPAS Y COMPLEMENTOS': ['Tapas Ciegas Galvanizadas', 'Tapas Galvanizadas', 'Tapas Interperie', 'Tapas Especiales']
  },
  cableado: {
    'CABLE': ['Cobre', 'Aluminio'],
    'CABLE ESPECIAL': ['Uso Rudo', 'POT / Duplex', 'Romex', 'Automotriz', 'Solar'],
    'EMBOBINADO': ['Magneto', 'Cuñas', 'Espagetti', 'Barniz', 'Cinta']
  },
  iluminacion: {
    'FOCOS': ['Focos LED', 'Focos Incandecentes', 'Focos tipo Vela y Bintage'],
    'SPOT': ['Empotrados', 'Sobrepuestos', 'Dimeables'],
    'PLAFONES Y LAMPARAS': ['Plafones', 'Lamparas Horizontales'],
    'ARBOTANTES': ['Arbotantes Electrico', 'Arbotante Solar'],
    'LAMPARAS EXTERIORES': ['Reflectores', 'Sub Urbanas']
  },
  control_fuerza: {
    'CENTROS DE CARGA': ['Metalicos', 'Riel DIN'],
    'BRAKERS': ['QD y QP', 'Riel DIN', 'Termomagneticos'],
    'DE CONTROL': ['Contactores', 'Relevadores', 'Guardamotores', 'Arrancadores'],
    'ACOMETIDA': ['Bases Socket', 'Accesorios']
  },
  placas_apagadores: {
    'ETON y LEVITON': ['Tradicionales', 'Decorato'],
    'PLACAS Y TAPAS': ['Tapas 2x4 y 4x4', 'Especiales Decorato'],
    'LUCEK': ['Basic', 'Flat', 'Premium', 'Cristal']
  },
  media_tension: {
    'TRASFORMADORES': ['Secos', 'Otros'],
    'CORTACIRCUITOS': ['Canillas', 'Fisibles de Alta', 'Cortacircuitos'],
    'APARTARRAYOS': ['Polimero', 'Ceramicos'],
    'ACCESORIOS': [
      'Crucetas',
      'Abrazaderas',
      'Herrajes',
      'Remates',
      'Aisladores',
      'Grapas',
      'Conectores y Derivadores',
      'Multiples Mecanicos'
    ]
  },
  electronica: {
    'HERRAMIENTAS': [
      'Pinzas',
      'Desarmadores',
      'Probadores de Cable',
      'Dobla Tubos, Corta Tubos y Guias',
      'Linea de Vida',
      'Carbones'
    ],
    'TORNILLERIA': ['Taquetes', 'Tornillos', 'Terminales', 'Corbatas', 'Capuchones'],
    'ENERGIA': ['Baterias Alcalinas y Recargables', 'Inversores', 'Reguladores y UPS', 'Multiples y Extensiones'],
    'SMART HOME': ['Focos y Tomas', 'Camaras', 'Timbres'],
    'AUDIO Y VIDEO': ['Cables RCA', 'Cables de Luz', 'Accesorios', 'Fusibles'],
    'CINTAS ASILANTES':['Cinta Aislante', 'Vulcanizable y Maya', 'Precaucion', 'Doble Cara', 'Empaquetar']
  },
  productos_temporada: {
    'VENTILADORES Y CALENTONES': ['De techo y Piso', 'Calentones'],
    'NAVIDAD': ['Luces', 'Inflables', 'Decoraciones'],
    'ESPEJOS': ['Con Luz', 'Sin Luz']
  }
}

// Categorías completas del Menú Catálogo
const CATEGORIAS_CATALOGO = [
  { id: 'tuberia', nombre: 'Tuberia y Accesorios', tabla: 'productos_tuberia' },
  { id: 'cajas_registros', nombre: 'Cajas y Registros', tabla: 'productos_cajas' },
  { id: 'cableado', nombre: 'Cableado', tabla: 'productos_cableado' },
  { id: 'iluminacion', nombre: 'Iluminacion', tabla: 'productos_iluminacion' },
  { id: 'control_fuerza', nombre: 'Control, Fuerza y Acometidas', tabla: 'productos_control' },
  { id: 'placas_apagadores', nombre: 'Placas y Apagadores', tabla: 'productos_placas' },
  { id: 'media_tension', nombre: 'Media Tension', tabla: 'productos_media_tension' },
  { id: 'electronica', nombre: 'Electronica y Herramientas', tabla: 'productos_electronica' },
  { id: 'productos_temporada', nombre: 'Productos de Temporada', tabla: 'productos_temporada' }
]

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // INICIALIZAR SIN NINGUNA PESTAÑA SELECCIONADA POR DEFECTO
  const [activeTab, setActiveTab] = useState<string | null>(null)

  // MENÚ DESPLEGABLE DE CATÁLOGO CERRADO AL ENTRAR
  const [menuCatalogoAbierto, setMenuCatalogoAbierto] = useState(false)

  // ESTADOS GENERALES
  const [imagenes, setImagenes] = useState<ImagenCarrusel[]>([])
  const [nuevaImagen, setNuevaImagen] = useState('')
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([])

  // ESTADOS MARCAS
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [nombreMarca, setNombreMarca] = useState('')
  const [archivoLogo, setArchivoLogo] = useState<File | null>(null)
  const [sitioWebMarca, setSitioWebMarca] = useState('')
  const [subiendoMarca, setSubiendoMarca] = useState(false)

  // ESTADOS DINÁMICOS DEL FORMULARIO DE PRODUCTOS
  const [estructuraActual, setEstructuraActual] = useState<Record<string, string[]>>({})
  const [categoriaSel, setCategoriaSel] = useState('')
  const [subcategoriaSel, setSubcategoriaSel] = useState('')
  
  const [codigoProd, setCodigoProd] = useState('')
  const [nombreComercialProd, setNombreComercialProd] = useState('') 
  const [descripcionTecnicaDb, setDescripcionTecnicaDb] = useState('') 
  const [unidadMedida, setUnidadMedida] = useState('pieza')
  const [buscandoDb, setBuscandoDb] = useState(false)
  const [archivoImagenProd, setArchivoImagenProd] = useState<File | null>(null)
  const [mostrarPrecio, setMostrarPrecio] = useState(true)
  const [mostrarExistencias, setMostrarExistencias] = useState(true)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [productosLista, setProductosLista] = useState<ProductoCatalogo[]>([])
  const [editandoId, setEditandoId] = useState<number | null>(null)

  // ESTADO PARA FILTRAR LA TABLA POR SUBCATEGORÍA
  const [filtroSubcategoriaTabla, setFiltroSubcategoriaTabla] = useState('TODAS')

  // ESTADOS DE PAGINACIÓN PARA LA TABLA DEL DASHBOARD (30 productos por página)
  const [paginaTabla, setPaginaTabla] = useState(1)
  const elementosPorPagina = 30

  // ESTADOS DE CONTROL GLOBAL DE VISIBILIDAD EN LA SECCIÓN
  const [estadoPrecioGlobal, setEstadoPrecioGlobal] = useState(true)
  const [estadoStockGlobal, setEstadoStockGlobal] = useState(true)

  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: 'exito' })
  const [modal, setModal] = useState({ mostrar: false, id: 0, tipo: '' })

  const obtenerNombreTabla = (tabId: string) => {
    const cat = CATEGORIAS_CATALOGO.find(c => c.id === tabId)
    return cat ? cat.tabla : 'productos_cableado'
  }

  const mostrarAlerta = (mensaje: string, tipo: 'exito' | 'error') => {
    setAlerta({ mostrar: true, mensaje, tipo })
    setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: 'exito' }), 4000)
  }

  const cargarImagenes = async () => {
    const { data } = await supabase.from('carrusel_inicio').select('*').order('orden', { ascending: true })
    if (data) setImagenes(data)
  }

  const cargarMensajes = async () => {
    const { data } = await supabase.from('buzon_contacto').select('*').order('created_at', { ascending: false })
    if (data) setMensajes(data)
  }

  const cargarMarcas = async () => {
    const { data } = await supabase.from('marcas').select('*').order('id', { ascending: false })
    if (data) setMarcas(data)
  }

  const cargarProductosSeccion = async (tabId: string) => {
    const tabla = obtenerNombreTabla(tabId)
    // Rango amplio para omitir el límite por defecto de Supabase de 100 filas
    const { data } = await supabase
      .from(tabla)
      .select('*')
      .range(0, 9999)
      .order('codigo', { ascending: true })

    if (data) {
      setProductosLista(data)
      if (data.length > 0) {
        setEstadoPrecioGlobal(data.some(p => p.mostrar_precio))
        setEstadoStockGlobal(data.some(p => p.mostrar_existencias))
      }
    } else {
      setProductosLista([])
    }
  }

  // Cambiar pestaña del catálogo y actualizar opciones del selector
  const cambiarPestanaCatalogo = (tabId: string) => {
    setActiveTab(tabId)
    setFiltroSubcategoriaTabla('TODAS')
    setPaginaTabla(1)
    
    const nuevaEstructura = ESTRUCTURAS_POR_CATALOGO[tabId] || ESTRUCTURAS_POR_CATALOGO['cableado']
    setEstructuraActual(nuevaEstructura)
    
    const primeraCat = Object.keys(nuevaEstructura)[0] || ''
    const primeraSubcat = nuevaEstructura[primeraCat]?.[0] || ''
    
    setCategoriaSel(primeraCat)
    setSubcategoriaSel(primeraSubcat)
    setEditandoId(null)
    setCodigoProd('')
    setNombreComercialProd('')
    setDescripcionTecnicaDb('')

    cargarProductosSeccion(tabId)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin')
      } else {
        setLoading(false)
        cargarImagenes()
        cargarMensajes()
        cargarMarcas()
        if (activeTab) {
          cargarProductosSeccion(activeTab)
        }
      }
    }
    checkUser()
  }, [router, activeTab])

  const handleCategoriaChange = (cat: string) => {
    setCategoriaSel(cat)
    const subcats = estructuraActual[cat] || []
    setSubcategoriaSel(subcats.length > 0 ? subcats[0] : '')
  }

  const buscarDescripcionBD = async (codigo: string) => {
    setCodigoProd(codigo)
    if (!codigo.trim()) {
      setDescripcionTecnicaDb('')
      return
    }

    setBuscandoDb(true)
    const { data } = await supabase
      .from('productos')
      .select('descripcion')
      .eq('codigo', codigo.trim().toUpperCase())
      .single()

    if (data) {
      setDescripcionTecnicaDb(data.descripcion)
    } else {
      setDescripcionTecnicaDb('')
    }
    setBuscandoDb(false)
  }

  const alternarPrecioTodos = async (estado: boolean) => {
    if (!activeTab) return
    try {
      const tabla = obtenerNombreTabla(activeTab)
      const { error } = await supabase
        .from(tabla)
        .update({ mostrar_precio: estado })
        .neq('id', 0)

      if (error) throw error

      setEstadoPrecioGlobal(estado)
      mostrarAlerta(`Precios ${estado ? 'activados' : 'ocultados'} para la sección actual.`, 'exito')
      cargarProductosSeccion(activeTab)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar visibilidad'
      mostrarAlerta(msg, 'error')
    }
  }

  const alternarExistenciasTodos = async (estado: boolean) => {
    if (!activeTab) return
    try {
      const tabla = obtenerNombreTabla(activeTab)
      const { error } = await supabase
        .from(tabla)
        .update({ mostrar_existencias: estado })
        .neq('id', 0)

      if (error) throw error

      setEstadoStockGlobal(estado)
      mostrarAlerta(`Stock ${estado ? 'activado' : 'ocultado'} para la sección actual.`, 'exito')
      cargarProductosSeccion(activeTab)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar visibilidad'
      mostrarAlerta(msg, 'error')
    }
  }

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeTab) return
    if (!codigoProd || !nombreComercialProd) {
      mostrarAlerta('Completa el código y el nombre comercial del producto.', 'error')
      return
    }

    setGuardandoProducto(true)
    try {
      let imagenUrl = `https://raw.githubusercontent.com/albizteguielectric/catalogo-img/main/${codigoProd.toUpperCase()}.jpg`

      if (archivoImagenProd) {
        const dataImg = new FormData()
        dataImg.append('codigo', codigoProd)
        dataImg.append('imagen', archivoImagenProd)

        const resImg = await fetch('/api/admin/subir-imagen', {
          method: 'POST',
          body: dataImg,
        })

        const contentType = resImg.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          const textError = await resImg.text()
          throw new Error(`Error en el servidor de imágenes: ${textError.substring(0, 80)}...`)
        }

        const resultImg = await resImg.json()

        if (!resImg.ok) {
          throw new Error(resultImg.error || 'Error al procesar la imagen en GitHub')
        }

        imagenUrl = resultImg.imagen_url
      }

      const payload = {
        codigo: codigoProd.toUpperCase(),
        descripcion: nombreComercialProd,
        categoria: categoriaSel,
        subcategoria: subcategoriaSel,
        imagen_url: imagenUrl,
        mostrar_precio: mostrarPrecio,
        mostrar_existencias: mostrarExistencias,
        unidad_medida: unidadMedida,
      }

      const tabla = obtenerNombreTabla(activeTab)

      if (editandoId) {
        const { error } = await supabase.from(tabla).update(payload).eq('id', editandoId)
        if (error) throw error
        mostrarAlerta('Producto actualizado correctamente.', 'exito')
      } else {
        const { error } = await supabase.from(tabla).insert([payload])
        if (error) throw error
        mostrarAlerta('Producto publicado en el catálogo.', 'exito')
      }

      setCodigoProd('')
      setNombreComercialProd('')
      setDescripcionTecnicaDb('')
      setUnidadMedida('pieza')
      setArchivoImagenProd(null)
      setEditandoId(null)
      cargarProductosSeccion(activeTab)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar producto'
      mostrarAlerta(msg, 'error')
    } finally {
      setGuardandoProducto(false)
    }
  }

  const prepararEdicion = (p: ProductoCatalogo) => {
    setEditandoId(p.id || null)
    setCategoriaSel(p.categoria)
    setSubcategoriaSel(p.subcategoria)
    setCodigoProd(p.codigo)
    setNombreComercialProd(p.descripcion)
    setMostrarPrecio(p.mostrar_precio)
    setMostrarExistencias(p.mostrar_existencias)
    setUnidadMedida(p.unidad_medida || 'pieza')
    buscarDescripcionBD(p.codigo)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  const agregarImagen = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevaImagen) return
    const { error } = await supabase.from('carrusel_inicio').insert([{ imagen_url: nuevaImagen, orden: imagenes.length + 1 }])
    if (!error) {
      setNuevaImagen('') 
      cargarImagenes()
      mostrarAlerta('Imagen agregada exitosamente.', 'exito')
    } else {
      mostrarAlerta('Error al guardar la imagen.', 'error')
    }
  }

  const agregarMarca = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreMarca || !archivoLogo || !sitioWebMarca) {
      mostrarAlerta('Por favor completa todos los campos de la marca.', 'error')
      return
    }

    setSubiendoMarca(true)
    try {
      const fileExt = archivoLogo.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('marcas-logos')
        .upload(filePath, archivoLogo, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('marcas-logos')
        .getPublicUrl(filePath)

      const { error: insertError } = await supabase.from('marcas').insert([
        { 
          nombre: nombreMarca, 
          logo_url: publicUrlData.publicUrl, 
          sitio_web: sitioWebMarca 
        }
      ])

      if (insertError) throw insertError

      setNombreMarca('')
      setSitioWebMarca('')
      setArchivoLogo(null)
      cargarMarcas()
      mostrarAlerta('Marca agregada exitosamente.', 'exito')
    } catch (err: unknown) {
      const mensajeError = err instanceof Error ? err.message : 'Error al agregar la marca'
      mostrarAlerta(mensajeError, 'error')
    } finally {
      setSubiendoMarca(false)
    }
  }

  const alternarLeido = async (id: number, estadoActual: boolean) => {
    const { error } = await supabase.from('buzon_contacto').update({ leido: !estadoActual }).eq('id', id)
    if (!error) cargarMensajes()
  }

  const ejecutarEliminacion = async () => {
    if (modal.tipo === 'imagen') {
      const { error } = await supabase.from('carrusel_inicio').delete().eq('id', modal.id)
      if (!error) { cargarImagenes(); mostrarAlerta('Imagen eliminada.', 'exito') }
    } else if (modal.tipo === 'mensaje') {
      const { error } = await supabase.from('buzon_contacto').delete().eq('id', modal.id)
      if (!error) { cargarMensajes(); mostrarAlerta('Mensaje eliminado.', 'exito') }
    } else if (modal.tipo === 'marca') {
      const { error } = await supabase.from('marcas').delete().eq('id', modal.id)
      if (!error) { cargarMarcas(); mostrarAlerta('Marca eliminada.', 'exito') }
    } else if (modal.tipo === 'producto_catalogo') {
      if (!activeTab) return
      const tabla = obtenerNombreTabla(activeTab)
      const { error } = await supabase.from(tabla).delete().eq('id', modal.id)
      if (!error) { cargarProductosSeccion(activeTab); mostrarAlerta('Producto eliminado.', 'exito') }
    }
    setModal({ mostrar: false, id: 0, tipo: '' })
  }

  const esPestanaCatalogo = activeTab ? CATEGORIAS_CATALOGO.some(c => c.id === activeTab) : false

  // Extraer subcategorías únicas de la sección actual para el filtro de la tabla
  const subcategoriasDisponibles = activeTab && ESTRUCTURAS_POR_CATALOGO[activeTab]
    ? Array.from(new Set(Object.values(ESTRUCTURAS_POR_CATALOGO[activeTab]).flat()))
    : []

  // Productos filtrados según la subcategoría seleccionada
  const productosMostrarTabla = filtroSubcategoriaTabla === 'TODAS'
    ? productosLista
    : productosLista.filter(p => (p.subcategoria || '').trim().toLowerCase() === filtroSubcategoriaTabla.trim().toLowerCase())

  // CÁLCULOS Y SLICE DE PAGINACIÓN DE LA TABLA
  const totalPaginasTabla = Math.ceil(productosMostrarTabla.length / elementosPorPagina)
  const indiceInicialTabla = (paginaTabla - 1) * elementosPorPagina
  const indiceFinalTabla = indiceInicialTabla + elementosPorPagina
  const productosPaginadosTabla = productosMostrarTabla.slice(indiceInicialTabla, indiceFinalTabla)

  const cambiarPaginaTabla = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasTabla) {
      setPaginaTabla(nuevaPagina)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xl font-bold text-blue-900 animate-pulse">Cargando panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row border-t border-gray-200 relative">
      
      {/* NOTIFICACIÓN FLOTANTE */}
      <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl font-bold text-white flex items-center gap-3 transition-all transform duration-500 ${alerta.mostrar ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'} ${alerta.tipo === 'exito' ? 'bg-green-500' : 'bg-red-500'}`}>
        <span>{alerta.mensaje}</span>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {modal.mostrar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border-t-4 border-red-500 transform transition-all">
            <h3 className="text-2xl font-extrabold text-blue-900 mb-3">¿Estás seguro?</h3>
            <p className="text-gray-600 mb-8 font-medium">
              Esta acción eliminará definitivamente {
                modal.tipo === 'imagen' ? 'esta imagen del carrusel' : 
                modal.tipo === 'mensaje' ? 'este mensaje' : 
                modal.tipo === 'marca' ? 'esta marca comercial' : 'este producto del catálogo'
              }. No podrás recuperar la información.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => setModal({ mostrar: false, id: 0, tipo: '' })}
                className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={ejecutarEliminacion}
                className="px-5 py-2 bg-red-500 text-white font-bold hover:bg-red-600 rounded-lg shadow-md transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENÚ LATERAL */}
      <aside className="w-full md:w-64 bg-blue-950 text-white flex flex-col shadow-lg z-10">
        <div className="p-6 border-b border-blue-900/50">
          <h2 className="text-xl font-extrabold text-orange-500">Panel Web</h2>
          <p className="text-xs text-gray-400 mt-1">Albiztegui Electric</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          
          {/* BOTÓN DESPLEGABLE: CATÁLOGO */}
          <div>
            <button
              type="button"
              onClick={() => setMenuCatalogoAbierto(!menuCatalogoAbierto)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-lg font-bold text-gray-200 hover:bg-blue-900 transition-colors shadow-sm"
            >
              <span>Catálogo</span>
              <span className="text-xs transform transition-transform duration-200">
                {menuCatalogoAbierto ? '▲' : '▼'}
              </span>
            </button>

            {/* SUB-CATEGORÍAS DESPLEGABLES */}
            {menuCatalogoAbierto && (
              <div className="mt-1 ml-3 pl-3 border-l-2 border-orange-500/50 space-y-1">
                {CATEGORIAS_CATALOGO.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => cambiarPestanaCatalogo(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-md font-semibold text-xs transition-colors block ${
                      activeTab === cat.id 
                        ? 'bg-orange-500 text-white font-bold' 
                        : 'text-gray-300 hover:bg-blue-900 hover:text-white'
                    }`}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab('carrusel')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'carrusel' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            Carrusel de Inicio
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('marcas')}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'marcas' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            Marcas Oficiales
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('buzon')}
            className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'buzon' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            <span>Buzón</span>
            {mensajes.filter(m => !m.leido).length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {mensajes.filter(m => !m.leido).length}
              </span>
            )}
          </button>
        </nav>
        
        <div className="p-4 border-t border-blue-900/50 mb-16 md:mb-0">
          <button type="button" onClick={handleLogout} className="w-full text-center px-4 py-2 rounded-lg border border-red-500/50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DINÁMICA */}
      <main className="flex-grow p-4 sm:p-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 min-h-[500px]">
          
          {/* VISTA EN BLANCO CUANDO NO HAY NADA SELECCIONADO */}
          {!activeTab && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4 opacity-40">👈</div>
              <h2 className="text-2xl font-black text-blue-900 mb-2">Selecciona una categoría</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Elige una opción del menú lateral para administrar los productos del catálogo, editar marcas o revisar tu buzón.
              </p>
            </div>
          )}

          {/* VISTAS DE CATÁLOGO DINÁMICAS */}
          {esPestanaCatalogo && (
            <div>
              <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 truncate">
                  Catálogo: {CATEGORIAS_CATALOGO.find(c => c.id === activeTab)?.nombre}
                </h1>

                {/* BOTONES COMPACTOS DE CONTROL GLOBAL TIPO PÍLDORA / SWITCH */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-gray-100 p-2 rounded-xl border border-gray-200 self-start xl:self-auto">
                  <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider px-1">Global:</span>
                  
                  {/* SWITCH PRECIOS */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700">Precios:</span>
                    <button
                      type="button"
                      onClick={() => alternarPrecioTodos(!estadoPrecioGlobal)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        estadoPrecioGlobal ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={estadoPrecioGlobal ? 'Precios Visibles' : 'Precios Ocultos'}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          estadoPrecioGlobal ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${estadoPrecioGlobal ? 'text-green-600' : 'text-gray-400'}`}>
                      {estadoPrecioGlobal ? 'SÍ' : 'NO'}
                    </span>
                  </div>

                  {/* SWITCH STOCK */}
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700">Stock:</span>
                    <button
                      type="button"
                      onClick={() => alternarExistenciasTodos(!estadoStockGlobal)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        estadoStockGlobal ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      title={estadoStockGlobal ? 'Stock Visible' : 'Stock Oculto'}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          estadoStockGlobal ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${estadoStockGlobal ? 'text-blue-600' : 'text-gray-400'}`}>
                      {estadoStockGlobal ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORMULARIO DE REGISTRO */}
              <form onSubmit={guardarProducto} className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <h3 className="font-bold text-blue-950 text-lg">
                    {editandoId ? 'Editar Producto' : 'Agregar Nuevo Artículo'}
                  </h3>
                  {editandoId && (
                    <button 
                      type="button" 
                      onClick={() => {
                        const primeraCat = Object.keys(estructuraActual)[0] || ''
                        setEditandoId(null)
                        setCodigoProd('')
                        setNombreComercialProd('')
                        setDescripcionTecnicaDb('')
                        setUnidadMedida('pieza')
                        setCategoriaSel(primeraCat)
                        setSubcategoriaSel(estructuraActual[primeraCat]?.[0] || '')
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>

                {/* CATEGORÍAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Categoría Principal</label>
                    <select
                      value={categoriaSel}
                      onChange={(e) => handleCategoriaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-semibold"
                    >
                      {Object.keys(estructuraActual).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Subcategoría Específica</label>
                    <select
                      value={subcategoriaSel}
                      onChange={(e) => setSubcategoriaSel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      {(estructuraActual[categoriaSel] || []).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CÓDIGO, NOMBRE COMERCIAL Y FICHA TÉCNICA BD */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Código del Producto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. THHW-12"
                      value={codigoProd}
                      onChange={(e) => buscarDescripcionBD(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-mono uppercase"
                    />
                    {buscandoDb && <p className="text-xs text-orange-500 mt-1 animate-pulse">Buscando en BD...</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Comercial (Frente Tarjeta)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Cable #12 Uso Doméstico"
                      value={nombreComercialProd}
                      onChange={(e) => setNombreComercialProd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ficha Técnica Detectada (Reverso BD)</label>
                    <input
                      type="text"
                      disabled
                      placeholder="Se cargará desde la base de datos..."
                      value={descripcionTecnicaDb}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-100 italic"
                    />
                  </div>
                </div>

                {/* IMAGEN, UNIDAD DE MEDIDA Y BOTÓN PUBLICAR */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Imagen (Fondo blanco a GitHub catalogo-img)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setArchivoImagenProd(e.target.files[0])
                        }
                      }}
                      className="w-full border border-gray-300 p-1.5 rounded-lg text-xs text-gray-700 bg-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Unidad de Medida
                    </label>
                    <select
                      value={unidadMedida}
                      onChange={(e) => setUnidadMedida(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-semibold"
                    >
                      <option value="pieza">Pieza (pza)</option>
                      <option value="metro">Metro (m)</option>
                      <option value="kilogramo">Kilogramo (kg)</option>
                      <option value="rollo">Rollo</option>
                      <option value="caja">Caja</option>
                    </select>
                  </div>

                  <div className="text-right pt-4">
                    <button
                      type="submit"
                      disabled={guardandoProducto}
                      className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition-colors shadow-md disabled:opacity-50"
                    >
                      {guardandoProducto ? 'Procesando e Imagen...' : editandoId ? 'Guardar Cambios' : 'Publicar Producto'}
                    </button>
                  </div>
                </div>
              </form>

              {/* BARRA DE FILTRADO DE LA TABLA Y CONTROL DE PAGINACIÓN */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-4 rounded-t-xl border border-gray-200 gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Filtrar Tabla:</span>
                    <select
                      value={filtroSubcategoriaTabla}
                      onChange={(e) => {
                        setFiltroSubcategoriaTabla(e.target.value)
                        setPaginaTabla(1)
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                    >
                      <option value="TODAS">Ver Todas las Subcategorías</option>
                      {subcategoriasDisponibles.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* NAVEGACIÓN RÁPIDA DE PÁGINAS ARRIBA */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                  <span className="text-xs font-bold text-gray-500">
                    Mostrando <strong className="text-orange-600">{productosMostrarTabla.length > 0 ? indiceInicialTabla + 1 : 0}</strong> - <strong className="text-orange-600">{Math.min(indiceFinalTabla, productosMostrarTabla.length)}</strong> de <strong className="text-blue-900">{productosMostrarTabla.length}</strong>
                  </span>

                  {totalPaginasTabla > 1 && (
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => cambiarPaginaTabla(paginaTabla - 1)}
                        disabled={paginaTabla === 1}
                        className="px-2 py-1 rounded bg-white border border-gray-200 text-blue-900 font-bold disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        &laquo;
                      </button>
                      <span className="font-bold text-blue-900 px-1">
                        {paginaTabla}/{totalPaginasTabla}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarPaginaTabla(paginaTabla + 1)}
                        disabled={paginaTabla === totalPaginasTabla}
                        className="px-2 py-1 rounded bg-white border border-gray-200 text-blue-900 font-bold disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        &raquo;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* TABLA DE PRODUCTOS (PAGINADA) */}
              <div className="overflow-x-auto border border-t-0 border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-blue-950 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Código / Foto</th>
                      <th className="py-3 px-4 font-bold">Nombre Comercial</th>
                      <th className="py-3 px-4 font-bold">Categoría / Subcategoría</th>
                      <th className="py-3 px-4 font-bold text-center">Unidad</th>
                      <th className="py-3 px-4 font-bold text-center">Visibilidad</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {productosPaginadosTabla.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                          No hay productos registrados en esta subcategoría.
                        </td>
                      </tr>
                    ) : (
                      productosPaginadosTabla.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-blue-900 flex items-center gap-3">
                            <div className="w-10 h-10 relative bg-gray-50 border rounded-lg p-1 flex items-center justify-center overflow-hidden">
                              <img src={p.imagen_url} alt={p.codigo} className="w-full h-full object-contain" />
                            </div>
                            <span>{p.codigo}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-800 max-w-xs truncate">{p.descripcion}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-orange-600">
                            <div>{p.categoria}</div>
                            <div className="text-gray-400 font-normal">{p.subcategoria}</div>
                          </td>
                          <td className="py-3 px-4 text-center text-xs font-bold text-blue-900 capitalize">
                            {p.unidad_medida || 'pieza'}
                          </td>
                          <td className="py-3 px-4 text-center text-xs">
                            <span className={`px-2 py-1 rounded-full font-bold ${p.mostrar_precio ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                              Precio: {p.mostrar_precio ? 'SI' : 'NO'}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full font-bold ${p.mostrar_existencias ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                              Stock: {p.mostrar_existencias ? 'SI' : 'NO'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-3">
                            <button
                              type="button"
                              onClick={() => prepararEdicion(p)}
                              className="text-blue-900 hover:text-orange-500 font-bold text-xs"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setModal({ mostrar: true, id: p.id!, tipo: 'producto_catalogo' })}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* CONTROLES DE PAGINACIÓN INFERIORES */}
              {totalPaginasTabla > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 rounded-b-xl border border-t-0 border-gray-200 gap-3">
                  <span className="text-xs font-bold text-gray-500">
                    Página <strong className="text-blue-900">{paginaTabla}</strong> de <strong className="text-blue-900">{totalPaginasTabla}</strong>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cambiarPaginaTabla(paginaTabla - 1)}
                      disabled={paginaTabla === 1}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                    >
                      &laquo; Anterior
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPaginasTabla }, (_, i) => i + 1).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => cambiarPaginaTabla(num)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            paginaTabla === num
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-white text-blue-900 hover:bg-orange-100 border border-gray-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => cambiarPaginaTabla(paginaTabla + 1)}
                      disabled={paginaTabla === totalPaginasTabla}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-blue-900 disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors shadow-sm"
                    >
                      Siguiente &raquo;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: CARRUSEL */}
          {activeTab === 'carrusel' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Imágenes del Carrusel</h1>
              
              <form onSubmit={agregarImagen} className="mb-8 flex flex-col sm:flex-row gap-4">
                <input 
                  type="url" 
                  required
                  placeholder="Pega aquí la URL de la imagen (Ej. https://.../imagen.jpg)"
                  value={nuevaImagen}
                  onChange={(e) => setNuevaImagen(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
                  Agregar
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {imagenes.length === 0 ? (
                  <p className="text-gray-500 col-span-full">No hay imágenes en el carrusel.</p>
                ) : (
                  imagenes.map((img) => (
                    <div key={img.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm group">
                      <div className="h-40 bg-gray-100 relative">
                        <Image src={img.imagen_url} alt="Carrusel" fill={true} className="object-cover" unoptimized={true} />
                      </div>
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">Orden: {img.orden}</span>
                        <button 
                          type="button"
                          onClick={() => setModal({ mostrar: true, id: img.id, tipo: 'imagen' })} 
                          className="text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA: MARCAS */}
          {activeTab === 'marcas' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Administrar Marcas Comerciales</h1>

              <form onSubmit={agregarMarca} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <h3 className="font-bold text-blue-950 text-base">Registrar Nueva Marca</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Condumex"
                      value={nombreMarca}
                      onChange={(e) => setNombreMarca(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Logotipo (Imagen)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      required
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setArchivoLogo(e.target.files[0])
                        }
                      }}
                      className="w-full border border-gray-300 p-1.5 rounded-lg text-xs text-gray-700 bg-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Sitio Web</label>
                    <input 
                      type="url" 
                      required
                      placeholder="Ej. https://marca.com"
                      value={sitioWebMarca}
                      onChange={(e) => setSitioWebMarca(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={subiendoMarca}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {subiendoMarca ? 'Subiendo imagen...' : 'Guardar Marca'}
                </button>
              </form>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-blue-950 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Marca</th>
                      <th className="py-3 px-4 font-bold">Sitio Oficial</th>
                      <th className="py-3 px-4 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {marcas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-500">
                          No hay marcas registradas.
                        </td>
                      </tr>
                    ) : (
                      marcas.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-blue-900 flex items-center gap-3">
                            <div className="w-8 h-8 relative bg-gray-50 border rounded p-1 flex items-center justify-center">
                              <img src={m.logo_url} alt={m.nombre} className="w-full h-full object-contain" />
                            </div>
                            {m.nombre}
                          </td>
                          <td className="py-3 px-4 text-orange-500 font-medium max-w-[180px] sm:max-w-[250px]">
                            <a 
                              href={m.sitio_web} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline truncate block"
                              title={m.sitio_web}
                            >
                              {m.sitio_web}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setModal({ mostrar: true, id: m.id, tipo: 'marca' })}
                              className="text-red-500 hover:text-red-700 font-bold text-xs"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA: BUZÓN */}
          {activeTab === 'buzon' && (
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 mb-6">Bandeja de Entrada</h1>
              
              {mensajes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500 text-lg">Tu buzón está vacío por ahora.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {mensajes.map((msj) => (
                    <div 
                      key={msj.id} 
                      className={`p-5 rounded-xl border transition-all ${msj.leido ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-blue-200 shadow-md border-l-4 border-l-orange-500'}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                        <div>
                          <h3 className={`text-lg ${msj.leido ? 'font-semibold text-gray-700' : 'font-extrabold text-blue-900'}`}>
                            {msj.nombre}
                          </h3>
                          <a href={`tel:${msj.telefono}`} className="text-orange-500 font-medium hover:underline text-sm">
                            📞 {msj.telefono}
                          </a>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(msj.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-4 ${msj.leido ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {msj.mensaje}
                      </p>
                      
                      <div className="flex gap-4 border-t border-gray-100 pt-3">
                        <button 
                          type="button"
                          onClick={() => alternarLeido(msj.id, msj.leido)}
                          className={`text-sm font-bold ${msj.leido ? 'text-gray-500 hover:text-blue-900' : 'text-blue-900 hover:text-orange-500'}`}
                        >
                          {msj.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                        </button>
                        <button 
                          type="button"
                          onClick={() => setModal({ mostrar: true, id: msj.id, tipo: 'mensaje' })}
                          className="text-sm font-bold text-red-400 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}