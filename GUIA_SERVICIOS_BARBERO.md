# Guía de Implementación: Servicios por Barbero y Comisiones

## 📋 Resumen de Cambios

Tu aplicación ahora permite que:
- ✅ **Barberos creen sus propios servicios** personalizados
- ✅ **Solo el administrador pueda cambiar el porcentaje de comisión** de cada barbero
- ✅ Los porcentajes de comisión se guardan en la base de datos y son fijos para los barberos

---

## 🔧 Pasos de Configuración (IMPORTANTE)

### Paso 1: Ejecutar Scripts SQL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query y copia-pega el contenido de: `SETUP_SERVICIOS_BARBERO.sql`
4. Ejecuta el script (botón verde ▶)

Esto creará:
- Tabla `servicios_barbero` para servicios personalizados de cada barbero
- Columna `porcentaje_comision` en tabla `usuarios`
- Políticas de seguridad RLS (si tienes habilitado)

### Paso 2: Verificar la Instalación

Después de ejecutar el SQL, verifica en Supabase:

```sql
-- Ver tabla creada
SELECT * FROM servicios_barbero LIMIT 5;

-- Ver nuevas columnas en usuarios
SELECT id, nombre, porcentaje_comision FROM usuarios LIMIT 5;
```

---

## 📱 Nuevas Funcionalidades en la App

### Para Barberos 💈

**Menú: "Mis Servicios"**
- Crear servicios personalizados (cortes especiales, tratamientos, etc.)
- Editar servicios existentes
- Eliminar servicios
- Cada barbero tiene sus propios servicios independientes

**Menú: "Mis Comisiones"**
- Ver desglose de comisiones por corte
- El porcentaje es de **solo lectura** (fijo por administrador)
- Filtrar por fechas

### Para Administrador 👨‍💼

**Menú: "Comisiones" (nuevo)**
- Gestionar porcentaje de comisión para cada barbero
- Cambios se guardan en BD y aplican inmediatamente
- Rango permitido: 0% - 100%

**Menú: "Servicios"**
- Sigue siendo para servicios globales (comunes a todos)
- Los servicios de barberos son independientes

---

## 🔄 Flujo de Uso

### Escenario 1: Crear un Servicio Personalizado

```
Barbero inicia sesión
  ↓
Hace clic en "Mis Servicios"
  ↓
Hace clic en "+ Nuevo Servicio"
  ↓
Ingresa: Nombre, Precio, Duración
  ↓
Servicio guardado (solo visible para este barbero)
```

### Escenario 2: Modificar Comisión de un Barbero

```
Admin inicia sesión
  ↓
Hace clic en "Comisiones" (en menú admin)
  ↓
Encuentra al barbero
  ↓
Ingresa nuevo porcentaje (ej: 25%)
  ↓
Se guarda automáticamente
  ↓
Barbero verá el nuevo % en "Mis Comisiones"
```

---

## 📊 Estructura de Base de Datos

### Tabla: `servicios_barbero`
```sql
CREATE TABLE servicios_barbero (
  id uuid PRIMARY KEY,
  barbero_id uuid,        -- FK a usuarios.id
  nombre varchar(255),    -- "Fade clásico"
  precio decimal(10,2),   -- 25.00
  duracion_minutos int,   -- 30
  creado_en timestamp,
  actualizado_en timestamp
);
```

### Tabla: `usuarios` (columna agregada)
```sql
ALTER TABLE usuarios ADD COLUMN porcentaje_comision decimal(5,2) DEFAULT 30;
```

---

## 🚀 Componentes Nuevos

| Archivo | Descripción |
|---------|------------|
| `BarberoServicios.jsx` | Panel de gestión de servicios para barberos |
| `ModalBarberoServicio.jsx` | Modal para crear/editar servicios |
| `GestionComisiones.jsx` | Panel para admin gestionar comisiones |

### Archivos Modificados
- `Dashboard.jsx` - Nuevos menús y rutas
- `ComisionesBarbero.jsx` - Lee porcentaje de BD (read-only)

---

## ⚠️ Consideraciones Importantes

1. **Servicios Globales vs Personalizados**:
   - Servicios globales (tabla `servicios`) = ofrecidos por toda la barbería
   - Servicios del barbero (tabla `servicios_barbero`) = solo ese barbero

2. **Reservas de Citas**:
   - Actualmente, las citas usan servicios de tabla `servicios`
   - Los servicios personalizados del barbero no afectan reservas (aún)
   - Puedes actualizar `ModalNuevaCita.jsx` si deseas incluirlos

3. **Seguridad RLS**:
   - Las políticas incluidas solo aplican si tienes RLS habilitado
   - Si no lo tienes, son opcionales pero recomendadas

---

## ✅ Checklist de Verificación

- [ ] Ejecuté el SQL en Supabase
- [ ] Verifiqué que la tabla `servicios_barbero` existe
- [ ] Verifiqué que `usuarios.porcentaje_comision` existe
- [ ] Barbero puede ver "Mis Servicios" en su menú
- [ ] Administrador puede ver "Comisiones" en su menú
- [ ] Barbero puede crear un nuevo servicio
- [ ] Administrador puede cambiar porcentaje de comisión
- [ ] El porcentaje en "Mis Comisiones" es de solo lectura para barberos

---

## 🆘 Solución de Problemas

### "No encuentro el SQL Editor en Supabase"
→ Va a: Dashboard → Tu proyecto → SQL Editor (en sidebar izquierdo)

### "Error: tabla ya existe"
→ Es normal si ejecutas el script dos veces. El segundo intento fallará pero es seguro.

### "Los servicios no se guardan"
→ Verifica que el barbero esté autenticado y que `usuarioId` sea correcto

### "No veo la columna de comisión"
→ Recarga la página o revisa que el SQL se ejecutó sin errores

---

## 📝 Próximos Pasos Opcionales

1. **Incluir servicios de barbero en reservas**:
   - Modificar `ReservarCita.jsx` y `ModalNuevaCita.jsx`
   - Traer servicios globales + servicios del barbero seleccionado

2. **Panel de estadísticas**:
   - Ver cuántos servicios personalizados tiene cada barbero
   - Servicios más populares

3. **Historial de cambios**:
   - Registrar quién cambió qué comisión y cuándo

---

**¡Listo! Tu sistema está configurado para que los barberos creen servicios y el admin maneje comisiones. 🎉**
