'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para las Especificaciones Técnicas y Medidas por Tipo de Tubo
const tiposTuberia = [
  {
    id: 'pvc-ligero',
    nombre: 'PVC Ligero (Verde)',
    uso: 'Instalaciones eléctricas ocultas en losas, muros y pisos de concreto en vivienda o comercio.',
    norma: 'Resistente a la humedad y corrosión. No propagador de flama.',
    medidas: [
      { medida: '1/2" (13 mm)', tramo: '3.00 mts', usoComun: 'Cableado residencial estándar (Focos y contactos)' },
      { medida: '3/4" (19 mm)', tramo: '3.00 mts', usoComun: 'Acometidas internas y centros de carga' },
      { medida: '1" (25 mm)', tramo: '3.00 mts', usoComun: 'Alimentaciones principales y mayor densidad de cables' },
      { medida: '1 1/4" (32 mm)', tramo: '3.00 mts', usoComun: 'Líneas secundarias de distribución' },
      { medida: '1 1/2" (38 mm)', tramo: '3.00 mts', usoComun: 'Alimentadores de alta capacidad' },
      { medida: '2" (50 mm)', tramo: '3.00 mts', usoComun: 'Acometidas comerciales e industriales' }
    ]
  },
  {
    id: 'pvc-pesado',
    nombre: 'PVC Pesado (Gris)',
    uso: 'Instalaciones industriales o expuestas que requieren alta resistencia al impacto.',
    norma: 'Soportabilidad mecánica superior. Apto para enterramiento directo.',
    medidas: [
      { medida: '1/2" (13 mm)', tramo: '3.00 mts', usoComun: 'Circuitos industriales de baja tensión' },
      { medida: '3/4" (19 mm)', tramo: '3.00 mts', usoComun: 'Alimentación de maquinaria y tableros' },
      { medida: '1" (25 mm)', tramo: '3.00 mts', usoComun: 'Líneas primarias de fuerza' },
      { medida: '1 1/4" (32 mm)', tramo: '3.00 mts', usoComun: 'Canalización de control e instrumentación' },
      { medida: '1 1/2" (38 mm)', tramo: '3.00 mts', usoComun: 'Alimentadores generales de motores' },
      { medida: '2" (50 mm)', tramo: '3.00 mts', usoComun: 'Acometidas subterráneas industriales' },
      { medida: '3" (75 mm)', tramo: '3.00 mts', usoComun: 'Ductos primarios de subestaciones' },
      { medida: '4" (100 mm)', tramo: '3.00 mts', usoComun: 'Trincheras y alimentadores de alta potencia' }
    ]
  },
  {
    id: 'galvanizado',
    nombre: 'Conduit Galvanizado',
    uso: 'Instalaciones visibles comerciales e industriales con protección mecánica máxima contra golpes y chispas.',
    norma: 'Pared Delgada (PDR) y Pared Gruesa (PGR). Con y sin rosca.',
    medidas: [
      { medida: '1/2" (13 mm)', tramo: '3.00 mts', usoComun: 'Líneas visibles, naves industriales y locales' },
      { medida: '3/4" (19 mm)', tramo: '3.00 mts', usoComun: 'Conexión de motores y tableros de control' },
      { medida: '1" (25 mm)', tramo: '3.00 mts', usoComun: 'Acometidas comerciales y tableros principales' },
      { medida: '1 1/4" (32 mm)', tramo: '3.00 mts', usoComun: 'Líneas mecánicas de protección exigente' },
      { medida: '1 1/2" (38 mm)', tramo: '3.00 mts', usoComun: 'Mufas de medición y fuerza industrial' },
      { medida: '2" (50 mm)', tramo: '3.00 mts', usoComun: 'Entradas de servicio de alta tensión' },
      { medida: '3" (75 mm)', tramo: '3.00 mts', usoComun: 'Subestaciones y alimentadores pesados' },
      { medida: '4" (100 mm)', tramo: '3.00 mts', usoComun: 'Acometidas generales de nave industrial' }
    ]
  },
  {
    id: 'poliducto',
    nombre: 'Poliducto y Manguera',
    uso: 'Canalización flexible para alojar conductores en losas de concreto o excavaciones subterráneas.',
    norma: 'Presentación en rollo continuo. Poliducto Naranja (Liso) y Negro / Corrugado.',
    medidas: [
      { medida: '1/2" (13 mm)', tramo: 'Rollo 100 mts', usoComun: 'Cableado flexible en muros de tabique/tabla roca' },
      { medida: '3/4" (19 mm)', tramo: 'Rollo 100 mts', usoComun: 'Acometidas subterráneas de baja tensión' },
      { medida: '1" (25 mm)', tramo: 'Rollo 50 mts', usoComun: 'Tramos largos de alimentación exterior' },
      { medida: '1 1/4" (32 mm)', tramo: 'Rollo 50 mts', usoComun: 'Pases de losa y ramales principales' },
      { medida: '1 1/2" (38 mm)', tramo: 'Rollo 50 mts', usoComun: 'Ducto flexible de acometida' },
      { medida: '2" (50 mm)', tramo: 'Rollo 50 mts', usoComun: 'Canalización subterránea continua' }
    ]
  },
  {
    id: 'flexible-licuatite',
    nombre: 'Tubo Flexible y Licuatite',
    uso: 'Conexión final a motores, transformadores, luminarias o equipos sujetos a vibración, humedad o intemperie.',
    norma: 'Flexible Metálico (Zapa) y Licuatite (Flexible engomado con recubrimiento de PVC hermético a líquidos y aceites).',
    medidas: [
      { medida: '1/2" (13 mm)', tramo: 'Rollo / Por metro', usoComun: 'Acometida flexible a motores pequeños, bombas y luminarias' },
      { medida: '3/4" (19 mm)', tramo: 'Rollo / Por metro', usoComun: 'Conexión a tableros con vibración y maquinaria' },
      { medida: '1" (25 mm)', tramo: 'Rollo / Por metro', usoComun: 'Alimentación hermética a motores medianos' },
      { medida: '1 1/4" (32 mm)', tramo: 'Rollo / Por metro', usoComun: 'Acometidas flexibles en plantas industriales' },
      { medida: '1 1/2" (38 mm)', tramo: 'Rollo / Por metro', usoComun: 'Conexión a transformadores de distribución' },
      { medida: '2" (50 mm)', tramo: 'Rollo / Por metro', usoComun: 'Líneas flexibles de potencia de alto calibre' },
      { medida: '3" (75 mm)', tramo: 'Rollo / Por metro', usoComun: 'Conexión hermética en subestaciones industriales' },
      { medida: '4" (100 mm)', tramo: 'Rollo / Por metro', usoComun: 'Ducto flexible hermético para alta capacidad' }
    ]
  },
  {
    id: 'soportes-unicanal',
    nombre: 'Soportes y Perfiles',
    uso: 'Estructuras de fijación y soporte para la suspensión o montaje de tubería, charolas y centros de carga.',
    norma: 'Fabricados en acero galvanizado para alta resistencia mecánica y protección contra corrosión.',
    medidas: [
      { medida: 'Riel Everest (4.8 x 4.22 cm)', tramo: '3.00 mts', usoComun: 'Montaje de abrazaderas y soporte de tuberías en muro/techo' },
      { medida: 'Perfil Unicanal Liso (2x4 cm)', tramo: '3.00 mts', usoComun: 'Soporte colgante ligero para conduit y luminarias' },
      { medida: 'Perfil Unicanal Perforado (2x4 cm)', tramo: '3.00 mts', usoComun: 'Anclaje rápido con varilla roscada para tuberías' },
      { medida: 'Perfil Unicanal Liso (4x4 cm)', tramo: '3.00 mts', usoComun: 'Estructura pesada para tableros y tendidos de fuerza' },
      { medida: 'Perfil Unicanal Perforado (4x4 cm)', tramo: '3.00 mts', usoComun: 'Soporte pesado de alta versatilidad de fijación' }
    ]
  }
]

