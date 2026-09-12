'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// 1. Datos para la Guía Técnica de Control y Fuerza
const tiposControlFuerza = [
  {
    id: 'centros-breakers',
    nombre: 'Centros de Carga e Interruptores Termomagnéticos',
    uso: 'Protección contra sobrecargas y cortocircuitos en instalaciones residenciales, comerciales e industriales.',
    norma: 'Compatibilidad con montaje QD (presión), QP (enchufe) y modulares para riel DIN.',
    medidas: [
      { modelo: 'Centros de Carga (Sobreponer / Empotrar / Riel)', capacidad: '1 a 30 Circuitos (Monofásicos / Trifásicos)', usoComun: 'Distribución en tableros principales y sub-tableros' },
      { modelo: 'Interruptores QD y QP', capacidad: '15A a 100A (1, 2 y 3 Polos)', usoComun: 'Protección de circuitos de alumbrado y contactos en tablero residencial' },
      { modelo: 'Interruptores para Riel DIN', capacidad: '2A a 100A (1, 2 y 3 Polos)', usoComun: 'Protección modular en centros de carga de riel y tableros automatizados' },
      { modelo: 'Termomagnéticos Pesados (Caja Moldeada)', capacidad: '32A a 250A (Alta Capacidad Interruptiva)', usoComun: 'Protección de alimentadores principales y cargas industriales' }
    ]
  },
  {
    id: 'contactores-relevadores',
    nombre: 'Contactores, Relevadores y Guardamotores',
    uso: 'Conmutación remota de cargas, maniobra de motores y protección térmica/magnética industrial.',
    norma: 'Aislamiento hasta 600V, bobinas multivoltaje AC/DC y relevadores bimetálicos de sobrecarga.',
    medidas: [
      { modelo: 'Contactores de Potencia (2 y 3 Polos)', capacidad: '18A a 250A (Bobinas 24V, 110V, 220V, 440V)', usoComun: 'Control de motores, bancos de capacitores y alumbrado' },
      { modelo: 'Relevadores de Sobrecarga (Térmicos)', capacidad: 'Rangos acoplables a contactores de 18A a 250A', usoComun: 'Protección contra fallas de fase y sobrecorriente' },
      { modelo: 'Guardamotores y Arrancadores', capacidad: 'Ajustables para protección integral de motor', usoComun: 'Arranque directo y protección compacta DIN' }
    ]
  },
  {
    id: 'acometida-medicion',
    nombre: 'Bases Socket y Kit de Acometida',
    uso: 'Recepción de energía eléctrica desde la red de distribución e integración del medidor de consumo.',
    norma: 'Gabinete NEMA 3R para exterior, terminales de cobre de alta presión y accesorios normados CFE.',
    medidas: [
      { modelo: 'Bases Socket (4-100, 5-100, 7-200)', capacidad: '100A a 200A (4, 5 y 7 Terminales)', usoComun: 'Medición monofásica, bifásica y trifásica' },
      { modelo: 'Accesorios de Acometida', capacidad: 'Tubos de 3m a 4m, Mufas, Hubs y Reducciones', usoComun: 'Armado completo de bajada e integración de medidor' }
    ]
  }
]

// 2. Sub-Pestañas de Categorías
const categoriasControl = [
  { id: 'centros-carga', nombre: 'Centros de Carga' },
  { id: 'breakers-termos', nombre: 'Breakers e Interruptores' },
  { id: 'contactores', nombre: 'Contactores y Bobinas' },
  { id: 'relevadores', nombre: 'Relevadores Térmicos' },
  { id: 'guardamotores', nombre: 'Guardamotores y Arrancadores' },
  { id: 'acometida-base', nombre: 'Bases Medidor y Acometida' }
]

