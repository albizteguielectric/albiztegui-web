'use client'

import { useState } from 'react'
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
  { id: 'fuerza-acometida', nombre: 'Fuerza y Acometida' },
  { id: 'automotriz-especial', nombre: 'Automotriz y Solar' },
  { id: 'rudo-duplex-romex', nombre: 'Uso Rudo, Dúplex y Romex' },
  { id: 'redes-audio', nombre: 'Redes Ethernet y Bocina' }
]

// 3. Tarjetas Interactivas
const accesorios = [
  // --- FUERZA Y ACOMETIDA ---
  {
    id: 1,
    categoriaId: 'fuerza-acometida',
    nombre: 'Cable THHW-LS Cobre (Cal. 16 al 8)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable.jpg',
    descripcion: 'Conductor monofilular o multihilo de cobre para circuitos derivados de alumbrado y contactos.',
    medidas: 'Calibres 16, 14, 12, 10 y 8 AWG (Negro, Rojo, Blanco, Verde)',
    material: 'Carrete de 500 mts / Caja de 100 mts'
  },
  {
    id: 2,
    categoriaId: 'fuerza-acometida',
    nombre: 'Cable THHW Cobre Grueso (Cal. 1/0 a 4/0)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-10.jpg',
    descripcion: 'Cable de cobre de gran calibre para alimentadores principales e hilos de tableros industriales.',
    medidas: 'Calibres 1/0, 2/0, 3/0 y 4/0 AWG (Color Negro)',
    material: 'Venta por Metro'
  },
  {
    id: 3,
    categoriaId: 'fuerza-acometida',
    nombre: 'Cable de Aluminio Acometida (Aéreo / Subterráneo)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-aluminio.jpg',
    descripcion: 'Conductor de aluminio neutro portante o subterráneo para bajadas de medidor y redes de distribución.',
    medidas: 'Calibres 6 al 1/0 (Monopolar, Duplex 1+1, Triplex 2+1)',
    material: 'Venta por Metro'
  },

  // --- AUTOMOTRIZ Y SOLAR ---
  {
    id: 4,
    categoriaId: 'automotriz-especial',
    nombre: 'Cable Automotriz GPT',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-aut.jpg',
    descripcion: 'Cable flexible de cobre suave especial para arneses vehiculares y baja tensión automotriz.',
    medidas: 'Calibres 18, 16, 14, 12 y 10 AWG (Surtido de colores)',
    material: 'Bolsa con Rollo de 100 mts'
  },
  {
    id: 5,
    categoriaId: 'automotriz-especial',
    nombre: 'Cable Fotovoltaico Solar (Cal. 10)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-foto.jpg',
    descripcion: 'Conductor de cobre estañado altamente resistente a intemperie, ozono y radiación UV para paneles solares.',
    medidas: 'Calibre 10 AWG (Colores Rojo y Negro / 1000V DC)',
    material: 'Venta por Metro'
  },
  {
    id: 6,
    categoriaId: 'automotriz-especial',
    nombre: 'Cable Portaelectrodo (Soldadora)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-porta.jpg',
    descripcion: 'Conductor extra-flexible para alimentación de pinza y masa en máquinas de soldar.',
    medidas: 'Calibres 8, 6, 4, 2, 1/0, 2/0 y 3/0 AWG (Rojo y Negro)',
    material: 'Venta por Metro'
  },

  // --- USO RUDO, DÚPLEX Y ROMEX ---
  {
    id: 7,
    categoriaId: 'rudo-duplex-romex',
    nombre: 'Cable Uso Rudo (2, 3 y 4 Conductores)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-usorudo.jpg',
    descripcion: 'Cable multiconductor flexible cubierto de neopreno/PVC resistente a aceite y abrasión.',
    medidas: 'Desde 2x18, 3x18, 4x18 hasta 2x6, 3x6 y 4x6 AWG',
    material: 'Venta por Metro'
  },
  {
    id: 8,
    categoriaId: 'rudo-duplex-romex',
    nombre: 'Cable Dúplex (POT)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-pot.jpg',
    descripcion: 'Dos conductores paralelos unirlos con cubierta blanca o gris para instalaciones portátiles y extensiones.',
    medidas: 'Calibres 18, 16, 14, 12 y 10 AWG',
    material: 'Carrete de 500 mts / Caja de 100 mts'
  },
  {
    id: 9,
    categoriaId: 'rudo-duplex-romex',
    nombre: 'Cable Romex Plano',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-romex.jpg',
    descripcion: 'Conductores con forro exterior plano autoextinguible con hilo de tierra desnudo integrado.',
    medidas: '2x14, 2x12, 2x10, 3x14, 3x12 y 3x10 AWG',
    material: 'Rollo de 100 mts'
  },

  // --- REDES Y AUDIO ---
  {
    id: 10,
    categoriaId: 'redes-audio',
    nombre: 'Cable Ethernet UTP (Interior / Exterior)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-red.jpg',
    descripcion: 'Cable de pares trenzados para voz, datos y redes de red. Opción para exterior con doble chaqueta contra radiación solar.',
    medidas: 'Interior (Cat 5e / Cat 6) y Exterior (Cat 6 CMX)',
    material: 'Por Metro o Caja de 305 mts'
  },
  {
    id: 11,
    categoriaId: 'redes-audio',
    nombre: 'Cable para Bocina / Audio (Bicolor)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/cable-bocina.jpg',
    descripcion: 'Cable dúplex polarizado para sistemas de sonido, altavoces, perifoneo y sonorización.',
    medidas: 'Calibres 22, 18 y 14 AWG (Polarizado / Bicolor)',
    material: 'Rollo de 100 mts'
  }
]

export default function CableadoPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposCableado[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasCableado[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposCableado.find(t => t.id === tipoActivo) || tiposCableado[0]
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

        {/* TARJETAS INTERACTIVAS SUB-FILTRADAS */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Variedad de Conductores
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Gama Completa de Cables
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para revisar detalles del empaque y calibres disponibles.
            </p>
          </div>

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
                    
                    {/* FRENTE */}
                    <div className="absolute inset-0 h-full w-full rounded-2xl bg-white p-6 border border-gray-200 [backface-visibility:hidden] flex flex-col items-center justify-between">
                      <div className="w-full h-40 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
                        <Image 
                          src={item.imagen} 
                          alt={item.nombre} 
                          fill={true} 
                          className="object-cover w-full h-full" 
                          unoptimized={true}
                        />
                      </div>
                      <div className="text-center mt-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-blue-900 group-hover:text-orange-500 transition-colors">
                          {item.nombre}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Haz clic para ver ficha 🔄</p>
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
                          <span className="text-[10px] uppercase text-gray-400 block">Calibres / Colores:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Presentación:</span>
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