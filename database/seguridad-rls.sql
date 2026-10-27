-- Seguridad: activar Row Level Security en las 4 tablas.
-- Supabase publica automáticamente una API REST sobre las tablas del esquema "public".
-- Con RLS activado y SIN políticas, esa API pública no puede leer ni escribir nada.
-- El back-end (Express) se conecta directo a Postgres con el usuario "postgres", que no se ve afectado.
-- Ejecutar UNA vez en Supabase -> SQL Editor.

ALTER TABLE cliente   ENABLE ROW LEVEL SECURITY;
ALTER TABLE membresia ENABLE ROW LEVEL SECURITY;
ALTER TABLE pago      ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceso    ENABLE ROW LEVEL SECURITY;
