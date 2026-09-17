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
  subcategoria_especifica?: string
  imagen_url: string
  mostrar_precio: boolean
  mostrar_existencias: boolean
  unidad_medida?: string
  precio?: number
  existencias?: number
  imagenes_galeria?: string[]
}

// 1. ESTRUCTURAS DE 3 NIVELES: CATEGORÍA -> SUBCATEGORÍA -> SUBCATEGORÍA ESPECÍFICA
const ESTRUCTURAS_POR_CATALOGO: Record<string, Record<string, Record<string, string[]>>> = {
  tuberia: {
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
  },
  cajas_registros: {
    'CAJAS METALICAS': {
      'Cajas Generales': ['Cajas 2x4', 'Cajas 4x4, 5x5, 6x6, 8x8', 'Cajas Octagonales']
    },
    'PLASTICAS Y CANALETAS': {
      'Plasticas': ['Chalupas Plasticas', 'Cajas de Reparacion', 'Cajas Estanca', 'Canaletas']
    },
    'INTERPERIE Y TIPO ZAPATO': {
      'Especiales': ['Chalupas de Interperie', 'Armarios', 'Cajas tipo Zapato']
    },
    'TAPAS Y COMPLEMENTOS': {
      'Tapas': ['Tapas Ciegas Galvanizadas', 'Tapas Galvanizadas', 'Tapas Interperie', 'Tapas Especiales']
    }
  },
  cableado: {
    'CABLE': {
      'Conductores': ['Cobre', 'Aluminio']
    },
    'CABLE ESPECIAL': {
      'Especiales': ['Uso Rudo', 'POT / Duplex', 'Romex', 'Automotriz', 'Solar']
    },
    'EMBOBINADO': {
      'Aislamiento y Bobinas': ['Magneto', 'Cuñas', 'Espagetti', 'Barniz', 'Cinta']
    }
  },
  iluminacion: {
    'FOCOS': {
      'Focos': ['Focos LED', 'Focos Incandecentes', 'Focos tipo Vela y Bintage']
    },
    'SPOT': {
      'Spots': ['Empotrados', 'Sobrepuestos', 'Dimeables']
    },
    'PLAFONES Y LAMPARAS': {
      'Interiores': ['Plafones', 'Lamparas Horizontales']
    },
    'ARBOTANTES': {
      'Muros': ['Arbotantes Electrico', 'Arbotante Solar']
    },
    'LAMPARAS EXTERIORES': {
      'Exteriores': ['Reflectores', 'Sub Urbanas']
    }
  },
  control_fuerza: {
    'CENTROS DE CARGA': {
      'Cajas': ['Metalicos', 'Riel DIN']
    },
    'BRAKERS': {
      'Interruptores': ['QD y QP', 'Riel DIN', 'Termomagneticos']
    },
    'DE CONTROL': {
      'Automatizacion': ['Contactores', 'Relevadores', 'Guardamotores', 'Arrancadores']
    },
    'ACOMETIDA': {
      'Medicion': ['Bases Socket', 'Accesorios']
    }
  },
  placas_apagadores: {
    'ETON y LEVITON': {
      'Líneas': ['Tradicionales', 'Decorato']
    },
    'PLACAS Y TAPAS': {
      'Placas': ['Tapas 2x4 y 4x4', 'Especiales Decorato']
    },
    'LUCEK': {
      'Modelos': ['Basic', 'Flat', 'Premium', 'Cristal']
    }
  },
  media_tension: {
    'TRASFORMADORES': {
      'Transformadores': ['Secos', 'Otros']
    },
    'CORTACIRCUITOS': {
      'Proteccion': ['Canillas', 'Fisibles de Alta', 'Cortacircuitos']
    },
    'APARTARRAYOS': {
      'Aisladores': ['Polimero', 'Ceramicos']
    },
    'ACCESORIOS': {
      'Herrajes': ['Crucetas', 'Abrazaderas', 'Herrajes', 'Remates', 'Aisladores', 'Grapas', 'Conectores y Derivadores', 'Multiples Mecanicos']
    }
  },
  electronica: {
    'HERRAMIENTAS': {
      'Manuales': ['Pinzas', 'Desarmadores', 'Probadores de Cable', 'Dobla Tubos, Corta Tubos y Guias', 'Linea de Vida', 'Carbones']
    },
    'TORNILLERIA': {
      'Fijacion': ['Taquetes', 'Tornillos', 'Terminales', 'Corbatas', 'Capuchones']
    },
    'ENERGIA': {
      'Suministro': ['Baterias Alcalinas y Recargables', 'Inversores', 'Reguladores y UPS', 'Multiples y Extensiones']
    },
    'SMART HOME': {
      'Domotica': ['Focos y Tomas', 'Camaras', 'Timbres']
    },
    'AUDIO Y VIDEO': {
      'Conectividad': ['Cables RCA', 'Cables de Luz', 'Accesorios', 'Fusibles']
    },
    'CINTAS ASILANTES': {
      'Cintas': ['Cinta Aislante', 'Vulcanizable y Maya', 'Precaucion', 'Doble Cara', 'Empaquetar']
    }
  },
  productos_temporada: {
    'VENTILADORES Y CALENTONES': {
      'Climatizacion': ['De techo y Piso', 'Calentones']
    },
    'NAVIDAD': {
      'Decoracion': ['Luces', 'Inflables', 'Decoraciones']
    },
    'ESPEJOS': {
      'Espejos': ['Con Luz', 'Sin Luz']
    }
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
  
  const [activeTab, setActiveTab] = useState<string | null>(null)
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

  // ESTADOS FORMULARIO REGISTRO (3 NIVELES)
  const [estructuraActual, setEstructuraActual] = useState<Record<string, Record<string, string[]>>>({})
  const [categoriaSel, setCategoriaSel] = useState('')
  const [subcategoriaSel, setSubcategoriaSel] = useState('')
  const [subcategoriaEspecialSel, setSubcategoriaEspecialSel] = useState('')
  
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

  // ESTADOS GALERÍA DE IMÁGENES DEL CATÁLOGO
  const [galeriaSeccionSel, setGaleriaSeccionSel] = useState('tuberia')
  const [galeriaCategoriaSel, setGaleriaCategoriaSel] = useState('TODAS')
  const [galeriaSubcategoriaSel, setGaleriaSubcategoriaSel] = useState('TODAS')
  const [galeriaSubcategoriaEspecialSel, setGaleriaSubcategoriaEspecialSel] = useState('TODAS')
  const [galeriaProductos, setGaleriaProductos] = useState<ProductoCatalogo[]>([])
  const [subiendoGaleriaId, setSubiendoGaleriaId] = useState<number | null>(null)

  // FILTROS COMPACTOS TABLA PRINCIPAL
  const [filtroSubcategoriaTabla, setFiltroSubcategoriaTabla] = useState('TODAS')
  const [filtroSubcategoriaEspecialTabla, setFiltroSubcategoriaEspecialTabla] = useState('TODAS')

  // PAGINACIÓN
  const [paginaTabla, setPaginaTabla] = useState(1)
  const elementosPorPagina = 30

  // VISIBILIDAD GLOBAL
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

  const cargarProductosGaleria = async (seccionId: string) => {
    const tabla = obtenerNombreTabla(seccionId)
    const { data } = await supabase
      .from(tabla)
      .select('*')
      .range(0, 9999)
      .order('codigo', { ascending: true })

    if (data) {
      setGaleriaProductos(data)
    } else {
      setGaleriaProductos([])
    }
  }

  const cambiarPestanaCatalogo = (tabId: string) => {
    setActiveTab(tabId)
    setFiltroSubcategoriaTabla('TODAS')
    setFiltroSubcategoriaEspecialTabla('TODAS')
    setPaginaTabla(1)
    
    const nuevaEstructura = ESTRUCTURAS_POR_CATALOGO[tabId] || ESTRUCTURAS_POR_CATALOGO['tuberia']
    setEstructuraActual(nuevaEstructura)
    
    const primeraCat = Object.keys(nuevaEstructura)[0] || ''
    const primeraSubcat = primeraCat ? Object.keys(nuevaEstructura[primeraCat] || {})[0] || '' : ''
    const primeraSubEspecial = (primeraCat && primeraSubcat) ? (nuevaEstructura[primeraCat][primeraSubcat]?.[0] || '') : ''
    
    setCategoriaSel(primeraCat)
    setSubcategoriaSel(primeraSubcat)
    setSubcategoriaEspecialSel(primeraSubEspecial)

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
          if (activeTab === 'imagenes_catalogo') {
            cargarProductosGaleria(galeriaSeccionSel)
          } else {
            cargarProductosSeccion(activeTab)
          }
        }
      }
    }
    checkUser()
  }, [router, activeTab, galeriaSeccionSel])

  const handleCategoriaChange = (cat: string) => {
    setCategoriaSel(cat)
    const subcats = Object.keys(estructuraActual[cat] || {})
    const primeraSub = subcats[0] || ''
    setSubcategoriaSel(primeraSub)

    const subEspeciales = primeraSub ? (estructuraActual[cat][primeraSub] || []) : []
    setSubcategoriaEspecialSel(subEspeciales[0] || '')
  }

  const handleSubcategoriaChange = (sub: string) => {
    setSubcategoriaSel(sub)
    const subEspeciales = estructuraActual[categoriaSel]?.[sub] || []
    setSubcategoriaEspecialSel(subEspeciales[0] || '')
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
        subcategoria_especifica: subcategoriaEspecialSel,
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

  const subirImagenesGaleria = async (producto: ProductoCatalogo, archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return

    setSubiendoGaleriaId(producto.id || null)
    try {
      const fotosExistentes = producto.imagenes_galeria || []
      const codigoUpper = producto.codigo.toUpperCase()
      const nuevasUrls: string[] = []

      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i]
        const indice = fotosExistentes.length + i + 1
        const nombreArchivoSecuencial = `${codigoUpper}.${indice}.jpg`

        const dataImg = new FormData()
        dataImg.append('codigo', codigoUpper)
        dataImg.append('nombre_personalizado', nombreArchivoSecuencial)
        dataImg.append('imagen', file)

        const resImg = await fetch('/api/admin/subir-imagen', {
          method: 'POST',
          body: dataImg,
        })

        if (!resImg.ok) {
          throw new Error(`Error al subir la imagen ${i + 1}`)
        }

        const resultImg = await resImg.json()
        nuevasUrls.push(resultImg.imagen_url || `https://raw.githubusercontent.com/albizteguielectric/catalogo-img/main/${nombreArchivoSecuencial}`)
      }

      const imagenesActualizadas = [...fotosExistentes, ...nuevasUrls]
      const tabla = obtenerNombreTabla(galeriaSeccionSel)

      const { error } = await supabase
        .from(tabla)
        .update({ imagenes_galeria: imagenesActualizadas })
        .eq('id', producto.id)

      if (error) throw error

      mostrarAlerta(`Se agregaron ${archivos.length} imágenes correctamente al producto ${codigoUpper}.`, 'exito')
      cargarProductosGaleria(galeriaSeccionSel)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir imágenes a la galería'
      mostrarAlerta(msg, 'error')
    } finally {
      setSubiendoGaleriaId(null)
    }
  }

  // ELIMINAR/VACIAR TODAS LAS FOTOS SECUNDARIAS DE LA GALERÍA DE UN PRODUCTO
  const vaciarGaleriaProducto = async (productoId: number) => {
    try {
      const tabla = obtenerNombreTabla(galeriaSeccionSel)
      const { error } = await supabase
        .from(tabla)
        .update({ imagenes_galeria: [] })
        .eq('id', productoId)

      if (error) throw error

      mostrarAlerta('Se eliminaron todas las fotos de la galería adicional.', 'exito')
      cargarProductosGaleria(galeriaSeccionSel)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al vaciar la galería del producto'
      mostrarAlerta(msg, 'error')
    }
  }

  const prepararEdicion = (p: ProductoCatalogo) => {
    setEditandoId(p.id || null)
    setCategoriaSel(p.categoria)
    setSubcategoriaSel(p.subcategoria)
    setSubcategoriaEspecialSel(p.subcategoria_especifica || '')
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
    } else if (modal.tipo === 'vaciar_galeria') {
      vaciarGaleriaProducto(modal.id)
    }
    setModal({ mostrar: false, id: 0, tipo: '' })
  }

  const esPestanaCatalogo = activeTab ? CATEGORIAS_CATALOGO.some(c => c.id === activeTab) : false

  // SUBCATEGORÍAS PARA LA TABLA PRINCIPAL DEL DASHBOARD
  const subcategoriasDisponibles = activeTab && ESTRUCTURAS_POR_CATALOGO[activeTab]
    ? Array.from(new Set(Object.values(ESTRUCTURAS_POR_CATALOGO[activeTab]).flatMap(cat => Object.keys(cat))))
    : []

  // ESPECÍFICAS EXCLUSIVAS DE LA SUBCATEGORÍA SELECCIONADA EN LA TABLA
  const subcategoriasEspecialesDisponibles = (activeTab && ESTRUCTURAS_POR_CATALOGO[activeTab] && filtroSubcategoriaTabla !== 'TODAS')
    ? Array.from(new Set(
        Object.values(ESTRUCTURAS_POR_CATALOGO[activeTab])
          .flatMap(cat => cat[filtroSubcategoriaTabla] || [])
      ))
    : []

  const productosMostrarTabla = productosLista.filter(p => {
    const coincideSub = filtroSubcategoriaTabla === 'TODAS' || (p.subcategoria || '').trim().toLowerCase() === filtroSubcategoriaTabla.trim().toLowerCase()
    const coincideSubEsp = filtroSubcategoriaEspecialTabla === 'TODAS' || (p.subcategoria_especifica || '').trim().toLowerCase() === filtroSubcategoriaEspecialTabla.trim().toLowerCase()
    return coincideSub && coincideSubEsp
  })

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

  // ESTRUCTURAS Y OPCIONES DEPENDIENTES PARA "IMÁGENES DEL CATÁLOGO"
  const estructuraGaleriaActual = ESTRUCTURAS_POR_CATALOGO[galeriaSeccionSel] || {}
  const categoriasGaleriaDisponibles = Object.keys(estructuraGaleriaActual)
  
  const subcategoriasGaleriaDisponibles = galeriaCategoriaSel !== 'TODAS' && estructuraGaleriaActual[galeriaCategoriaSel]
    ? Object.keys(estructuraGaleriaActual[galeriaCategoriaSel])
    : Array.from(new Set(Object.values(estructuraGaleriaActual).flatMap(c => Object.keys(c))))

  const subcategoriasEspecialesGaleriaDisponibles = (galeriaCategoriaSel !== 'TODAS' && galeriaSubcategoriaSel !== 'TODAS' && estructuraGaleriaActual[galeriaCategoriaSel]?.[galeriaSubcategoriaSel])
    ? estructuraGaleriaActual[galeriaCategoriaSel][galeriaSubcategoriaSel]
    : []

  const galeriaProductosFiltrados = galeriaProductos.filter(p => {
    const coincideCat = galeriaCategoriaSel === 'TODAS' || (p.categoria || '').trim().toLowerCase() === galeriaCategoriaSel.trim().toLowerCase()
    const coincideSubcat = galeriaSubcategoriaSel === 'TODAS' || (p.subcategoria || '').trim().toLowerCase() === galeriaSubcategoriaSel.trim().toLowerCase()
    const coincideSubEsp = galeriaSubcategoriaEspecialSel === 'TODAS' || (p.subcategoria_especifica || '').trim().toLowerCase() === galeriaSubcategoriaEspecialSel.trim().toLowerCase()
    return coincideCat && coincideSubcat && coincideSubEsp
  })

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
                modal.tipo === 'marca' ? 'esta marca comercial' : 
                modal.tipo === 'vaciar_galeria' ? 'todas las imágenes adicionales de este producto. Solo se conservará la foto principal' : 'este producto del catálogo'
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
            onClick={() => {
              setActiveTab('imagenes_catalogo')
              cargarProductosGaleria(galeriaSeccionSel)
            }}
            className={`w-full text-left px-4 py-3 rounded-lg font-bold transition-colors shadow-sm ${activeTab === 'imagenes_catalogo' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-blue-900 hover:text-white'}`}
          >
            Imágenes del Catálogo
          </button>

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
          
          {!activeTab && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4 opacity-40">👈</div>
              <h2 className="text-2xl font-black text-blue-900 mb-2">Selecciona una categoría</h2>
              <p className="text-gray-500 text-sm max-w-sm">
                Elige una opción del menú lateral para administrar los productos del catálogo, editar marcas o revisar tu buzón.
              </p>
            </div>
          )}

          {/* VISTAS DE CATÁLOGO DINÁMICAS CON 3 NIVELES */}
          {esPestanaCatalogo && (
            <div>
              <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 truncate">
                  Catálogo: {CATEGORIAS_CATALOGO.find(c => c.id === activeTab)?.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-gray-100 p-2 rounded-xl border border-gray-200 self-start xl:self-auto">
                  <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider px-1">Global:</span>
                  
                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700">Precios:</span>
                    <button
                      type="button"
                      onClick={() => alternarPrecioTodos(!estadoPrecioGlobal)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        estadoPrecioGlobal ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${estadoPrecioGlobal ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${estadoPrecioGlobal ? 'text-green-600' : 'text-gray-400'}`}>
                      {estadoPrecioGlobal ? 'SÍ' : 'NO'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-gray-700">Stock:</span>
                    <button
                      type="button"
                      onClick={() => alternarExistenciasTodos(!estadoStockGlobal)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        estadoStockGlobal ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${estadoStockGlobal ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-[10px] font-black uppercase ${estadoStockGlobal ? 'text-blue-600' : 'text-gray-400'}`}>
                      {estadoStockGlobal ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* FORMULARIO DE REGISTRO CON 3 COMBOBOX */}
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
                        const primeraSub = primeraCat ? Object.keys(estructuraActual[primeraCat] || {})[0] || '' : ''
                        setEditandoId(null)
                        setCodigoProd('')
                        setNombreComercialProd('')
                        setDescripcionTecnicaDb('')
                        setUnidadMedida('pieza')
                        setCategoriaSel(primeraCat)
                        setSubcategoriaSel(primeraSub)
                        setSubcategoriaEspecialSel(primeraSub ? (estructuraActual[primeraCat][primeraSub]?.[0] || '') : '')
                      }}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Cancelar Edición
                    </button>
                  )}
                </div>

                {/* SELECTORES DE 3 NIVELES */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">1. Categoría Principal</label>
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
                    <label className="block text-xs font-bold text-gray-700 mb-1">2. Subcategoría</label>
                    <select
                      value={subcategoriaSel}
                      onChange={(e) => handleSubcategoriaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white font-semibold"
                    >
                      {Object.keys(estructuraActual[categoriaSel] || {}).map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">3. Subcategoría Específica</label>
                    <select
                      value={subcategoriaEspecialSel}
                      onChange={(e) => setSubcategoriaEspecialSel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white"
                    >
                      {(estructuraActual[categoriaSel]?.[subcategoriaSel] || []).map((subEspecial) => (
                        <option key={subEspecial} value={subEspecial}>{subEspecial}</option>
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
                      placeholder="Ej. Manguera Galvanizada Azul 1/2"
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

              {/* BARRA DE FILTRADO COMPACTA EN UNA SOLA LÍNEA */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-3 rounded-t-xl border border-gray-200 gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Filtrar:</span>
                  
                  {/* COMBOBOX 1: SUBCATEGORÍA COMPACTO */}
                  <select
                    value={filtroSubcategoriaTabla}
                    onChange={(e) => {
                      const sub = e.target.value
                      setFiltroSubcategoriaTabla(sub)
                      setFiltroSubcategoriaEspecialTabla('TODAS')
                      setPaginaTabla(1)
                    }}
                    className="max-w-[170px] sm:max-w-[200px] truncate px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm"
                  >
                    <option value="TODAS">Subcategoría (Todas)</option>
                    {subcategoriasDisponibles.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>

                  {/* COMBOBOX 2: ESPECÍFICA DEPENDIENTE Y COMPACTO */}
                  <select
                    value={filtroSubcategoriaEspecialTabla}
                    disabled={filtroSubcategoriaTabla === 'TODAS'}
                    onChange={(e) => {
                      setFiltroSubcategoriaEspecialTabla(e.target.value)
                      setPaginaTabla(1)
                    }}
                    className="max-w-[170px] sm:max-w-[200px] truncate px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="TODAS">
                      {filtroSubcategoriaTabla === 'TODAS' ? 'Específica (Elige Subcat)' : 'Específica (Todas)'}
                    </option>
                    {subcategoriasEspecialesDisponibles.map((subEspecial) => (
                      <option key={subEspecial} value={subEspecial}>{subEspecial}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-wrap items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                  <span className="text-[11px] font-bold text-gray-500">
                    Mostrando <strong className="text-orange-600">{productosMostrarTabla.length > 0 ? indiceInicialTabla + 1 : 0}</strong> - <strong className="text-orange-600">{Math.min(indiceFinalTabla, productosMostrarTabla.length)}</strong> de <strong className="text-blue-900">{productosMostrarTabla.length}</strong>
                  </span>

                  {totalPaginasTabla > 1 && (
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => cambiarPaginaTabla(paginaTabla - 1)}
                        disabled={paginaTabla === 1}
                        className="px-2 py-0.5 rounded bg-white border border-gray-200 text-blue-900 font-bold disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        &laquo;
                      </button>
                      <span className="font-bold text-blue-900 px-1 text-[11px]">
                        {paginaTabla}/{totalPaginasTabla}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarPaginaTabla(paginaTabla + 1)}
                        disabled={paginaTabla === totalPaginasTabla}
                        className="px-2 py-0.5 rounded bg-white border border-gray-200 text-blue-900 font-bold disabled:opacity-40 hover:bg-orange-500 hover:text-white transition-colors"
                      >
                        &raquo;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* TABLA DE PRODUCTOS */}
              <div className="overflow-x-auto border border-t-0 border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-blue-950 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Código / Foto</th>
                      <th className="py-3 px-4 font-bold">Nombre Comercial</th>
                      <th className="py-3 px-4 font-bold">Jerarquía</th>
                      <th className="py-3 px-4 font-bold text-center">Unidad</th>
                      <th className="py-3 px-4 font-bold text-center">Visibilidad</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {productosPaginadosTabla.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 font-medium">
                          No hay productos registrados con estos filtros.
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
                            <div className="font-bold text-blue-900">{p.categoria}</div>
                            <div>{p.subcategoria}</div>
                            {p.subcategoria_especifica && (
                              <div className="text-gray-400 font-normal italic">{p.subcategoria_especifica}</div>
                            )}
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

          {/* VISTA: IMÁGENES DEL CATÁLOGO (GALERÍA REAL) CON FILTROS DEPENDIENTES Y ELIMINACIÓN */}
          {activeTab === 'imagenes_catalogo' && (
            <div>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900">Imágenes del Catálogo</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Agrega fotos reales tomadas en tienda a cada producto. Se guardarán secuencialmente como <code className="bg-gray-100 px-1 py-0.5 rounded text-orange-600 font-mono">012E.1.jpg</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-orange-600 font-mono">012E.2.jpg</code>, etc.
                </p>
              </div>

              {/* FILTROS POR COMBOBOX (3 NIVELES DEPENDIENTES) */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Sección Catálogo</label>
                  <select
                    value={galeriaSeccionSel}
                    onChange={(e) => {
                      const sec = e.target.value
                      setGaleriaSeccionSel(sec)
                      setGaleriaCategoriaSel('TODAS')
                      setGaleriaSubcategoriaSel('TODAS')
                      setGaleriaSubcategoriaEspecialSel('TODAS')
                      cargarProductosGaleria(sec)
                    }}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold text-gray-900 bg-white"
                  >
                    {CATEGORIAS_CATALOGO.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">1. Categoría</label>
                  <select
                    value={galeriaCategoriaSel}
                    onChange={(e) => {
                      setGaleriaCategoriaSel(e.target.value)
                      setGaleriaSubcategoriaSel('TODAS')
                      setGaleriaSubcategoriaEspecialSel('TODAS')
                    }}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                  >
                    <option value="TODAS">Todas las Categorías</option>
                    {categoriasGaleriaDisponibles.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">2. Subcategoría</label>
                  <select
                    value={galeriaSubcategoriaSel}
                    onChange={(e) => {
                      setGaleriaSubcategoriaSel(e.target.value)
                      setGaleriaSubcategoriaEspecialSel('TODAS')
                    }}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white"
                  >
                    <option value="TODAS">Todas las Subcategorías</option>
                    {subcategoriasGaleriaDisponibles.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">3. Específica</label>
                  <select
                    value={galeriaSubcategoriaEspecialSel}
                    disabled={galeriaSubcategoriaSel === 'TODAS'}
                    onChange={(e) => setGaleriaSubcategoriaEspecialSel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="TODAS">
                      {galeriaSubcategoriaSel === 'TODAS' ? 'Elige Subcategoría' : 'Todas las Específicas'}
                    </option>
                    {subcategoriasEspecialesGaleriaDisponibles.map((subEspecial) => (
                      <option key={subEspecial} value={subEspecial}>{subEspecial}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TABLA DE FOTOS REALES */}
              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="bg-blue-950 text-white text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Foto Catálogo</th>
                      <th className="py-3 px-4 font-bold">Código</th>
                      <th className="py-3 px-4 font-bold">Nombre Comercial</th>
                      <th className="py-3 px-4 font-bold">Imágenes Agregadas</th>
                      <th className="py-3 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {galeriaProductosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500 font-medium">
                          No se encontraron productos para los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      galeriaProductosFiltrados.map((p) => {
                        const fotosAgregadas = p.imagenes_galeria || []
                        const subiendoEste = subiendoGaleriaId === p.id

                        return (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 bg-gray-50 border rounded-lg p-1 flex items-center justify-center overflow-hidden">
                                <img src={p.imagen_url} alt={p.codigo} className="w-full h-full object-contain" />
                              </div>
                            </td>
                            <td className="py-3 px-4 font-black text-blue-900 font-mono">{p.codigo}</td>
                            <td className="py-3 px-4 font-medium text-gray-800 max-w-xs">{p.descripcion}</td>
                            <td className="py-3 px-4">
                              {fotosAgregadas.length === 0 ? (
                                <span className="text-xs text-gray-400 italic">Sin fotos adicionales</span>
                              ) : (
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {fotosAgregadas.map((_, idx) => (
                                    <span key={idx} className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                      {p.codigo}.{idx + 1}.jpg
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              {/* BOTÓN PARA VACIAR O BORRAR FOTOS SECUNDARIAS */}
                              {fotosAgregadas.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setModal({ mostrar: true, id: p.id!, tipo: 'vaciar_galeria' })}
                                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
                                  title="Eliminar todas las fotos de la galería de este producto"
                                >
                                  Vaciar fotos
                                </button>
                              )}

                              {/* BOTÓN SUBIR NUEVAS FOTOS */}
                              <label className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-sm ${subiendoEste ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}>
                                {subiendoEste ? 'Subiendo...' : '+ Agregar imágenes'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  disabled={subiendoEste}
                                  onChange={(e) => subirImagenesGaleria(p, e.target.files)}
                                  className="hidden"
                                />
                              </label>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
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