import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    contactType: "",
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    contactType: "",
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [generalError, setGeneralError] = useState("");

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    if (name === "email") {
      if (!value) {
        errorMsg = "El correo electrónico es obligatorio";
      } else if (!validateEmail(value)) {
        errorMsg = "Por favor, introduce un correo electrónico válido";
      }
    } else if (name === "name") {
      if (!value.trim()) {
        errorMsg = "El nombre es obligatorio";
      }
    } else if (name === "contactType") {
      if (!value) {
        errorMsg = "Debes seleccionar un motivo de contacto";
      }
    }
    return errorMsg;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const newErrors = {
      contactType: validateField("contactType", formData.contactType),
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      message: "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err !== "")) {
      setGeneralError(
        "Por favor, corrige los errores marcados antes de enviar.",
      );
      return;
    }

    setGeneralError("");
    setStatus("submitting");

    // Send email using EmailJS
    try {
      await emailjs.send(
        "service_uqe39ik",
        "template_5nqszc9",
        {
          from_name: formData.name,
          from_email: formData.email,
          contact_type: formData.contactType,
          message: formData.message,
        },
        "mIzxSsy4oAw6-JJXk",
      );

      setStatus("success");
      setFormData({ contactType: "", name: "", email: "", message: "" });

      // Reset status after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto h-full bg-white rounded-2xl overflow-hidden">
      <div className="p-8 md:p-12">
        <h2 className="text-3xl font-header font-bold text-[#2A579E] mb-2 text-center">
          Envíame un mensaje
        </h2>
        <p className="text-gray-500 text-center mb-10 max-w-lg mx-auto">
          Rellena el formulario a continuación y me pondré en contacto contigo
          lo antes posible.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Type */}
          <div className="relative">
            <label
              htmlFor="contactType"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Motivo del contacto <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <select
                id="contactType"
                name="contactType"
                value={formData.contactType}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full pl-12 pr-10 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all appearance-none cursor-pointer hover:bg-gray-100 focus:bg-white text-gray-700 ${
                  errors.contactType
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-gray-200 focus:ring-[#2A579E]/20 focus:border-[#2A579E]"
                }`}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                <option value="sponsor">Patrocinio / Sponsor</option>
                <option value="press">Prensa / Medios</option>
                <option value="fan">Fan / Seguidor</option>
                <option value="other">Otro</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {errors.contactType && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.contactType}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tu nombre"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all placeholder-gray-400 hover:bg-gray-100 focus:bg-white ${
                    errors.name
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-[#2A579E]/20 focus:border-[#2A579E]"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ejemplo@correo.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all placeholder-gray-400 hover:bg-gray-100 focus:bg-white ${
                    errors.email
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-[#2A579E]/20 focus:border-[#2A579E]"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Tu mensaje{" "}
              <span className="text-gray-400 font-normal ml-1 text-xs">
                (Opcional)
              </span>
            </label>
            <div className="relative">
              <div className="absolute top-4 left-4 pointer-events-none text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="¿En qué puedo ayudarte?"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2A579E]/20 focus:border-[#2A579E] outline-none transition-all placeholder-gray-400 hover:bg-gray-100 focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className={`w-full py-4 px-6 bg-[#2A579E] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:bg-[#1e4075] transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-[#2A579E]/30 ${
              status === "submitting"
                ? "opacity-80 cursor-not-allowed transform-none"
                : ""
            }`}
          >
            {status === "submitting" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                Enviar mensaje
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>

          {/* General Error Message */}
          {generalError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="font-medium text-sm">{generalError}</p>
            </div>
          )}

          {/* Status Messages */}
          {status === "success" && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">
                ¡Mensaje enviado correctamente! Gracias por contactar.
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium">
                Hubo un error al enviar el mensaje. Por favor, inténtalo de
                nuevo.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