// 2. Categorías de Sub-Pestañas para Accesorios
const categoriasAccesorios = [
  { id: 'conexiones-tubo', nombre: 'Conexiones Rígidas' },
  { id: 'flexibles-glandulas', nombre: 'Conectores Flexibles y Glándulas' },
  { id: 'abrazaderas', nombre: 'Abrazaderas' },
  { id: 'soporteria-everest', nombre: 'Perfilería, Unicanal y Everest' },
]

// 3. Lista Completa de Accesorios Organizada por Categoria (categoriaId)
const accesorios = [
  // --- CONEXIONES RÍGIDAS ---
  {
    id: 1,
    categoriaId: 'conexiones-tubo',
    nombre: 'Cople, Conector y Codo Galvanizado',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cople-conector.jpg',
    descripcion: 'Unión rígida y conexión a caja para tubería metálica conduit en pared delgada o gruesa.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'Acero Galvanizado / ZAMAK'
  },
  {
    id: 2,
    categoriaId: 'conexiones-tubo',
    nombre: 'Cople y Conector Compresión',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cople-conector-compresion.jpg',
    descripcion: 'Ensamble a presión mediante tuerca de apriete para tubería galvanizada sin roscar.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'Acero Galvanizado'
  },
  {
    id: 3,
    categoriaId: 'conexiones-tubo',
    nombre: 'Cople, Conector y Codo PVC Verde',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/pvc-ligero.jpg',
    descripcion: 'Accesorios para cementar y acoplar tubería de PVC ligero en losas y muros de concreto.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2"',
    material: 'PVC Ligero'
  },
  {
    id: 4,
    categoriaId: 'conexiones-tubo',
    nombre: 'Cople, Conector y Codo PVC Gris',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/pvc-pesado.jpg',
    descripcion: 'Conexiones de alta resistencia mecánica para canalización de PVC pesado e industrial.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'PVC Pesado'
  },
  {
    id: 5,
    categoriaId: 'conexiones-tubo',
    nombre: 'Contratuercas y Monitores',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/contratuerca-monitor.jpg',
    descripcion: 'Ajuste de rosca interior/exterior y protección plástica contra rozaduras de cable en cajas.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'Acero Galvanizado / ZAMAK / Plástico'
  },
  {
    id: 6,
    categoriaId: 'conexiones-tubo',
    nombre: 'Cople Roscado y Reducción Bushing',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cople-reduccion.jpg',
    descripcion: 'Adaptación de calibres y unión roscada para tubería conduit de pared gruesa.',
    medidas: '1/2" a 4" (Múltiples combinaciones de reducción)',
    material: 'Hierro Maleable / Aluminio'
  },

  // --- FLEXIBLES Y GLÁNDULAS ---
  {
    id: 7,
    categoriaId: 'flexibles-glandulas',
    nombre: 'Conector HLR y HLC (Licuatite)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/conector-licuatite.jpg',
    descripcion: 'Conectores rectos (HLR) y curvos a 90° (HLC) herméticos a líquidos para Licuatite.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'ZAMAK / Hierro Maleable'
  },
  {
    id: 8,
    categoriaId: 'flexibles-glandulas',
    nombre: 'Conector FXR y FXC (Flexible)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/conector-flexible.jpg',
    descripcion: 'Conectores rectos (FXR) y curvos (FXC) para la fijación firme de tubo flexible Zapa.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'ZAMAK / Aluminio'
  },
  {
    id: 9,
    categoriaId: 'flexibles-glandulas',
    nombre: 'Glándula de Prensaestopa',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/conector-glandula.jpg',
    descripcion: 'Sello hermético NEMA 4X que impide agua y polvo en la entrada de cables a tableros.',
    medidas: '3/8", 1/2", 3/4", 1", 1 1/4"',
    material: 'Nylon Plástico / Bronce Niquelado'
  },
  {
    id: 10,
    categoriaId: 'flexibles-glandulas',
    nombre: 'Conector Uso Rudo',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/conector-rudo.jpg',
    descripcion: 'Sujetador y alivio de tensión para cables de uso rudo multifilares al ingresar a cajas.',
    medidas: '1/2", 3/4", 1"',
    material: 'ZAMAK / Plástico'
  },
  {
    id: 11,
    categoriaId: 'flexibles-glandulas',
    nombre: 'Conector FXE (Poliducto Naranja)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/conector-fxe.jpg',
    descripcion: 'Conector rápido para ensamble y acople firme de poliducto naranja a cajas de registro.',
    medidas: '1/2", 3/4"',
    material: 'Plástico de Alta Resistencia'
  },

  // --- ABRAZADERAS ---
  {
    id: 12,
    categoriaId: 'abrazaderas',
    nombre: 'Abrazadera Omega y Uña',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/u%C3%B1a-omega.jpg',
    descripcion: 'Sujeción de 2 apoyos (Omega) o 1 apoyo (Uña) para fijación directa de tubería en muro o estructura.',
    medidas: '1/4", 3/8", 1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3"',
    material: 'Acero Galvanizado'
  },
  {
    id: 13,
    categoriaId: 'abrazaderas',
    nombre: 'Abrazadera Clip',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/clip.jpg',
    descripcion: 'Sujetador a presión de ajuste rápido para montaje ágil de tubos conduit.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2"',
    material: 'Acero Galvanizado'
  },
  {
    id: 14,
    categoriaId: 'abrazaderas',
    nombre: 'Abrazadera Unistrut',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/unicanal.jpg',
    descripcion: 'Abrazadera de 2 piezas para encaje perfecto en rieles de soporte y perfiles Unicanal.',
    medidas: '1/2", 3/4", 1", 1 1/4", 1 1/2", 2", 3", 4"',
    material: 'Acero Galvanizado'
  },

  // --- SOPORTERÍA, UNICANAL Y EVEREST ---
  {
    id: 15,
    categoriaId: 'soporteria-everest',
    nombre: 'Perfil Unicanal (2x4 y 4x4 cm)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/riel-unicanal.jpg',
    descripcion: 'Canal estructural metálico liso y perforado para la suspensión de tuberías y tableros.',
    medidas: '2x4 cm y 4x4 cm (Tramo de 3.00 mts)',
    material: 'Acero Galvanizado'
  },
  {
    id: 16,
    categoriaId: 'soporteria-everest',
    nombre: 'Riel Everest (4.8 x 4.22 cm)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/riel-everest.jpg',
    descripcion: 'Riel de soporte de alta carga para sistemas estructurales y tendidos eléctricos.',
    medidas: '4.8 x 4.22 cm (Tramo de 3.00 mts)',
    material: 'Acero Galvanizado'
  },
  {
    id: 17,
    categoriaId: 'soporteria-everest',
    nombre: 'Coples, Soleras y Horizontal/Vertical',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/kit1.jpg',
    descripcion: 'Placas planas, en "L" y empalmes para unir tramos de perfiles Unicanal y Everest.',
    medidas: 'Estándar para Unicanal 2x4, 4x4 y Riel Everest',
    material: 'Acero Galvanizado'
  },
  {
    id: 18,
    categoriaId: 'soporteria-everest',
    nombre: 'Mid Clamps y End Clamps',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/kit2.jpg',
    descripcion: 'Grapas intermedias y terminales para sujeción de paneles y módulos sobre perfiles.',
    medidas: 'Ajustables para marcos de 30mm a 40mm',
    material: 'Aluminio Anodizado / Acero Inoxidable'
  },
  {
    id: 19,
    categoriaId: 'soporteria-everest',
    nombre: 'Suela Tipo Piso / Base',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/kit3.jpg',
    descripcion: 'Base de anclaje a piso o losa para fijar columnas verticales de perfil Unicanal o Everest.',
    medidas: 'Para perfil 2x4 cm y 4x4 cm',
    material: 'Acero Galvanizado de Calibre Pesado'
  }
]

