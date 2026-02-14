-- Migración de empresa_destinada a empresa_origen_id

-- 1. Crear registros en empresa_origen basados en valores únicos existentes
INSERT INTO empresa_origen (nombre_empresa, pais)
SELECT DISTINCT UPPER(empresa_destinada), 'Argentina'
FROM (
    SELECT empresa_destinada FROM plan WHERE empresa_destinada IS NOT NULL AND empresa_destinada != ''
    UNION
    SELECT empresa_destinada FROM promocion WHERE empresa_destinada IS NOT NULL AND empresa_destinada != ''
) AS empresas_unicas
WHERE empresa_destinada IS NOT NULL AND empresa_destinada != '';

-- 2. Actualizar planes con empresa_origen_id
UPDATE plan p
INNER JOIN empresa_origen eo ON UPPER(p.empresa_destinada) = eo.nombre_empresa
SET p.empresa_origen_id = eo.empresa_origen_id;

-- 3. Actualizar promociones con empresa_origen_id
UPDATE promocion pr
INNER JOIN empresa_origen eo ON UPPER(pr.empresa_destinada) = eo.nombre_empresa
SET pr.empresa_origen_id = eo.empresa_origen_id;

-- 4. Actualizar ventas con empresa_origen_id (basado en plan)
UPDATE venta v
INNER JOIN plan p ON v.plan_id = p.plan_id
SET v.empresa_origen_id = p.empresa_origen_id;

-- 5. Verificar migración
SELECT 'Planes migrados:' as tipo, COUNT(*) as cantidad FROM plan WHERE empresa_origen_id IS NOT NULL
UNION ALL
SELECT 'Promociones migradas:', COUNT(*) FROM promocion WHERE empresa_origen_id IS NOT NULL
UNION ALL
SELECT 'Ventas migradas:', COUNT(*) FROM venta WHERE empresa_origen_id IS NOT NULL;