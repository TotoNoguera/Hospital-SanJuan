import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GENERAL_PHONE = "(0221) 457 5454";

// Datos reales provistos por el usuario (planilla "Turnos San Juan"). Se cargan tal
// cual: la mayoría requiere orden médica / es presencial / se coordina por WhatsApp o
// email — por eso son ASSISTED y no tienen profesionales ni calendario propio.
const assistedSpecialties = [
  {
    name: "Broncoscopía",
    icon: "wind",
    howToBook:
      "Con orden médica. Presencial en el servicio y por correo electrónico a broncosjdios@gmail.com",
    days: "Lunes a viernes",
    hours: "8:30 a 11:30 hs",
    contactExtension: "120",
    contactEmail: "broncosjdios@gmail.com",
  },
  {
    name: "Dermatología",
    icon: "sparkles",
    howToBook: "Presencial en el servicio",
    days: "Lunes a miércoles y viernes",
    hours: "7:30 a 12:00 hs",
    contactExtension: "141",
  },
  {
    name: "Diagnóstico por Imágenes",
    icon: "scan",
    howToBook: "Con orden médica. Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "7:00 a 12:00 hs",
    contactExtension: "116 o 219",
  },
  {
    name: "Enfermedades Poco Frecuentes",
    icon: "dna",
    howToBook: null,
    days: null,
    hours: null,
  },
  {
    name: "Fonoaudiología",
    icon: "ear",
    howToBook: "Presencial en el servicio",
    days: "Lunes, miércoles y viernes",
    hours: "8:00 a 10:00 hs",
    contactExtension: "122",
  },
  {
    name: "Hematología",
    icon: "droplet",
    howToBook: "Con orden médica. Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "7:00 a 9:00 hs",
    contactExtension: "217",
  },
  {
    name: "Hemodinamia",
    icon: "activity",
    howToBook:
      "Con orden médica. Presencial en el servicio y por correo electrónico a turnoshemodinamiasanjuan@gmail.com",
    days: "Lunes a viernes",
    hours: "8:00 a 13:00 hs",
    contactExtension: "210",
    contactEmail: "turnoshemodinamiasanjuan@gmail.com",
  },
  {
    name: "Laboratorio Central",
    icon: "flask-conical",
    howToBook: "Con orden médica del hospital o centros de salud cercanos. Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "7:00 a 12:00 hs",
  },
  {
    name: "Medicina Nuclear",
    icon: "radiation",
    howToBook:
      "Con orden médica. Por WhatsApp (0221) 6050804 y por correo electrónico a medicinanuclearsjdios@gmail.com",
    days: "Lunes a viernes",
    hours: "7:00 a 12:00 hs",
    contactExtension: "117",
    contactEmail: "medicinanuclearsjdios@gmail.com",
    contactWhatsapp: "5492216050804",
  },
  {
    name: "Microbiología",
    icon: "microscope",
    howToBook: "Con orden médica. Presencial en el servicio",
    days: "Lunes a viernes y sábados",
    hours: "8:00 a 15:00 hs",
  },
  {
    name: "Nutrición",
    icon: "apple",
    howToBook: "Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "8:00 a 12:00 hs y 14:00 a 16:00 hs",
  },
  {
    name: "Otorrinolaringología",
    icon: "ear",
    howToBook: "Presencial en el servicio",
    days: "Lunes, miércoles y viernes",
    hours: "8:00 a 10:00 hs",
    contactExtension: "122",
  },
  {
    name: "Servicio Social",
    icon: "hand-heart",
    howToBook: "Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "8:00 a 13:00 hs",
  },
  {
    name: "Virología",
    icon: "shield",
    howToBook: "Con orden médica del hospital o centros de salud cercanos. Presencial en el servicio",
    days: "Lunes a viernes",
    hours: "7:00 a 12:00 hs",
  },
] as const;

