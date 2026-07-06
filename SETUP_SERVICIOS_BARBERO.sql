-- ============================================================
-- SETUP PARA SERVICIOS PERSONALIZADOS POR BARBERO
-- Y GESTIÓN DE COMISIONES
-- ============================================================
-- Ejecuta estos scripts en el SQL Editor de Supabase
-- ============================================================

-- 1. Crear tabla para servicios personalizados de cada barbero
-- Asegurarse de eliminar una versión previa incompatible
DROP TABLE IF EXISTS servicios_barbero CASCADE;

CREATE TABLE servicios_barbero (
  id serial PRIMARY KEY,
  barbero_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre varchar(255) NOT NULL,
  precio numeric(10,2) NOT NULL,
  duracion_minutos integer NOT NULL,
  creado_en timestamp DEFAULT now(),
  actualizado_en timestamp DEFAULT now()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_servicios_barbero_barbero_id ON servicios_barbero(barbero_id);

-- ============================================================

-- 2. Agregar columna de porcentaje de comisión a usuarios
-- Si la columna ya existe, este comando fallará (lo cual es normal)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS porcentaje_comision numeric(5,2) DEFAULT 30;

-- ============================================================

-- 3. OPCIONAL: Establecer políticas de seguridad RLS
-- (Si tienes RLS habilitado en tu tabla servicios_barbero)

-- Habilitar RLS (opcional). Las políticas asumen que `usuarios.auth_id` guarda el UUID de auth
ALTER TABLE servicios_barbero ENABLE ROW LEVEL SECURITY;

-- Política: Los barberos y administradores pueden ver sólo los servicios correspondientes
CREATE POLICY "Barberos ven solo sus servicios"
  ON servicios_barbero
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = servicios_barbero.barbero_id
        AND (u.auth_id = auth.uid() OR u.rol_id = 1)
    )
  );

-- Política: Los barberos y administradores pueden crear/editar/eliminar sus propios servicios
CREATE POLICY "Barberos editan solo sus servicios"
  ON servicios_barbero
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = servicios_barbero.barbero_id
        AND (u.auth_id = auth.uid() OR u.rol_id = 1)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = servicios_barbero.barbero_id
        AND (u.auth_id = auth.uid() OR u.rol_id = 1)
    )
  );

-- ============================================================
-- FIN DEL SETUP
-- ============================================================