export default function TuberiaPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposTuberia[0].id)
  
  // Estado para controlar la Sub-Pestaña activa en los accesorios
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasAccesorios[0].id)
  
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposTuberia.find(t => t.id === tipoActivo) || tiposTuberia[0]

  // Filtramos los accesorios según la sub-pestaña seleccionada
  const accesoriosFiltrados = accesorios.filter(a => a.categoriaId === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* NAVEGACIÓN Y ENCABEZADO */}
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

        {/* BLOQUE 1: MUESTRARIO GENERAL Y FICHA TÉCNICA */}
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

        {/* BLOQUE 2: SELECTOR DE TIPOS Y TABLA DE MEDIDAS */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Especificaciones y Medidas por Tipo
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona la pestaña para consultar aplicaciones y tramos disponibles.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposTuberia.map((tipo) => (
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
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Uso Recomendado</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Especificación Técnica</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Medida / Presentación</th>
                  <th className="py-3.5 px-4 font-extrabold">Longitud</th>
                  <th className="py-3.5 px-4 font-extrabold">Aplicación Típica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.medida}</td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">{item.tramo}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLOQUE 3: ACCESORIOS CON SUB-PESTAÑAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Complementos
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Accesorios, Conexiones y Soportería
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Explora las sub-categorías y haz clic en cualquier tarjeta para consultar detalles.
            </p>
          </div>

          {/* Sub-Pestañas de Filtro para Accesorios */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasAccesorios.map((cat) => (
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

          {/* Cuadrícula de Tarjetas Filtradas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accesoriosFiltrados.map((item) => {
              const isFlipped = flippedCards[item.id] || false;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="h-80 w-full cursor-pointer [perspective:1000px] group"
                >
                  <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRENTE DE LA TARJETA */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-6 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full h-40 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-cover" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors">
                          {item.nombre}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Haz clic para ver especificaciones 🔄</p>
                      </div>
                    </div>

                    {/* REVERSO DE LA TARJETA */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-blue-950 p-6 text-white [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col justify-between border-2 border-orange-500">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">Ficha Técnica</span>
                          <span className="text-xs text-gray-400">🔄 Volver</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.nombre}</h3>
                        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>

                      <div className="border-t border-blue-900 pt-3 space-y-2">
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Medidas Disponibles:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Material:</span>
                          <span className="text-xs font-bold text-gray-200">{item.material}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
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