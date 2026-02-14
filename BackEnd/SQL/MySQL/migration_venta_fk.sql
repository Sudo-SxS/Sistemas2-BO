-- Migration: Change venta.vendedor_id FK from vendedor.usuario_id to usuario.persona_id
-- This allows all authenticated users to create sales

-- 1. Drop the old foreign key
ALTER TABLE venta DROP FOREIGN KEY vendedor;

-- 2. Add the new foreign key pointing to usuario.persona_id
ALTER TABLE venta ADD CONSTRAINT vendedor
  FOREIGN KEY (vendedor_id) REFERENCES usuario (persona_id)
  ON DELETE NO ACTION ON UPDATE CASCADE;

-- Verification: Check that the FK is updated
-- SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_NAME = 'venta' AND COLUMN_NAME = 'vendedor_id';