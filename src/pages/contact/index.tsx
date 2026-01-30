import ContactForm from "../../components/contactForm";
import nuriaImg from "../../assets/nuri.png";
import bgTexture from "../../assets/Nuria-golfing.png";

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section con Imagen de Fondo Parallax o Overlay */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bgTexture})`,
            backgroundPosition: "center 20%",
          }}
        >
          <div className="absolute inset-0 bg-[#2A579E]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-header font-bold text-white mb-6 drop-shadow-md">
            Únete al Equipo
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Información y Stats (4 columnas) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Tarjeta de Información */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-[#2A579E]">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¿Por qué colaborar?
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Formar parte de mi equipo es más que un patrocinio; es una
                alianza estratégica. Juntos podemos alcanzar nuevas metas,
                llevar tu marca a los mejores campos del mundo y conectar con
                una audiencia apasionada y fiel.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-transform hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-[#2A579E]/10 rounded-full flex items-center justify-center text-[#2A579E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="2"
                        y="2"
                        width="20"
                        height="20"
                        rx="5"
                        ry="5"
                      ></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">+10k</h3>
                    <p className="text-sm text-gray-500 font-medium uppercase">
                      Seguidores en Instagram
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-transform hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-[#2A579E]/10 rounded-full flex items-center justify-center text-[#2A579E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      10 Años
                    </h3>
                    <p className="text-sm text-gray-500 font-medium uppercase">
                      Carrera Profesional
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-transform hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-[#2A579E]/10 rounded-full flex items-center justify-center text-[#2A579E]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Global</h3>
                    <p className="text-sm text-gray-500 font-medium uppercase">
                      Presencia Internacional
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-xl h-64">
              <img
                src={nuriaImg}
                alt="Nuria Iturrioz"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-6">
                <p className="text-white font-signature text-2xl">
                  Nuria Iturrioz
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario (7 columnas) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-2xl p-1 md:p-2 h-full">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