// 3. Tarjetas Interactivas de Productos
const accesorios = [
  // --- CATEGORÍA 1: CENTROS DE CARGA ---
  {
    id: 1,
    categoriaId: 'centros-carga',
    nombre: 'Centros de Carga Sobrepuestos y Empotrables',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/centro-carga.jpg',
    descripcion: 'Tableros de distribución de chapa metálica reforzada para interruptores tipo QD y QP.',
    medidas: 'Desde 1 a 8 circuitos (Sobreponer) y 8 a 30 circuitos (Empotrar Monofásicos/Trifásicos)',
    material: 'Lámina de Acero Pintura Electrostática (NEMA 1)'
  },
  {
    id: 2,
    categoriaId: 'centros-carga',
    nombre: 'Centros de Carga para Riel DIN',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/centro-riel.jpg',
    descripcion: 'Gabinete plástico o metálico con riel DIN integrado para interruptores termomagnéticos modulados.',
    medidas: '3, 4, 6, 8 y 12 circuitos',
    material: 'Termoplástico Autoextinguible / IP40'
  },

  // --- CATEGORÍA 2: BREAKERS E INTERRUPTORES (3 ÁREAS SEPARADAS) ---
  {
    id: 3,
    categoriaId: 'breakers-termos',
    nombre: 'Interruptores Termomagnéticos QD y QP',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/braker-qd-qp.jpg',
    descripcion: 'Pastillas breaker residenciales y comerciales de tipo enchufe (QP) para garras estándar o fijación por presión (QD).',
    medidas: 'QD (15A a 60A en 1P y 2P) | QP (15A a 60A en 1P; hasta 100A en 2P y 3P)',
    material: 'Fijación por Presión / Enchufe'
  },
  {
    id: 4,
    categoriaId: 'breakers-termos',
    nombre: 'Interruptores Termomagnéticos para Riel DIN',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/braker-riel.jpg',
    descripcion: 'Interruptores automáticos modulados para montaje rápido en riel DIN de 35mm en centros de carga de riel y tableros de automatización.',
    medidas: 'Capacidades de 2A a 100A (1, 2 y 3 Polos / Monofásicos y Trifásicos)',
    material: 'Montaje Estándar Riel DIN (35mm)'
  },
  {
    id: 5,
    categoriaId: 'breakers-termos',
    nombre: 'Interruptores de Caja Moldeada (Termomagnéticos Pesados)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/termo.jpg',
    descripcion: 'Interruptores de gran volumen y alta capacidad interruptiva diseñados para la protección de alimentadores principales e industrias.',
    medidas: 'Capacidades de 32A hasta 250A (2 y 3 Polos / Marcos H, J y K)',
    material: 'Alta Capacidad Interruptiva (600V AC)'
  },

  // --- CATEGORÍA 3: CONTACTORES ---
  {
    id: 6,
    categoriaId: 'contactores',
    nombre: 'Contactores de Potencia (2 y 3 Polos)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/contactor.jpg',
    descripcion: 'Dispositivos de conmutación electromagnética para encendido de motores, resistencias y alumbrado comercial.',
    medidas: 'Capacidades de 18A, 25A, 32A, 40A, 50A, 65A, 80A, 95A hasta 250A',
    material: 'Bobinas de 24V, 110V, 220V y 440V AC'
  },

  // --- CATEGORÍA 4: RELEVADORES TÉRMICOS ---
  {
    id: 7,
    categoriaId: 'relevadores',
    nombre: 'Relevadores de Sobrecarga Térmica',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/relevador.jpg',
    descripcion: 'Módulos bimetálicos de protección que se acoplan directamente a la salida del contactor contra sobrecorrientes.',
    medidas: 'Rangos de regulación equivalentes a la gama de contactores (18A a 250A)',
    material: 'Restablecimiento Manual y Automático (1NA + 1NC)'
  },

  // --- CATEGORÍA 5: GUARDAMOTORES Y ARRANCADORES ---
  {
    id: 8,
    categoriaId: 'guardamotores',
    nombre: 'Guardamotores y Arrancadores Integrales',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/guardamotor.jpg',
    descripcion: 'Protección magnetotérmica compacta para motores eléctricos en un solo cuerpo con dial de regulación de corriente.',
    medidas: 'Ajustes de disparo desde 0.1A hasta 80A (Montaje en Riel DIN)',
    material: 'Mando Por Botón o Perilla Giratoria'
  },

  // --- CATEGORÍA 6: BASES Y ACOMETIDA ---
  {
    id: 9,
    categoriaId: 'acometida-base',
    nombre: 'Bases Socket para Medidor (4, 5 y 7 Terminales)',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/socket.jpg',
    descripcion: 'Bases redondas y cuadradas para la recepción de wattthorímetros de CFE.',
    medidas: 'Base 4-100 (4 terminales 100A), Base 5-100 (5 terminales 100A) y Base 7-200 (7 terminales 200A)',
    material: 'Gabinete de Aluminio / Lámina Galvanizada NEMA 3R'
  },
  {
    id: 10,
    categoriaId: 'acometida-base',
    nombre: 'Accesorios y Kit para Bajada de Acometida',
    imagen: 'https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/accesorios-mufa.jpg',
    descripcion: 'Componentes estructurales y de canalización para armar la entrada principal de servicio eléctrico.',
    medidas: 'Tubos para acometida de 3m y 4m, Mufas de 1-1/4" a 2", Hubs roscados y Reducciones',
    material: 'Acero Galvanizado de Pared Gruesa / Aluminio'
  }
]

