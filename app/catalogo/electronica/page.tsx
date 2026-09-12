'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Electrónica y Herramientas
const tiposElectronica = [
  {
    id: 'herramientas-seguridad',
    nombre: 'Herramientas de Mano y Seguridad',
    uso: 'Instrumental para instalación eléctrica, corte de tubos, guía de cables y trabajo seguro en alturas.',
    norma: 'Aislamiento dieléctrico en mangos y arneses normados contra caídas.',
    medidas: [
      { modelo: 'Pinzas (Corte, Punta y Pela Cables)', capacidad: 'Tamaños de 6", 8" y 9" (Mangos ergonómicos)', usoComun: 'Corte y pelado de cableado de control y fuerza' },
      { modelo: 'Dobla Tubo y Corta Tubo', capacidad: 'Para tubos conduit de 1/2", 3/4" y 1"', usoComun: 'Canalización y doblado preciso de tubería' },
      { modelo: 'Guías de Jalado de Cable', capacidad: 'Longitudes de 15m, 30m y 60m (Acero / Fibra)', usoComun: 'Cableado en tuberías conduit' },
      { modelo: 'Arnés de Cuerpo Completo y Línea de Vida', capacidad: 'Soporte anticaídas industrial certificado', usoComun: 'Trabajos de instalación en alturas' }
    ]
  },
  {
    id: 'energia-pilas',
    nombre: 'Energía, Baterías e Inversores',
    uso: 'Suministro de energía portátil, conversión de DC a AC y respaldo en UPS.',
    norma: 'Baterías de libre mantenimiento y protectores contra sobrecarga.',
    medidas: [
      { modelo: 'Pilas y Baterías Especiales', capacidad: 'Cilíndricas (AA, AAA, C, D, 9V, 18650) / Botón (2032, 2025, 2450)', usoComun: 'Alimentación de controles, sensores e instrumentos' },
      { modelo: 'Baterías Selladas para UPS', capacidad: '12V 7Ah y capacidades superiores', usoComun: 'Respaldo para no-breaks, alarmas y portones' },
      { modelo: 'Inversores de Corriente (DC a AC)', capacidad: '400W, 600W, 1000W y 1500W', usoComun: 'Alimentar equipos electrodomésticos desde vehículo/batería' },
      { modelo: 'Extensiones y Barras Múltiples', capacidad: 'Calibres 14 y 12 AWG (Uso rudo / Domésticas)', usoComun: 'Distribución eléctrica portátil en hogar y taller' }
    ]
  },
  {
    id: 'smarthome-redes',
    nombre: 'Smart Home, Conectividad y Seguridad',
    uso: 'Automatización residencial, redes Wi-Fi y monitoreo por videovigilancia.',
    norma: 'Conectividad inalámbrica Wi-Fi / Zigbee y protección IP para exterior.',
    medidas: [
      { modelo: 'Dispositivos Smart (Focos, Contactos, Apagadores)', capacidad: 'Control por App y asistentes de voz (110V-120V~)', usoComun: 'Automatización del hogar y ahorro de energía' },
      { modelo: 'Cámaras de Seguridad y Timbres Smart', capacidad: 'Resolución Full HD / 4K con detección de movimiento', usoComun: 'Seguridad y monitoreo de accesos' },
      { modelo: 'Routers, Antenas y Bases de TV', capacidad: 'Banda dual Wi-Fi y soportes articulados para pantallas', usoComun: 'Conectividad de red y montaje de TV' }
    ]
  },
  {
    id: 'audio-video-cables',
    nombre: 'Audio, Video y Cables de Poder',
    uso: 'Interconexión de audio/video de alta definición y cableado de alimentación para cómputo.',
    norma: 'Conductores de cobre de alta pureza y conectores chapados en oro.',
    medidas: [
      { modelo: 'Cables A/V (HDMI, RCA, Mini Jack 3.5mm)', capacidad: '4K Ultra HD y audio estéreo de alta fidelidad', usoComun: 'Conexión de pantallas, bocinas y consolas' },
      { modelo: 'Cables de Corriente para Cómputo', capacidad: 'Tipo 8, Tipo Mickey Mouse y Cable CPU Trébol', usoComun: 'Alimentación de Laptops, PCs y monitores' },
      { modelo: 'Kits Automotrices y Portafusibles', capacidad: 'Calibres gruesos para amplificador y protección fusible', usoComun: 'Instalaciones de car audio' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasElectronica = [
  { id: 'herramientas', nombre: 'Herramientas y Seguridad' },
  { id: 'energia-baterias', nombre: 'Energía e Inversores' },
  { id: 'domotica-redes', nombre: 'Smart Home y CCTV' },
  { id: 'audio-video', nombre: 'Audio, Video y Cables' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: HERRAMIENTAS Y SEGURIDAD ---
  {
    id: 1,
    categoriaId: 'herramientas',
    nombre: 'Juegos de Pinzas, Desarmadores y Probadores',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/pinzas-desarmadores.jpg',
    descripcion: 'Pinzas de corte (6", 8", 9"), punta, pela cables, desarmadores y probadores de voltaje digitales/tipo desarmador.',
    medidas: 'Pinzas de 6" a 9" | Probadores de voltaje 12V-250V',
    material: 'Acero al Cromo Vanadio con Mangos Aislados'
  },
  {
    id: 2,
    categoriaId: 'herramientas',
    nombre: 'Dobla Tubo, Corta Tubo y Guías de Jalado',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/dobla-tubo.jpg',
    descripcion: 'Herramientas para canalización conduit de 1/2", 3/4" y 1" junto con guías de nylon y acero para jalado de cable.',
    medidas: 'Dobla tubo 1/2", 3/4", 1" | Guías de 15m, 30m y 60m',
    material: 'Aluminio Fundido y Acero Templado'
  },
  {
    id: 3,
    categoriaId: 'herramientas',
    nombre: 'Arnés de Cuerpo Completo y Línea de Vida',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/arnes-vida.jpg',
    descripcion: 'Equipo de protección personal anticaídas con puntos de anclaje dorsal y líneas de vida con amortiguador.',
    medidas: 'Ajuste universal multipunto de alta resistencia',
    material: 'Cinta de Poliéster de Alta Tenacidad y Herrajes de Acero'
  },

  // --- CATEGORÍA 2: ENERGÍA E INVERSORES ---
  {
    id: 4,
    categoriaId: 'energia-baterias',
    nombre: 'Baterías (Recargables, Botón, Alcalinas y UPS)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/baterias.jpg',
    descripcion: 'Surtido completo de baterías AAA, AA, C, D, 9V, 18650, pilas de botón (2032, 2025, 2450) y baterías de gel para UPS 12V 7Ah.',
    medidas: 'Formatos Cilíndricos, Botón y Baterías de Respaldo 12V 7Ah',
    material: 'Litio, Alcano y Plomo-Ácido Sellado'
  },
  {
    id: 5,
    categoriaId: 'energia-baterias',
    nombre: 'Inversores de Corriente (400W a 1500W)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/inversores.jpg',
    descripcion: 'Convertidores de voltaje de 12V DC a 110V AC para conectar herramientas y electrónicos desde vehículos o baterías.',
    medidas: 'Capacidades de 400W, 600W, 1000W y 1500W con salidas USB',
    material: 'Carcasa de Aluminio Anodizado con Ventilador Integrado'
  },
  {
    id: 6,
    categoriaId: 'energia-baterias',
    nombre: 'Extensiones de Uso Rudo, Regulación y UPS',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/reguladores.jpg',
    descripcion: 'Extensiones domésticas y de uso rudo (Calibres 14 y 12 AWG), reguladores de voltaje, UPS y barras multicontacto.',
    medidas: 'Extensiones de 3m a 30m (Uso Rudo Naranja / Doméstica)',
    material: 'Conductor de Cobre con Aislamiento de PVC Antiflama'
  },

  // --- CATEGORÍA 3: SMART HOME Y CCTV ---
  {
    id: 7,
    categoriaId: 'domotica-redes',
    nombre: 'Dispositivos Smart Home, Cámaras y Timbres',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/smart-home.jpg',
    descripcion: 'Focos RGB Wi-Fi, contactos e interrupción inteligente, cámaras de seguridad exterior/interior y timbres inteligentes.',
    medidas: 'Compatibles con Apps iOS/Android, Alexa y Google Home',
    material: 'Cuerpo de Policarbonato Resistente al Calor'
  },

  // --- CATEGORÍA 4: AUDIO, VIDEO Y CABLES ---
  {
    id: 8,
    categoriaId: 'audio-video',
    nombre: 'Cables A/V, Alimentación CPU y Car Audio',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/auto-audio.jpg',
    descripcion: 'Cables HDMI, RCA, Auxiliares Jack 3.5mm, cables de corriente CPU/Mickey Mouse, kit de cableado automotriz y bocinas.',
    medidas: 'Longitudes de 1.5m a 15m (HDMI Ultra HD / RCA / Interconexión)',
    material: 'Conectores Blindados con Recubrimiento Flexible'
  }
]

export default function ElectronicaPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposElectronica[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasElectronica[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposElectronica.find(t => t.id === tipoActivo) || tiposElectronica[0]
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
            Electrónica, Herramientas y Energía
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Herramientas de instalador, baterías, inversores de corriente, Smart Home, seguridad, cables A/V y extensiones.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/electronica.jpg"
                alt="Muestrario de Electrónica y Herramientas"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Soluciones Integrales y Equipamiento
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Herramental Técnico, Energía Portátil y Domótica
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Disponemos de todo lo necesario para el técnico instalador y el hogar: pinzas, dobladoras de tubo, baterías especializadas, inversores de voltaje, cámaras de videovigilancia y cableado de audio y video.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Energía e Inversores</h3>
                <p className="text-xs text-gray-600">Baterías de botón, UPS 12V y conversores de 400W a 1500W.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Smart Home y Seguridad</h3>
                <p className="text-xs text-gray-600">Focos Wi-Fi, cámaras de seguridad y accesorios de red.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía de Selección de Electrónica y Herramientas
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta especificaciones y capacidades técnicas de cada grupo de productos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposElectronica.map((tipo) => (
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
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Normativa y Estándares</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Producto / Modelo</th>
                  <th className="py-3.5 px-4 font-extrabold">Capacidad / Rangos</th>
                  <th className="py-3.5 px-4 font-extrabold">Uso Común</th>
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
              Catálogo de Especialidades
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Artículos Disponibles en Tienda
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic en la tarjeta para revisar especificaciones, materiales y opciones.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasElectronica.map((cat) => (
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
                          <span className="text-[10px] uppercase text-gray-400 block">Capacidades / Variantes:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Materiales / Especificación:</span>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Necesitas equipar a tu equipo de trabajo o surtir tu taller?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos kits completos de herramientas, baterías de respaldo, arneses de seguridad y cables de potencia al mayoreo.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Electrónica
          </Link>
        </div>

      </div>
    </div>
  )
}