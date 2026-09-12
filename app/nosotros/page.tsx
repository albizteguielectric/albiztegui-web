export default function Nosotros() {
  return (
    <div 
      className="min-h-screen py-16 bg-cover bg-center bg-fixed flex items-center"
      style={{ backgroundImage: "url('https://raw.githubusercontent.com/albizteguielectric/catalogo-electrico-imagenes/refs/heads/main/fondoWEB.jpg')" }}
    >
      {/* Cuadro blanco con sombreado */}
      <div className="max-w-4xl mx-auto px-6 py-10 sm:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 w-[90%] md:w-full">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-8 text-center">
          Sobre Albiztegui Electric
        </h1>
        
        <div className="text-lg text-gray-600 leading-relaxed space-y-6">
          <p>
            En <strong className="text-blue-900">Albiztegui Electric</strong> somos especialistas en brindar soluciones integrales para todo tipo de proyectos. Con un fuerte compromiso hacia la calidad, nos dedicamos a la venta al menudeo y mayoreo de material eléctrico.
          </p>
          <p>
            Entendemos las necesidades de los contratistas, técnicos y dueños de proyectos. Por eso, nuestro equipo cuenta con la experiencia técnica necesaria para asesorarte en la selección de materiales, asegurando que tu inversión en tubería, cableado, iluminación, y equipo de control sea siempre la más segura y eficiente.
          </p>
          
          <div className="bg-blue-50 p-8 rounded-xl border-l-4 border-orange-500 mt-12 shadow-sm">
            <h3 className="text-2xl font-bold text-blue-900 mb-3">Nuestra Filosofía</h3>
            <p className="text-blue-900/80">
              Ser el principal aliado estratégico de la industria y el público en general, ofreciendo un catálogo educativo, transparente y un servicio al cliente excepcional en nuestras sucursales. No solo vendemos materiales; aportamos energía y control a tus proyectos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}