export default function ControlFuerzaPage() {
  const [tipoActivo, setTipoActivo] = useState(tiposControlFuerza[0].id)
  const [catAccesorioActiva, setCatAccesorioActiva] = useState(categoriasControl[0].id)
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({})

  const toggleFlip = (id: number) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tipoSeleccionado = tiposControlFuerza.find(t => t.id === tipoActivo) || tiposControlFuerza[0]
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
            Control, Fuerza y Acometidas
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mt-2">
            Centros de carga, breakers, contactores, relevadores, guardamotores, bases socket y kits de acometida.
          </p>
        </div>

        {/* MUESTRARIO DESTACADO */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          <div className="lg:col-span-5 bg-gray-50 rounded-2xl p-4 flex items-center justify-center border border-gray-200">
            <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
              <Image 
                src="https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/controles.jpg"
                alt="Muestrario de Control y Fuerza"
                fill={true}
                className="object-contain p-2"
                priority={true}
                unoptimized={true}
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Distribución y Automatización
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Protección Eléctrica, Maniobra de Motores y Medición
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Disponemos de equipos para la protección de circuitos residenciales e industriales, maniobra de potencia con contactores multivoltaje y todo lo requerido para la bajada y medición de acometidas CFE.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Gama Completa de Amperajes</h3>
                <p className="text-xs text-gray-600">Breakers QD/QP de 15A a 100A, de Riel DIN y termos hasta 250A.</p>
              </div>
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <h3 className="font-bold text-blue-900 text-sm mb-1">✓ Acometidas Normadas</h3>
                <p className="text-xs text-gray-600">Bases socket 4-100, 5-100, 7-200, mufas, tubos y hubs aprobados.</p>
              </div>
            </div>
          </div>
        </div>

        {/* TABLA GUÍA TÉCNICA */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-10 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Guía Técnica de Equipos de Control y Distribución
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Selecciona una categoría técnica para revisar rangos de capacidad y usos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            {tiposControlFuerza.map((tipo) => (
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
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1">Compatibilidad y Normativa</span>
                <p className="text-sm text-gray-800 font-medium">{tipoSeleccionado.norma}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-blue-950 text-white text-xs uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-extrabold">Equipo / Familia</th>
                  <th className="py-3.5 px-4 font-extrabold">Rangos / Capacidades</th>
                  <th className="py-3.5 px-4 font-extrabold">Aplicación Típica</th>
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
              Catálogo de Control y Fuerza
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-blue-900 mt-3">
              Equipos y Accesorios de Maniobra
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Haz clic sobre la tarjeta para consultar rangos de amperaje, bobinas y especificaciones.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {categoriasControl.map((cat) => (
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
                          <span className="text-[10px] uppercase text-gray-400 block">Capacidades / Polos:</span>
                          <span className="text-xs font-bold text-orange-400">{item.medidas}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-gray-400 block">Especificación / Voltaje:</span>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">¿Requieres arrancadores armados o tableros de control?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Cotizamos ensambles de arrancadores magnéticos a tensión plena, tableros de distribución trifásicos y paquetes de acometida completa por volumen.
          </p>
          <Link 
            href="/contacto" 
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl text-sm"
          >
            Solicitar Cotización de Control
          </Link>
        </div>

      </div>
    </div>
  )
}