// Especialidades inventadas (típicas de un hospital general) donde SÍ tiene sentido
// ofrecer reserva online con calendario real, para poder demostrar el flujo completo.
const onlineSpecialties = [
  {
    name: "Clínica Médica",
    icon: "stethoscope",
    doctors: [
      {
        name: "Dra. Marina Ibáñez",
        bio: "Especialista en Clínica Médica, más de 15 años de trayectoria.",
        availability: [
          { weekday: 1, startTime: "08:00", endTime: "13:00" },
          { weekday: 3, startTime: "08:00", endTime: "13:00" },
          { weekday: 5, startTime: "08:00", endTime: "12:00" },
        ],
      },
      {
        name: "Dr. Ezequiel Farías",
        bio: "Clínica Médica y control de pacientes crónicos.",
        availability: [
          { weekday: 2, startTime: "14:00", endTime: "19:00" },
          { weekday: 4, startTime: "14:00", endTime: "19:00" },
        ],
      },
    ],
  },
  {
    name: "Pediatría",
    icon: "baby",
    doctors: [
      {
        name: "Dra. Lucía Gómez",
        bio: "Pediatra, seguimiento de niños de 0 a 12 años.",
        availability: [
          { weekday: 1, startTime: "09:00", endTime: "13:00" },
          { weekday: 3, startTime: "09:00", endTime: "13:00" },
          { weekday: 5, startTime: "09:00", endTime: "13:00" },
        ],
      },
      {
        name: "Dr. Tomás Alegre",
        bio: "Pediatría general y neonatología.",
        availability: [
          { weekday: 2, startTime: "14:00", endTime: "18:00" },
          { weekday: 4, startTime: "14:00", endTime: "18:00" },
        ],
      },
    ],
  },
  {
    name: "Cardiología",
    icon: "heart-pulse",
    doctors: [
      {
        name: "Dr. Nicolás Pereyra",
        bio: "Cardiología clínica y ergometrías.",
        availability: [
          { weekday: 2, startTime: "08:00", endTime: "12:00" },
          { weekday: 4, startTime: "08:00", endTime: "12:00" },
        ],
      },
    ],
  },
  {
    name: "Ginecología",
    icon: "flower",
    doctors: [
      {
        name: "Dra. Valentina Suárez",
        bio: "Ginecología y control ginecológico anual.",
        availability: [
          { weekday: 1, startTime: "13:00", endTime: "17:00" },
          { weekday: 3, startTime: "13:00", endTime: "17:00" },
        ],
      },
    ],
  },
  {
    name: "Traumatología",
    icon: "bone",
    doctors: [
      {
        name: "Dr. Gonzalo Medina",
        bio: "Traumatología y ortopedia.",
        availability: [
          { weekday: 1, startTime: "08:00", endTime: "12:00" },
          { weekday: 5, startTime: "08:00", endTime: "12:00" },
        ],
      },
    ],
  },
  {
    name: "Kinesiología",
    icon: "dumbbell",
    doctors: [
      {
        name: "Lic. Rocío Benítez",
        bio: "Kinesiología y rehabilitación motora.",
        availability: [
          { weekday: 2, startTime: "09:00", endTime: "13:00" },
          { weekday: 4, startTime: "09:00", endTime: "13:00" },
        ],
      },
    ],
  },
] as const;

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.staffUser.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.patient.deleteMany();

  let order = 0;

  for (const s of assistedSpecialties) {
    order += 1;
    await prisma.specialty.create({
      data: {
        name: s.name,
        slug: slugify(s.name),
        icon: s.icon,
        order,
        bookingMode: "ASSISTED",
        howToBook: s.howToBook ?? undefined,
        days: s.days ?? undefined,
        hours: s.hours ?? undefined,
        requiresMedicalOrder: Boolean(s.howToBook?.toLowerCase().includes("orden médica")),
        contactPhone: GENERAL_PHONE,
        contactExtension: "contactExtension" in s ? s.contactExtension : undefined,
        contactEmail: "contactEmail" in s ? s.contactEmail : undefined,
        contactWhatsapp: "contactWhatsapp" in s ? s.contactWhatsapp : undefined,
      },
    });
  }

  let firstOnlineDoctorId: string | null = null;

  for (const s of onlineSpecialties) {
    order += 1;
    const specialty = await prisma.specialty.create({
      data: {
        name: s.name,
        slug: slugify(s.name),
        icon: s.icon,
        order,
        bookingMode: "ONLINE",
      },
    });

    for (const d of s.doctors) {
      const doctor = await prisma.doctor.create({
        data: {
          name: d.name,
          bio: d.bio,
          specialtyId: specialty.id,
          availability: {
            create: d.availability.map((a) => ({
              weekday: a.weekday,
              startTime: a.startTime,
              endTime: a.endTime,
              slotMinutes: 20,
            })),
          },
        },
      });
      if (!firstOnlineDoctorId) firstOnlineDoctorId = doctor.id;
    }
  }

  const staffAccounts = [
    {
      name: "Administración San Juan",
      email: "admin@hospitalsanjuan.example",
      password: "Admin123!",
      role: "ADMIN" as const,
    },
    {
      name: "Secretaría de Turnos",
      email: "secretaria@hospitalsanjuan.example",
      password: "Secretaria123!",
      role: "SECRETARY" as const,
    },
    {
      name: "Dra. Marina Ibáñez",
      email: "doctora@hospitalsanjuan.example",
      password: "Doctora123!",
      role: "DOCTOR" as const,
      doctorId: firstOnlineDoctorId,
    },
  ];

  for (const s of staffAccounts) {
    await prisma.staffUser.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: hashPassword(s.password),
        role: s.role,
        doctorId: "doctorId" in s ? s.doctorId : undefined,
      },
    });
  }

  await prisma.patient.create({
    data: {
      name: "Paciente de Prueba",
      dni: "30123456",
      email: "paciente@hospitalsanjuan.example",
      phone: "2211234567",
      passwordHash: hashPassword("Paciente123!"),
    },
  });

  console.log("Seed completo:");
  console.log(`  Especialidades ASSISTED: ${assistedSpecialties.length}`);
  console.log(`  Especialidades ONLINE: ${onlineSpecialties.length}`);
  console.log("  Credenciales de staff:");
  for (const s of staffAccounts) {
    console.log(`    ${s.role.padEnd(10)} ${s.email} / ${s.password}`);
  }
  console.log("  Paciente demo: paciente@hospitalsanjuan.example / Paciente123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
