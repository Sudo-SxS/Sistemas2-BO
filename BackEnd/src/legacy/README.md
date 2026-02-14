# 📁 Directorio Legacy - Código Histórico

## 📖 Propósito

Este directorio contiene código legacy de la migración de MySQL a PostgreSQL, mantenido para fines de **referencia histórica** y **documentación**.

## ⚠️ ADVERTENCIA IMPORTANTE

**NO UTILIZAR ESTE CÓDIGO EN PRODUCCIÓN**

- Este código es **obsoleto** y no está mantenido
- Puede contener **errores conocidos** de la versión anterior
- No tiene **actualizaciones de seguridad** recientes
- No está **optimizado** para la arquitectura actual

## 📂 Estructura

```
src/legacy/
├── database/          # Conexiones legacy de MySQL
└── models/            # Modelos de datos de MySQL
```

## 🔧 Uso Apropiado

### ✅ Cuándo usar este directorio:

1. **Referencia de arquitectura**: Para entender cómo funcionaba el sistema anterior
2. **Depuración**: Para comparar comportamientos entre versiones
3. **Migración de datos**: Si necesitas migrar datos específicos no cubiertos en la migración principal
4. **Documentación**: Para documentar la evolución del sistema

### ❌ Cuándo NO usar este directorio:

1. **Desarrollo de nuevas features**: Siempre usa `src/model/` con implementaciones PostgreSQL
2. **Correcciones de bugs**: Los bugs aquí ya están resueltos en la versión actual
3. **Producción**: Nunca despliegues código desde este directorio
4. **Testing**: Usa los modelos actuales para tests

## 📋 Contenido

### Database/
- **MySQL.ts**: Conexión legacy a base de datos MySQL
- **Utilidad**: Solo para referencia de migración

### Models/
Todos los modelos de datos originales de MySQL:
- `usuarioMySQL.ts` - Gestión de usuarios (reemplazado por `usuarioPostgreSQL.ts`)
- `ventaMySQL.ts` - Gestión de ventas (reemplazado por `ventaPostgreSQL.ts`)
- `clienteMySQL.ts` - Gestión de clientes (reemplazado por `clientePostgreSQL.ts`)
- `correoMySQL.ts` - Gestión de correos (reemplazado por `correoPostgreSQL.ts`)
- ...y más

## 🔄 Migración Completada

La migración de MySQL a PostgreSQL se completó exitosamente en:
- **Fecha**: Febrero 2026
- **Commit**: feat: Migración completa de MySQL a PostgreSQL
- **Estado**: ✅ Completada y en producción

## 🔗 Referencias

- **Documentación de Migración**: Ver commits relacionados con "Migracion-PostgreSQL"
- **Modelos Actuales**: `src/model/` - Implementaciones PostgreSQL
- **Issues**: Historial de problemas resueltos en commits de migración

## 📝 Mantenimiento

**NO AGREGAR NUEVO CÓDIGO A ESTE DIRECTORIO**

Este directorio es **solo lectura**. Todo desarrollo nuevo debe ir en:
- Modelos: `src/model/`
- Interfaces: `src/interface/`
- Servicios: `src/services/`

## 🚨 Notas de Seguridad

Este código puede:
- Contener vulnerabilidades conocidas (ya resueltas en la versión actual)
- No tener validaciones de seguridad actualizadas
- Usar prácticas obsoletas de manejo de datos

**Para propósitos de seguridad, usa siempre los modelos PostgreSQL actuales.**

---

**Última actualización**: Febrero 2026
**Estado**: Legacy - Solo referencia histórica
**Responsable**: Equipo de Desarrollo System-Back-Office
