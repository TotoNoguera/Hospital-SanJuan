# 🚀 Guía de Deployment en Vercel + Neon PostgreSQL

Este documento explica cómo deployar **Hospital San Juan** en Vercel usando PostgreSQL en Neon.

---

## **PASO 1: Crear base de datos en Neon**

### ¿Qué es Neon?
Neon es un servicio PostgreSQL serverless que funciona perfectamente con Vercel. Es gratis para desarrollo.

### Pasos:
1. Ir a https://console.neon.tech (gratis)
2. Registrarse / Iniciar sesión
3. Crear un nuevo proyecto (o usar uno existente)
4. Copiar la **Connection String** en formato:
   ```
   postgresql://user:password@ep-xxxx.region.neon.tech/dbname
   ```
5. **Importante**: Guarda esta URL en un lugar seguro (no la compartas)

---

## **PASO 2: Preparar el proyecto local**

### Ya está hecho en este proyecto:
✅ Schema Prisma migrado a PostgreSQL  
✅ Adapter `@prisma/adapter-pg` instalado  
✅ Variables de entorno configuradas  
✅ Migraciones listas  

### Verificar:
```bash
cd "C:\Users\tomas\Downloads\H S J\HospitalSanJuan"
npm run build  # Debe compilar sin errores
```

---

## **PASO 3: Configurar en Vercel**

### 3.1 - Conectar tu repositorio Git
1. Ir a https://vercel.com/dashboard
2. Hacer click en "Add New..." → "Project"
3. Seleccionar tu repositorio de GitHub (debe estar en Git)
4. Importar el proyecto

### 3.2 - Configurar Variables de Entorno
Después de importar, ir a **Project Settings → Environment Variables** y agregar:

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `DATABASE_URL` | URL de Neon | `postgresql://user:pass@ep-xxxx.region.neon.tech/hospital` |
| `SESSION_SECRET` | Clave aleatoria nueva (32+ chars) | `abc123def456...` |
| `NEXT_PUBLIC_HOSPITAL_NAME` | Nombre del hospital | `Hospital San Juan` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp | `5492211234567` |
| `SMTP_HOST` | (Opcional) Host del email | `` |
| `SMTP_PORT` | (Opcional) Puerto del email | `587` |
| `SMTP_USER` | (Opcional) Usuario email | `` |
| `SMTP_PASS` | (Opcional) Contraseña email | `` |
| `SMTP_FROM` | (Opcional) Email de origen | `` |

---

## **PASO 4: Build y Deploy**

### Configurar Build Settings (si es necesario):

En **Project Settings → Build & Development Settings**:

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Node.js Version**: 20.x (default)

### Deploy:
1. Hacer push a tu rama `main` / `master`
2. Vercel detecta automáticamente los cambios
3. Ejecuta el build y deployea

**Alternativa manual:**
```bash
npx vercel deploy --prod
```

---

## **PASO 5: Ejecutar migraciones en Vercel**

### Opción A: Automática (Recomendada)
Vercel ejecutará automáticamente cualquier migración de Prisma si está configurada en los scripts.

### Opción B: Manual (si es necesario)
1. Conectar a Vercel CLI:
   ```bash
   npm install -g vercel
   vercel env pull  # Descarga .env de Vercel
   ```

2. Ejecutar migraciones localmente con la BD de Vercel:
   ```bash
   npx prisma migrate deploy
   ```

3. O ejecutar el seed:
   ```bash
   npm run db:seed
   ```

---

## **PASO 6: Verificar que todo funcione**

1. Ir a tu URL de Vercel (ej: `hospital-san-juan.vercel.app`)
2. Probar:
   - ✅ Landing page carga
   - ✅ Login de pacientes funciona
   - ✅ Login de admin funciona
   - ✅ Reserva de turnos funciona
   - ✅ Admin panel funciona

---

## **VARIABLES DE ENTORNO EXPLICADAS**

### **DATABASE_URL** (OBLIGATORIA)
- Formato: `postgresql://user:password@host:port/database`
- Ejemplos:
  - Neon: `postgresql://user:pass@ep-xxxx.us-east-1.neon.tech/neondb`
  - Vercel Postgres: `postgres://default:password@ep-xxxx.vercel-storage.com:5432/verceldb`
  - Railway: `postgresql://user:pass@containers-us-west-12.railway.app:5432/railway`

### **SESSION_SECRET** (OBLIGATORIA)
- Clave para firmar cookies de sesión
- **Debe ser única** para producción
- Generar con: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Mínimo 32 caracteres

### **NEXT_PUBLIC_*** (Públicas)
- Visibles en el navegador
- Úsalas para data no sensible (nombres, números de teléfono públicos)

### **SMTP_*** (Opcionales)
- Solo si quieres enviar emails de confirmación
- Si están vacías, el sistema solo usará WhatsApp
- Proveedores: SendGrid, Mailgun, Gmail SMTP, etc.

---

## **ESTRUCTURA DE ARCHIVOS IMPORTANTE**

```
hospital-san-juan/
├── .env                    ← ❌ NO commitear (git ignore)
├── .env.local              ← ❌ NO commitear (desarrollo local)
├── .env.example            ← ✅ COMMITEAR (plantilla pública)
├── prisma/
│   ├── schema.prisma       ← PostgreSQL (migrado)
│   ├── migrations/         ← ✅ COMMITEAR (historial de BD)
│   └── seed.ts             ← ✅ COMMITEAR (datos iniciales)
├── src/
│   ├── lib/prisma.ts       ← PostgreSQL adapter (actualizado)
│   └── ...
└── package.json            ← ✅ COMMITEAR (con nuevas deps)
```

---

## **CHECKLIST DE DEPLOYMENT**

- [ ] Base de datos Neon creada y URL guardada
- [ ] Variables de entorno configuradas en Vercel
- [ ] `DATABASE_URL` apunta a Neon
- [ ] `SESSION_SECRET` es único (no el de desarrollo)
- [ ] Repositorio está en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Build completa sin errores (`npm run build`)
- [ ] Deploy automático o manual realizado
- [ ] Migraciones ejecutadas (`npx prisma migrate deploy`)
- [ ] Seed ejecutado (`npm run db:seed`) - opcional
- [ ] Sitio en vivo accesible
- [ ] Testing básico realizado (login, turnos, admin)

---

## **SOLUCIÓN DE PROBLEMAS**

### ❌ Error: "DATABASE_URL is not set"
**Solución**: Ir a Vercel → Project Settings → Environment Variables → Agregar `DATABASE_URL`

### ❌ Error: "Connection refused"
**Solución**: Asegurar que la URL de Neon es correcta. Copiar de Neon console → Connection string.

### ❌ Error: "P1000 Authentication failed"
**Solución**: La contraseña en la URL es incorrecta. Regenerar en Neon.

### ❌ Migraciones no se ejecutan automáticamente
**Solución**: Correr manualmente:
```bash
vercel env pull
npx prisma migrate deploy
```

### ❌ Datos antiguos no aparecen en producción
**Solución**: Ejecutar seed:
```bash
vercel env pull
npm run db:seed
```

---

## **SIGUIENTE: CONFIGURACIÓN AVANZADA**

- [ ] Configurar backups automáticos en Neon
- [ ] Agregar monitoreo de errores (Sentry, LogRocket)
- [ ] Configurar custom domain
- [ ] Configurar emails (SMTP)
- [ ] Configurar CI/CD con GitHub Actions

---

**¿Preguntas? Revisa la [documentación de Vercel](https://vercel.com/docs) y [Neon](https://neon.tech/docs).**
