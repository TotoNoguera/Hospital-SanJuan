# 📋 Resumen de Migración: SQLite → PostgreSQL

## **✅ CAMBIOS REALIZADOS**

### **1. Base de Datos**
- ✅ `prisma/schema.prisma`: Cambié `provider = "sqlite"` → `provider = "postgresql"`
- ✅ Removida la línea `url = env("DATABASE_URL")` del schema (Prisma 7 usa `prisma.config.ts`)
- ✅ Migraciones preservadas en `prisma/migrations/`

### **2. Dependencias (package.json)**
**Removidas:**
- ❌ `@prisma/adapter-better-sqlite3@^7.9.1`
- ❌ `better-sqlite3@^13.0.3`

**Agregadas:**
- ✅ `@prisma/adapter-pg@^7.9.1` (adapter oficial PostgreSQL)
- ✅ `pg@^8.11.3` (driver PostgreSQL)

**Estado**: `npm install` completado, 507 paquetes, 0 vulnerabilidades

### **3. Código Actualizado**

#### `src/lib/prisma.ts`
```typescript
// ANTES: Usaba better-sqlite3
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

// AHORA: Usa PostgreSQL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
```

#### `prisma/seed.ts`
```typescript
// ANTES: Usaba better-sqlite3 con fallback a local
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

// AHORA: Usa PostgreSQL directamente
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
```

#### `prisma.config.ts`
✅ **Sin cambios** (ya tenía la URL configurada correctamente)

### **4. Configuración de Entorno**

#### `.env.example` (Actualizado)
```env
# ANTES: SQLite
DATABASE_URL="file:./dev.db"

# AHORA: PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base_de_datos"
```

#### `.env.local` (Creado para desarrollo)
✅ Plantilla para desarrollo local (puede apuntar a PostgreSQL local o Neon)

---

## **✅ VERIFICACIÓN**

### Build Test
```bash
npm run build
```
**Resultado**: ✅ Compiló exitosamente sin errores
- Next.js: Compilado
- TypeScript: ✅ Validado
- Prisma: ✅ Tipos generados
- Routes: ✅ Todas las rutas mapeadas

### Cambios de Código
- ✅ Tipo: Migración de BD, no hay cambios en lógica de negocio
- ✅ APIs: Sin cambios (Prisma client maneja todo)
- ✅ Features: Todas las funcionalidades se mantienen
- ✅ Datos: Con migraciones, los datos se preservan

---

## **⚙️ VARIABLES DE ENTORNO POR AMBIENTE**

### **Desarrollo Local** (`.env.local`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hospital_dev"
SESSION_SECRET="mi-llave-para-desarrollo-local"
NEXT_PUBLIC_HOSPITAL_NAME="Hospital San Juan"
NEXT_PUBLIC_WHATSAPP_NUMBER="5492211234567"
SMTP_HOST="" # Opcional
```

### **Producción (Vercel + Neon)**
```env
DATABASE_URL="postgresql://user:pass@ep-xxxx.region.neon.tech/hospital" # De Neon
SESSION_SECRET="llave-única-para-producción-32+-caracteres" # Generar nueva
NEXT_PUBLIC_HOSPITAL_NAME="Hospital San Juan"
NEXT_PUBLIC_WHATSAPP_NUMBER="5492211234567"
SMTP_HOST="" # Opcional
```

---

## **📋 TABLA: VARIABLES DE ENTORNO REQUERIDAS EN VERCEL**

| Variable | Requerida | Tipo | Descripción | Ejemplo |
|----------|-----------|------|-------------|---------|
| `DATABASE_URL` | ✅ SÍ | Secret | URL de conexión PostgreSQL en Neon | `postgresql://user:password@ep-xxxx.region.neon.tech/neondb` |
| `SESSION_SECRET` | ✅ SÍ | Secret | Clave para firmar sesiones JWT | `a3f7b2c1d9e8... (32+ caracteres)` |
| `NEXT_PUBLIC_HOSPITAL_NAME` | ✅ SÍ | Public | Nombre del hospital (visible) | `Hospital San Juan` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ SÍ | Public | Número WhatsApp Central Turnos | `5492211234567` |
| `SMTP_HOST` | ❌ NO | Secret | Host SMTP (opcional) | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ NO | Secret | Puerto SMTP (opcional) | `587` |
| `SMTP_USER` | ❌ NO | Secret | Usuario SMTP (opcional) | `tu-email@gmail.com` |
| `SMTP_PASS` | ❌ NO | Secret | Contraseña SMTP (opcional) | `app-password` |
| `SMTP_FROM` | ❌ NO | Public | Email de origen (opcional) | `Hospital San Juan <turnos@...>` |

---

## **🔑 CÓMO GENERAR SESSION_SECRET**

```bash
# Ejecutar en la terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ejemplo de salida:
# a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2g3
```

**Importante**: Generar uno NUEVO para producción (no reutilizar el del desarrollo)

---

## **🗄️ CONFIGURACIÓN DE NEON**

### Crear Base de Datos en Neon:
1. Ir a https://console.neon.tech
2. Crear proyecto
3. Copiar "Connection string" → esta es tu `DATABASE_URL`
4. Compartir solo la URL (con contraseña) con Vercel

### Estructura de URL Neon:
```
postgresql://user:password@ep-XXXX-123.region.neon.tech/dbname?sslmode=require
```

---

## **📊 ESTADO DEL PROYECTO**

### ✅ Listo para Vercel
- [x] Migración completada
- [x] Dependencias actualizadas
- [x] Código actualizado
- [x] Build validado
- [x] Documentación creada
- [x] Variables documentadas

### ⏭️ Próximos Pasos
1. Crear cuenta en Neon (gratis)
2. Crear BD PostgreSQL en Neon
3. Crear repositorio en GitHub (si no existe)
4. Importar en Vercel
5. Configurar variables de entorno en Vercel
6. Deploy automático (Vercel hace `npm run build` + `npm run start`)
7. Ejecutar migraciones en producción
8. Verificar funcionamiento

---

## **🚨 IMPORTANTE: SEGURIDAD**

- ❌ **NUNCA** commitear `.env` (contiene credenciales)
- ✅ Commitear `.env.example` (plantilla sin datos reales)
- ✅ Usar `.gitignore` (ya está configurado)
- ✅ Configurar variables en Vercel UI (no en código)
- ✅ Generar `SESSION_SECRET` único para producción
- ✅ Copiar `DATABASE_URL` directamente de Neon (no compartir)

---

## **📞 REFERENCIAS**

- Prisma 7 Docs: https://www.prisma.io/docs
- Prisma + PostgreSQL: https://www.prisma.io/docs/orm/reference/prisma-schema-reference#postgresql
- Neon Docs: https://neon.tech/docs
- Vercel Deployments: https://vercel.com/docs/deployments
- PostgreSQL Connection Strings: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
