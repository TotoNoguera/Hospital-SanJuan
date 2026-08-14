// Datos generales del hospital. Editar acá para actualizar la web entera.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_HOSPITAL_NAME || "Hospital San Juan",
  tagline: "Salud pública de calidad para La Plata y la región",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  address: "Calle 41 N.º 1330 e/ 15 y 16, La Plata, Buenos Aires",
  generalPhone: "(0221) 457 5454",
  emergencyPhone: "(0221) 457 5455",
  hours: [
    { label: "Atención administrativa", value: "Lunes a viernes de 7:00 a 20:00 hs" },
    { label: "Guardia", value: "Las 24 horas, todos los días" },
  ],
};
