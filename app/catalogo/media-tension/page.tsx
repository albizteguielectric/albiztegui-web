'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Media Tensión y Equipos
const tiposMediaTension = [
  {
    id: 'transformadores-proteccion',
    nombre: 'Transformadores y Protección Electromecánica',
    uso: 'Transformación de voltaje para distribución en interiores y protección de sobrecorriente o descargas.',
    norma: 'Aislamiento seco Clase F/H y equipos de maniobra normados por CFE.',
    medidas: [
      { modelo: 'Transformadores Secos de Aislamiento', capacidad: '3 kVA, 5 kVA, 10 kVA y 30 kVA (Monofásicos y Trifásicos)', usoComun: 'Alimentación de tableros de alumbrado, maquinaria y control interior' },
      { modelo: 'Cortacircuito Fusible (Seccionador)', capacidad: 'Voltajes de operación en 15 kV, 27 kV y 38 kV', usoComun: 'Protección de ramales primarios y subestaciones' },
      { modelo: 'Canillas de Reemplazo', capacidad: 'Tubos portafusible para 15 kV, 27 kV y 38 kV (100A / 200A)', usoComun: 'Repuesto operativo para cortacircuitos' },
      { modelo: 'Apartarrayos Cerámicos / Poliméricos', capacidad: 'Protección para 12 kV, 21 kV y 30 kV (Óxido de Zinc)', usoComun: 'Drenado de sobrevoltajes por rayos o maniobra' }
    ]
  },
  {
    id: 'herrajes-aislamiento',
    nombre: 'Herrajes Aéreos y Aislamiento',
    uso: 'Sostenimiento mecánico, remate de líneas y aislamiento de conductores en redes aéreas de distribución.',
    norma: 'Acero galvanizado por inmersión en caliente (CFE C8400) y aisladores bajo norma NFX/CFE.',
    medidas: [
      { modelo: 'Crucetas PT y PR (PT-200, PT-250, PR-200, PR-250)', capacidad: 'Perfiles de acero galvanizado CFE (2000mm y 2500mm)', usoComun: 'Soporte horizontal de líneas primarias y aisladores en poste' },
      { modelo: 'Abrazaderas UL / UC y Soleras BD / RE', capacidad: 'Para postes de concreto y madera (Diversos diámetros)', usoComun: 'Fijación de crucetas y herrajes a poste' },
      { modelo: 'Grapas y Remates (Rectos / Curvos / Ojo RE)', capacidad: 'Para cable ACSR / AAC (Calibres 1/0 a 4/0 AWG)', usoComun: 'Tensionamiento y retención de líneas aéreas' },
      { modelo: 'Batidores de 1, 3 y 4 Vías', capacidad: 'Montaje de 1 a 4 carretes aisladores', usoComun: 'Soporte vertical de neutro o líneas secundarias' },
      { modelo: 'Aisladores (Carrete / Tipo Poste / Suspensión)', capacidad: 'Aislamiento sintético y porcelana (15 kV a 35 kV)', usoComun: 'Soporte y aislamiento en crucetas y postes' }
    ]
  },
  {
    id: 'conectores-empalmes',
    nombre: 'Conectores y Derivadores de Fuerza',
    uso: 'Interconexión de conductores primarios, derivaciones de red y ensambles mecánicos de alta presión.',
    norma: 'Aleaciones de aluminio/cobre de alta conductividad y tornillería galvanizada.',
    medidas: [
      { modelo: 'Conector Base Cuadrada y Derivadores Tipo T', capacidad: 'Para línea principal y bajadas a equipo', usoComun: 'Conexión rígida en estructuras de subestación' },
      { modelo: 'Conectores Burndy y Pernos Doble Rosca', capacidad: 'Compresión e ingeniería de apriete contiguo', usoComun: 'Empalmes de alta confiabilidad' },
      { modelo: 'Múltiple Mecánico (4, 6 y 8 Vías)', capacidad: 'Entradas para cable de potencia (Multi-perforado)', usoComun: 'Distribución en registros subterráneos o pedestales' },
      { modelo: 'Grapa y Base RB', capacidad: 'Sujeción de conductor a aislamiento o soporte', usoComun: 'Retención mecánica en estructuras aéreas' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasMediaTension = [
  { id: 'transformadores-equipos', nombre: 'Transformadores y Protección' },
  { id: 'herrajes-soporte', nombre: 'Herrajes y Aisladores' },
  { id: 'conectores-fuerza', nombre: 'Conectores y Múltiples' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: TRANSFORMADORES Y PROTECCIÓN ---
  {
    id: 1,
    categoriaId: 'transformadores-equipos',
    nombre: 'Transformadores Secos de Aislamiento (3, 5, 10 y 30 kVA)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/transformadores.jpg',
    descripcion: 'Transformadores secos para uso comercial e industrial en interiores. Operación silenciosa, bajo mantenimiento y gabinete de protección metálico.',
    medidas: 'Potencias de 3 kVA, 5 kVA, 10 kVA y 30 kVA (Tensiones primarias y secundarias a medida)',
    material: 'Devanados de Cobre/Aluminio con Aislamiento Seco Clase F/H (Gabinete NEMA 1/3R)'
  },
  {
    id: 2,
    categoriaId: 'transformadores-equipos',
    nombre: 'Cortacircuitos Fusible y Canillas (15 kV, 27 kV y 38 kV)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/canillas.jpg',
    descripcion: 'Equipos de desconexión portafusible para protección contra sobrecorriente en transformadores y ramales.',
    medidas: 'Cortacircuitos completos y Canillas de repuesto en clase 15 kV, 27 kV y 38 kV',
    material: 'Aislante de Porcelana / Polímero y Tubo de Fibra de Vidrio'
  },
  {
    id: 3,
    categoriaId: 'transformadores-equipos',
    nombre: 'Apartarrayos Cerámicos y Poliméricos',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/apartarrayos.jpg',
    descripcion: 'Dispositivos de protección contra sobrevoltajes transitorios causados por rayos o maniobras de red.',
    medidas: 'Tensiones de diseño para líneas de 12 kV, 21 kV y 30 kV',
    material: 'Varistores de Óxido de Zinc (ZnO) en Cuerpo Cerámico / Polímeros'
  },

  // --- CATEGORÍA 2: HERRAJES Y AISLADORES ---
  {
    id: 4,
    categoriaId: 'herrajes-soporte',
    nombre: 'Crucetas PT/PR, Abrazaderas y Herrajes de Galvanizado',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/abrazadera-re.jpg',
    descripcion: 'Crucetas de paso (PT) y remate (PR) de 200 y 250 junto con elementos de sujeción en acero galvanizado para estructura de postes.',
    medidas: 'Crucetas PT-200, PT-250, PR-200, PR-250 | Abrazaderas UL y UC | Soleras BD y RE | Batidores 1 a 4 vías',
    material: 'Acero Galvanizado por Inmersión en Caliente (Norma CFE C8400)'
  },
  {
    id: 5,
    categoriaId: 'herrajes-soporte',
    nombre: 'Grapas de Remate y Remates Rectos/Curvos',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/remates.jpg',
    descripcion: 'Accesorios para remate y tensión de conductores aéreos de aluminio (ACSR/AAC) en postes de paso y remate.',
    medidas: 'Grapas de remate ajustables y remates preformados/mecánicos rectos y curvos',
    material: 'Aluminio de Alta Resistencia / Acero Galvanizado'
  },
  {
    id: 6,
    categoriaId: 'herrajes-soporte',
    nombre: 'Aisladores (Carrete, Porcelana Tipo Poste y Sintéticos)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/ailadores.jpg',
    descripcion: 'Cuerpos aislantes de alta resistencia dieléctrica y mecánica para aislamiento de líneas primarias y secundarias.',
    medidas: 'Aisladores tipo carrete | Porcelana tipo poste | Sintético de suspensión (15 kV a 35 kV)',
    material: 'Porcelana Vitrificada / Polímero de Silicón'
  },

  // --- CATEGORÍA 3: CONECTORES Y MÚLTIPLES ---
  {
    id: 7,
    categoriaId: 'conectores-fuerza',
    nombre: 'Conectores de Base Cuadrada, Derivadores T y Burndy',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/derivadores.jpg',
    descripcion: 'Elementos de conexión eléctrica pesada para derivación de líneas, estructuras aéreas y subestaciones.',
    medidas: 'Conector base cuadrada acero | Derivador T | Pernos doble rosca | Grapa/Base RB | Burndy',
    material: 'Acero Galvanizado / Aleación de Aluminio y Cobre'
  },
  {
    id: 8,
    categoriaId: 'conectores-fuerza',
    nombre: 'Múltiples Mecánicos de Distribución (4, 6 y 8 Vías)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/multiples-mecanicos.jpg',
    descripcion: 'Bloques conectores múltiples aislados para distribución secundaria y media tensión en registros subterráneos.',
    medidas: 'Formatos mecánicos de 4, 6 y 8 vías para amplio rango de calibres',
    material: 'Cuerpo de Aluminio Aislado con Cubierta de EPDM'
  }
]

export default function MediaTensionPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposMediaTension[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasMediaTension[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposMediaTension.find(t => t.id === tipoActivo) || tiposMediaTension[0]
  const accesoriosFiltrados = accesorios.filter(a => a.categoriaId === catAccesorioActiva)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pt-20">
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

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía Técnica de Materiales de Media Tensión
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona una familia para consultar los rangos de operación y especificaciones.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposMediaTension.map((tipo) => (
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
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider block mb-1">Función en la Red</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.uso}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Estándar y Materiales</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Elemento / Producto</th>
                  <th className="py-3.5 px-4 font-extrabold">Capacidad / Rango</th>
                  <th className="py-3.5 px-4 font-extrabold">Aplicación en Estructura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tipoSeleccionado.medidas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-900">{item.modelo}</td>
                    <td className="py-3.5 px-4 font-bold text-orange-600">{item.capacidad}</td>
                    <td className="py-3.5 px-4 text-gray-800">{item.usoComun}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETAS INTERACTIVAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Catálogo de Líneas Primarias
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Equipos de Red y Herrajes
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para consultar voltajes, materiales y tipos de montaje.
            </p>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {accesoriosFiltrados.map((item) => {
              const isFlipped = flippedCards[item.id] || false;
              return (
                <div 
                  key={item.id}
                  onClick={() => toggleFlip(item.id)}
                  className="h-[420px] w-full cursor-pointer [perspective:1000px] group"
                >
                  <div className={`relative h-full w-full rounded-2xl shadow-md transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* FRENTE OPTIMIZADO PARA IMÁGENES 1024x1024 */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-4 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full aspect-square bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-contain p-1" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center my-auto px-1">
                        <h3 className="text-base font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors line-clamp-2">
                          {item.nombre}
                        </h3>
                        <p className="text-[11px] text-gray-500 mt-1">Haz clic para ver ficha 🔄</p>
                      </div>
                    </div>

                    {/* REVERSO */}
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
                          <span className="text-[10px] uppercase text-gray-400 block">Capacidades / Voltajes:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Materiales / Normativa:</span>
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