export default function Sucursales() {
  const tiendas = [
    {
      nombre: "Sucursal Macro Plaza",
      direccion: "C. Galena #102 Col. Centro, Nuevo Casas Grandes, Chih.",
      horario: "Lunes a Viernes: 8:00 AM - 6:30 PM | Sábados: 8:00 AM - 5:00 PM",
      telefono: "(636) 694-1818 | (636) 694-1828",
      mapa: "https://maps.app.goo.gl/wVdZXNAGxYe5brrg9" // Aquí pegarás el enlace que te da Google Maps al darle en "Compartir"
    },
    {
      nombre: "Sucursal Tec",
      direccion: "Av. Tecnólogico #3908 Col. Acción Popular, Nuevo Casas Grandes, Chih.",
      horario: "Lunes a Viernes: 8:00 AM - 6:30 PM | Sábados: 8:00 AM - 5:00 PM",
      telefono: "636-699-8367 | 636-117-0380",
      mapa: "https://maps.app.goo.gl/FNGTsReJwiZ3z1fR9" 
    },
     {
      nombre: "Matriz",
      direccion: "Av Benito Juarez #722-A Col. Centro, Nuevo Casas Grandes, Chih.",
      horario: "Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 1:00 PM",
      telefono: "(636) 694-1870",
      mapa: "https://maps.app.goo.gl/w86HGsVVyZYZRfKZ6" // Aquí pegarás el enlace que te da Google Maps al darle en "Compartir"
    },
  ];

  return (
    <div 
      className="min-h-screen py-16 bg-cover bg-bottom bg-fixed"
      style={{ backgroundImage: "url('https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondoWEB.jpg')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado con recuadro blanco translúcido para mejor lectura */}
        <div className="text-center mb-12 bg-white/90 max-w-2xl mx-auto p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-4">Nuestras Sucursales</h1>
          <p className="text-lg text-blue-900/80 font-medium">
            Visítanos en nuestras dos ubicaciones o solicita cotización para envíos por mayoreo.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tiendas.map((tienda, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">{tienda.nombre}</h2>
              <p className="text-gray-600 mb-2"><strong className="text-blue-900">Dirección:</strong> {tienda.direccion}</p>
              <p className="text-gray-600 mb-2"><strong className="text-blue-900">Horario:</strong> {tienda.horario}</p>
              <p className="text-gray-600 mb-8"><strong className="text-blue-900">Teléfono:</strong> {tienda.telefono}</p>
              <a 
                href={tienda.mapa} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-900 text-white font-semibold px-6 py-2 rounded-md hover:bg-orange-500 transition-colors shadow-sm"
              >
                Ver en Google Maps
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}