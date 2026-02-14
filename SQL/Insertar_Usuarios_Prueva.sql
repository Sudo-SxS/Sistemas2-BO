-- =====================================================
-- DATASET COMPLETO DE PRUEBA PARA BO_SYSTEM
-- Actualizado con nueva estructura de BD (empresa_origen, etc)
-- =====================================================

-- SELECCIONAR BASE DE DATOS
USE `BO_System`;

-- =====================================================
-- 0. LIMPIAR DATOS PREVIOS (OPCIONAL - COMENTAR SI NO SE DESEA)
-- =====================================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE reclamo_correo;
-- TRUNCATE TABLE estado_correo;
-- TRUNCATE TABLE alerta;
-- TRUNCATE TABLE estado;
-- TRUNCATE TABLE portabilidad;
-- TRUNCATE TABLE linea_nueva;
-- TRUNCATE TABLE venta;
-- TRUNCATE TABLE promocion;
-- TRUNCATE TABLE plan;
-- TRUNCATE TABLE correo;
-- TRUNCATE TABLE password;
-- TRUNCATE TABLE permisos_has_usuario;
-- TRUNCATE TABLE vendedor;
-- TRUNCATE TABLE supervisor;
-- TRUNCATE TABLE back_office;
-- TRUNCATE TABLE usuario;
-- TRUNCATE TABLE cliente;
-- TRUNCATE TABLE permisos;
-- TRUNCATE TABLE celula;
-- TRUNCATE TABLE empresa;
-- TRUNCATE TABLE empresa_origen;
-- TRUNCATE TABLE persona;
-- SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. PERMISOS DEL SISTEMA
-- =====================================================
INSERT IGNORE INTO `permisos` (`permisos_id`, `nombre`) VALUES
(1, 'ADMIN'),
(2, 'SUPERADMIN'),
(3, 'SUPERVISOR'),
(4, 'VENDEDOR');

-- =====================================================
-- 2. EMPRESAS (TELECOM - DUEÑAS DEL SISTEMA)
-- =====================================================
INSERT IGNORE INTO `empresa` (`id_empresa`, `nombre`, `cuit`, `entidad`) VALUES
(1, 'TelecomPlus S.A.', '30-71234567-8', 1),
(2, 'MoviTech Argentina', '33-87654321-9', 2);

SET @empresa_telecomplus = 1;
SET @empresa_movitech = 2;

-- =====================================================
-- 3. CÉLULAS ORGANIZACIONALES
-- =====================================================
INSERT IGNORE INTO `celula` (`id_celula`, `empresa`, `nombre`, `tipo_cuanta`) VALUES
-- TelecomPlus
(1, @empresa_telecomplus, 'Célula Centro', 'POSPAGO'),
(2, @empresa_telecomplus, 'Célula Norte', 'POSPAGO'),
(3, @empresa_telecomplus, 'Célula Sur', 'PREPAGO'),
(4, @empresa_telecomplus, 'Célula Administrativa', 'MIXTO'),
-- MoviTech
(5, @empresa_movitech, 'MoviTech Centro', 'POSPAGO'),
(6, @empresa_movitech, 'MoviTech Norte', 'PREPAGO');

-- =====================================================
-- 4. EMPRESAS ORIGEN (OPERADORES EXTERNOS)
-- =====================================================
INSERT IGNORE INTO `empresa_origen` (`empresa_origen_id`, `nombre_empresa`, `pais`) VALUES
(1, 'Movistar Argentina', 'Argentina'),
(2, 'Claro Argentina', 'Argentina'),
(3, 'Personal Telecom', 'Argentina'),
(4, 'Tuenti Argentina', 'Argentina');

-- =====================================================
-- 5. BACK OFFICE USERS
-- =====================================================

-- Back Office 1: Bruce Wayne (SUPERADMIN)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Bruce', 'Wayne', '1988-03-15', '32456789', 'bruce.wayne@telecomplus.com', CURDATE(), '1145678901', 'DNI', 'Argentina', 'Masculino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET @bruce_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '32456789' ORDER BY persona_id LIMIT 1);

INSERT IGNORE INTO `usuario` (`legajo`, `exa`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO001', 'EXA00001', @bruce_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT IGNORE INTO `back_office` (`usuario`) VALUES (@bruce_id);

INSERT IGNORE INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(2, @bruce_id); -- SUPERADMIN

INSERT IGNORE INTO `password` (`password_hash`, `usuario_persona_id`, `fecha_creacion`, `activa`, `intentos_fallidos`) VALUES
('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', @bruce_id, NOW(), 1, 0);

-- Back Office 2: Clark Kent (ADMIN)
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Clark', 'Kent', '1990-07-22', '35123456', 'clark.kent@telecomplus.com', CURDATE(), '1145678902', 'DNI', 'Argentina', 'Masculino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET @clark_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '35123456' ORDER BY persona_id LIMIT 1);

INSERT IGNORE INTO `usuario` (`legajo`, `exa`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('BO002', 'EXA00002', @clark_id, 'ACTIVO', 4, 'BACK_OFFICE');

INSERT IGNORE INTO `back_office` (`usuario`) VALUES (@clark_id);

INSERT IGNORE INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(1, @clark_id); -- ADMIN

INSERT IGNORE INTO `password` (`password_hash`, `usuario_persona_id`, `fecha_creacion`, `activa`, `intentos_fallidos`) VALUES
('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', @clark_id, NOW(), 1, 0);

-- =====================================================
-- 6. SUPERVISORES
-- =====================================================

-- Supervisor 1: Steve Rogers
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Steve', 'Rogers', '1987-09-10', '33789456', 'steve.rogers@telecomplus.com', CURDATE(), '1145678905', 'DNI', 'Argentina', 'Masculino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET @steve_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '33789456' ORDER BY persona_id LIMIT 1);

INSERT IGNORE INTO `usuario` (`legajo`, `exa`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('SUP01', 'EXA00101', @steve_id, 'ACTIVO', 1, 'SUPERVISOR');

INSERT IGNORE INTO `supervisor` (`usuario_id`) VALUES (@steve_id);

INSERT IGNORE INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(3, @steve_id); -- SUPERVISOR

INSERT IGNORE INTO `password` (`password_hash`, `usuario_persona_id`, `fecha_creacion`, `activa`, `intentos_fallidos`) VALUES
('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', @steve_id, NOW(), 1, 0);

-- Supervisor 2: Diana Prince
INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Diana', 'Prince', '1989-12-05', '34567890', 'diana.prince@telecomplus.com', CURDATE(), '1145678906', 'DNI', 'Argentina', 'Femenino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

SET @diana_id = (SELECT `persona_id` FROM `persona` WHERE `documento` = '34567890' ORDER BY persona_id LIMIT 1);

INSERT IGNORE INTO `usuario` (`legajo`, `exa`, `persona_id`, `estado`, `celula`, `rol`) VALUES
('SUP02', 'EXA00102', @diana_id, 'ACTIVO', 2, 'SUPERVISOR');

INSERT IGNORE INTO `supervisor` (`usuario_id`) VALUES (@diana_id);

INSERT IGNORE INTO `permisos_has_usuario` (`permisos_id`, `persona_id`) VALUES
(3, @diana_id); -- SUPERVISOR

INSERT IGNORE INTO `password` (`password_hash`, `usuario_persona_id`, `fecha_creacion`, `activa`, `intentos_fallidos`) VALUES
('$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', @diana_id, NOW(), 1, 0);

-- =====================================================
-- 7. VENDEDORES (10 VENDEDORES)
-- =====================================================

INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Peter', 'Parker', '1995-01-15', '40123456', 'peter.parker@telecomplus.com', CURDATE(), '1145678910', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Natasha', 'Romanoff', '1996-02-20', '40234567', 'natasha.romanoff@telecomplus.com', CURDATE(), '1145678911', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Tony', 'Stark', '1994-03-25', '39345678', 'tony.stark@telecomplus.com', CURDATE(), '1145678912', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Wanda', 'Maximoff', '1997-04-30', '41456789', 'wanda.maximoff@telecomplus.com', CURDATE(), '1145678913', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Thor', 'Odinson', '1995-05-10', '40567890', 'thor.odinson@telecomplus.com', CURDATE(), '1145678914', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Carol', 'Danvers', '1996-06-15', '40678901', 'carol.danvers@telecomplus.com', CURDATE(), '1145678915', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Scott', 'Lang', '1994-07-20', '39789012', 'scott.lang@telecomplus.com', CURDATE(), '1145678916', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Hope', 'Van Dyne', '1997-08-25', '41890123', 'hope.vandyne@telecomplus.com', CURDATE(), '1145678917', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Sam', 'Wilson', '1995-09-30', '40901234', 'sam.wilson@telecomplus.com', CURDATE(), '1145678918', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Bucky', 'Barnes', '1996-10-05', '41012345', 'bucky.barnes@telecomplus.com', CURDATE(), '1145678919', 'DNI', 'Argentina', 'Masculino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar usuarios vendedores
INSERT IGNORE INTO `usuario` (`legajo`, `exa`, `persona_id`, `estado`, `celula`, `rol`)
SELECT
    CONCAT('VEN', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    CONCAT('EXA002', LPAD(ROW_NUMBER() OVER (ORDER BY documento), 2, '0')),
    persona_id,
    'ACTIVO',
    1,
    'VENDEDOR'
FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', 
                     '40678901', '39789012', '41890123', '40901234', '41012345');

-- Insertar en tabla vendedor
INSERT IGNORE INTO `vendedor` (`usuario_id`)
SELECT persona_id FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', 
                     '40678901', '39789012', '41890123', '40901234', '41012345');

-- Insertar permisos
INSERT IGNORE INTO `permisos_has_usuario` (`permisos_id`, `persona_id`)
SELECT 4, persona_id FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', 
                     '40678901', '39789012', '41890123', '40901234', '41012345');

-- Insertar contraseñas
INSERT IGNORE INTO `password` (`password_hash`, `usuario_persona_id`, `fecha_creacion`, `activa`, `intentos_fallidos`)
SELECT
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    persona_id,
    NOW(),
    1,
    0
FROM `persona`
WHERE documento IN ('40123456', '40234567', '39345678', '41456789', '40567890', 
                     '40678901', '39789012', '41890123', '40901234', '41012345');

-- =====================================================
-- 8. CLIENTES (10 CLIENTES)
-- =====================================================

INSERT INTO `persona` (`persona_id`, `nombre`, `apellido`, `fecha_nacimiento`, `documento`, `email`, `creado_en`, `telefono`, `tipo_documento`, `nacionalidad`, `genero`) VALUES
(UUID(), 'Juan', 'Pérez', '1985-03-15', '25000001', 'juan.perez@email.com', CURDATE(), '3514567890', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'María', 'González', '1990-07-22', '30000002', 'maria.gonzalez@email.com', CURDATE(), '3514567891', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Carlos', 'Rodríguez', '1988-11-30', '28000003', 'carlos.rodriguez@email.com', CURDATE(), '3514567892', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Ana', 'Martínez', '1992-05-18', '32000004', 'ana.martinez@email.com', CURDATE(), '3514567893', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Luis', 'Fernández', '1987-09-25', '27000005', 'luis.fernandez@email.com', CURDATE(), '3514567894', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Laura', 'López', '1991-02-14', '31000006', 'laura.lopez@email.com', CURDATE(), '3514567895', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Diego', 'Sánchez', '1986-08-08', '26000007', 'diego.sanchez@email.com', CURDATE(), '3514567896', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Sofía', 'Ramírez', '1993-12-01', '33000008', 'sofia.ramirez@email.com', CURDATE(), '3514567897', 'DNI', 'Argentina', 'Femenino'),
(UUID(), 'Martín', 'Torres', '1989-06-20', '29000009', 'martin.torres@email.com', CURDATE(), '3514567898', 'DNI', 'Argentina', 'Masculino'),
(UUID(), 'Valentina', 'Flores', '1994-04-10', '34000010', 'valentina.flores@email.com', CURDATE(), '3514567899', 'DNI', 'Argentina', 'Femenino')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar clientes
INSERT IGNORE INTO `cliente` (`persona_id`)
SELECT persona_id FROM `persona`
WHERE documento IN ('25000001', '30000002', '28000003', '32000004', '27000005',
                     '31000006', '26000007', '33000008', '29000009', '34000010');

-- =====================================================
-- 9. PLANES
-- =====================================================

INSERT IGNORE INTO `plan` (`nombre`, `precio`, `gigabyte`, `llamadas`, `mensajes`, `beneficios`, `whatsapp`, `roaming`, `fecha_creacion`, `empresa_origen_id`) VALUES
('Plan Básico 5GB', 2500, 5.0, '200 min', '200 SMS', 'Navegación básica', 'Ilimitado', 'No incluido', NOW(), 1),
('Plan Medio 15GB', 4500, 15.0, '500 min', '500 SMS', 'Redes sociales sin límite', 'Ilimitado', 'América', NOW(), 1),
('Plan Premium 30GB', 7500, 30.0, 'Ilimitadas', 'Ilimitados', 'Streaming HD + Gaming', 'Ilimitado', 'Mundial', NOW(), 2),
('Plan Ultra 50GB', 10000, 50.0, 'Ilimitadas', 'Ilimitados', 'Todo incluido + 5G', 'Ilimitado', 'Mundial Premium', NOW(), 2),
('Plan Joven 10GB', 3000, 10.0, '300 min', '300 SMS', 'Apps musicales gratis', 'Ilimitado', 'No incluido', NOW(), 3);

-- =====================================================
-- 10. PROMOCIONES
-- =====================================================

INSERT IGNORE INTO `promocion` (`nombre`, `descuento`, `beneficios`, `fecha_creacion`, `empresa_origen_id`) VALUES
('Promo Bienvenida', '25% OFF', 'Descuento primer mes', NOW(), 1),
('Promo Estudiante', '30% OFF', 'Con credencial estudiantil', NOW(), 1),
('Promo Portabilidad', '50% OFF', 'Primer mes al portarte', NOW(), 2),
('Promo Familiar', '20% OFF', 'Por cada línea adicional', NOW(), 2),
('Black Friday', '40% OFF', 'Descuento especial temporal', NOW(), 3);

-- =====================================================
-- 11. CORREOS (6 CORREOS CON DIFERENTES ESTADOS)
-- =====================================================

INSERT IGNORE INTO `correo` (`sap_id`, `telefono_contacto`, `telefono_alternativo`, `destinatario`, `persona_autorizada`, `direccion`, `numero_casa`, `entre_calles`, `barrio`, `localidad`, `departamento`, `codigo_postal`, `fecha_creacion`, `fecha_limite`, `pisio`, `departamento_numero`, `geolocalizacion`, `comentario_cartero`) VALUES
('SAP001', '3514567890', '3514567800', 'JUAN PÉREZ', 'JUAN PÉREZ', 'AV. COLÓN', 1250, 'Entre 9 de Julio y 27 de Abril', 'Centro', 'Córdoba', 'Capital', 5000, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), NULL, NULL, '-31.4201,-64.1888', 'Casa con rejas negras'),
('SAP002', '3514567891', NULL, 'MARÍA GONZÁLEZ', 'MARÍA GONZÁLEZ', 'DUARTE QUIRÓS', 850, 'Entre Deán Funes y Buenos Aires', 'Nueva Córdoba', 'Córdoba', 'Capital', 5000, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), '5', 'B', '-31.4198,-64.1872', 'Edificio con portero eléctrico'),
('SAP003', '3514567892', '3514567802', 'CARLOS RODRÍGUEZ', NULL, 'RAFAEL NÚÑEZ', 3500, NULL, 'Cerro de las Rosas', 'Córdoba', 'Capital', 5009, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), NULL, NULL, '-31.3889,-64.2344', 'Casa esquina, timbre verde'),
('SAP004', '3514567893', '3514567803', 'ANA MARTÍNEZ', 'PEDRO MARTÍNEZ', 'RECTA MARTINOLLI', 7800, 'Entre Los Paraísos y Los Jazmines', 'Arguello', 'Córdoba', 'Capital', 5021, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NULL, NULL, '-31.3234,-64.2678', 'Barrio privado, anunciar'),
('SAP005', '3514567894', NULL, 'LUIS FERNÁNDEZ', 'LUIS FERNÁNDEZ', 'AV. CIRCUNVALACIÓN', 4200, NULL, 'Villa Belgrano', 'Córdoba', 'Capital', 5014, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), '2', 'A', '-31.3567,-64.2123', 'Dejar con portero'),
('SAP006', '3514567895', '3514567805', 'LAURA LÓPEZ', 'LAURA LÓPEZ', 'VÉLEZ SARSFIELD', 3200, 'Entre Bv. Illia y Castro Barros', 'Alta Córdoba', 'Córdoba', 'Capital', 5000, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), NULL, NULL, '-31.3891,-64.1756', 'Casa con jardín adelante');

-- =====================================================
-- 12. ESTADOS DE CORREO (HISTORIAL COMPLETO)
-- =====================================================

-- SAP001: En tránsito
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP001', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 5 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP001', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 4 DAY), 'EN CAMINO A CÓRDOBA', NULL, NULL),
('SAP001', 0, 'LLEGADA_DESTINO', DATE_SUB(NOW(), INTERVAL 2 DAY), 'CENTRO DE DISTRIBUCIÓN CÓRDOBA', NULL, NULL),
('SAP001', 0, 'EN_REPARTO', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CAMIÓN DE REPARTO ZONA CENTRO', 'Primera visita programada', NULL);

-- SAP002: Entregado exitosamente
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP002', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 4 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP002', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 3 DAY), 'EN CAMINO A CÓRDOBA', NULL, NULL),
('SAP002', 0, 'EN_REPARTO', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CAMIÓN DE REPARTO NUEVA CÓRDOBA', 'Visitado', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('SAP002', 1, 'ENTREGADO', NOW(), 'DOMICILIO DEL CLIENTE', 'Entrega exitosa', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- SAP003: En camino
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP003', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 3 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP003', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 2 DAY), 'EN CAMINO A CÓRDOBA', NULL, NULL),
('SAP003', 0, 'LLEGADA_DESTINO', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CENTRO DE DISTRIBUCIÓN CÓRDOBA', NULL, NULL);

-- SAP004: Devuelto (cliente ausente)
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP004', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 7 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP004', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 6 DAY), 'EN CAMINO A CÓRDOBA', NULL, NULL),
('SAP004', 0, 'EN_REPARTO', DATE_SUB(NOW(), INTERVAL 3 DAY), 'CAMIÓN DE REPARTO ARGUELLO', 'Cliente ausente', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('SAP004', 0, 'EN_REPARTO', DATE_SUB(NOW(), INTERVAL 2 DAY), 'SEGUNDA VISITA PROGRAMADA', 'Cliente ausente nuevamente', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('SAP004', 0, 'DEVUELTO', DATE_SUB(NOW(), INTERVAL 1 DAY), 'CENTRO DE DISTRIBUCIÓN CÓRDOBA - DEVOLUCIÓN', 'Imposible contactar', NULL);

-- SAP005: Pendiente primer intento
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP005', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 2 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP005', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 1 DAY), 'EN CAMINO A CÓRDOBA', NULL, NULL);

-- SAP006: Vencido y devuelto
INSERT IGNORE INTO `estado_correo` (`sap_id`, `entregado_ok`, `estado_guia`, `ultimo_evento_fecha`, `ubicacion_actual`, `primera_visita`, `fecha_primer_visita`) VALUES
('SAP006', 0, 'RECIBIDO_EN_ORIGEN', DATE_SUB(NOW(), INTERVAL 10 DAY), 'CENTRO DE DISTRIBUCIÓN BUENOS AIRES', NULL, NULL),
('SAP006', 0, 'EN_TRANSITO', DATE_SUB(NOW(), INTERVAL 9 DAY), 'DEMORA EN TRANSPORTE', NULL, NULL),
('SAP006', 0, 'LLEGADA_DESTINO', DATE_SUB(NOW(), INTERVAL 5 DAY), 'CENTRO DE DISTRIBUCIÓN CÓRDOBA', NULL, NULL),
('SAP006', 0, 'VENCIDO', DATE_SUB(NOW(), INTERVAL 3 DAY), 'PLAZO DE ENTREGA VENCIDO', NULL, NULL),
('SAP006', 0, 'DEVUELTO', DATE_SUB(NOW(), INTERVAL 2 DAY), 'DEVUELTO A REMITENTE', 'Fuera de plazo', NULL);

-- =====================================================
-- 13. VENTAS (10 VENTAS VARIADAS)
-- =====================================================

INSERT IGNORE INTO `venta` (`sds`, `chip`, `stl`, `tipo_venta`, `sap`, `cliente_id`, `vendedor_id`, `multiple`, `plan_id`, `promocion_id`, `fecha_creacion`, `empresa_origen_id`) VALUES
-- Líneas nuevas
('SDS001', 'SIM', 'STL001', 'LINEA_NUEVA', 'SAP001', 
  (SELECT persona_id FROM persona WHERE documento = '25000001' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN01' LIMIT 1),
  0, 1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 1),

('SDS002', 'ESIM', 'STL002', 'LINEA_NUEVA', 'SAP002', 
  (SELECT persona_id FROM persona WHERE documento = '30000002' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN02' LIMIT 1),
  0, 2, 2, DATE_SUB(NOW(), INTERVAL 4 DAY), 1),

('SDS003', 'SIM', 'STL003', 'LINEA_NUEVA', 'SAP003', 
  (SELECT persona_id FROM persona WHERE documento = '28000003' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN03' LIMIT 1),
  1, 3, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), 2),

-- Portabilidades
('SDS004', 'SIM', 'STL004', 'PORTABILIDAD', 'SAP004', 
  (SELECT persona_id FROM persona WHERE documento = '32000004' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN04' LIMIT 1),
  0, 4, 3, DATE_SUB(NOW(), INTERVAL 7 DAY), 1),

('SDS005', 'ESIM', 'STL005', 'PORTABILIDAD', 'SAP005', 
  (SELECT persona_id FROM persona WHERE documento = '27000005' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN05' LIMIT 1),
  0, 5, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), 2),

('SDS006', 'SIM', 'STL006', 'PORTABILIDAD', 'SAP006', 
  (SELECT persona_id FROM persona WHERE documento = '31000006' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN06' LIMIT 1),
  0, 1, 4, DATE_SUB(NOW(), INTERVAL 10 DAY), 3),

-- Más líneas nuevas
('SDS007', 'SIM', 'STL007', 'LINEA_NUEVA', NULL, 
  (SELECT persona_id FROM persona WHERE documento = '26000007' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN07' LIMIT 1),
  2, 2, 5, DATE_SUB(NOW(), INTERVAL 1 DAY), 1),

('SDS008', 'ESIM', 'STL008', 'LINEA_NUEVA', NULL, 
  (SELECT persona_id FROM persona WHERE documento = '33000008' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN08' LIMIT 1),
  0, 3, 1, NOW(), 2),

('SDS009', 'SIM', 'STL009', 'PORTABILIDAD', NULL, 
  (SELECT persona_id FROM persona WHERE documento = '29000009' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN09' LIMIT 1),
  0, 4, NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), 1),

('SDS010', 'ESIM', 'STL010', 'LINEA_NUEVA', NULL, 
  (SELECT persona_id FROM persona WHERE documento = '34000010' LIMIT 1),
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN10' LIMIT 1),
  1, 5, 2, DATE_SUB(NOW(), INTERVAL 8 DAY), 3);

-- =====================================================
-- 14. LÍNEAS NUEVAS
-- =====================================================

INSERT IGNORE INTO `linea_nueva` (`venta_id`) VALUES
(1), (2), (3), (7), (8), (10);

-- =====================================================
-- 15. PORTABILIDADES
-- =====================================================

INSERT IGNORE INTO `portabilidad` (`venta_id`, `spn`, `empresa_origen`, `mercado_origen`, `numero_portar`, `pin`, `fecha_portacion`) VALUES
(4, 'SPN001234', 'Movistar', 'POSPAGO', '3515111111', '1234', DATE_ADD(NOW(), INTERVAL 2 DAY)),
(5, 'SPN005678', 'Claro', 'PREPAGO', '3515222222', '5678', DATE_ADD(NOW(), INTERVAL 3 DAY)),
(6, 'SPN009012', 'Personal', 'POSPAGO', '3515333333', '9012', NULL),
(9, 'SPN003456', 'Tuenti', 'PREPAGO', '3515444444', '3456', DATE_ADD(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 16. ESTADOS DE VENTAS
-- =====================================================

INSERT IGNORE INTO `estado` (`venta_id`, `estado`, `descripcion`, `fecha_creacion`, `usuario_id`) VALUES
(1, 'EN_TRANSPORTE', 'SIM enviado al domicilio', DATE_SUB(NOW(), INTERVAL 4 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN01' LIMIT 1)),
(2, 'COMPLETADO', 'Venta completada exitosamente', NOW(), 
  (SELECT persona_id FROM usuario WHERE legajo = 'BO001' LIMIT 1)),
(3, 'CREADO_DOCU_OK', 'Documentación verificada', DATE_SUB(NOW(), INTERVAL 2 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP01' LIMIT 1)),
(4, 'PENDIENTE_PORTABILIDAD', 'Esperando activación portabilidad', DATE_SUB(NOW(), INTERVAL 5 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP01' LIMIT 1)),
(5, 'APROBADO', 'Venta aprobada, en proceso', DATE_SUB(NOW(), INTERVAL 1 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP02' LIMIT 1)),
(6, 'RECHAZADO', 'Cliente no contactable, devuelto', DATE_SUB(NOW(), INTERVAL 2 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'BO002' LIMIT 1)),
(7, 'CREADO', 'Venta creada recientemente', NOW(), 
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN07' LIMIT 1)),
(8, 'CREADO', 'Venta nueva sin procesar', NOW(), 
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN08' LIMIT 1)),
(9, 'PENDIENTE_PORTABILIDAD', 'Esperando validación PIN', DATE_SUB(NOW(), INTERVAL 4 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP02' LIMIT 1)),
(10, 'EN_TRANSPORTE', 'SIM cards en camino', DATE_SUB(NOW(), INTERVAL 7 DAY), 
  (SELECT persona_id FROM usuario WHERE legajo = 'VEN10' LIMIT 1));

-- =====================================================
-- 17. ALERTAS
-- =====================================================

INSERT IGNORE INTO `alerta` (`venta_id`, `tipo_alerta`, `comentario`, `origen`, `estado`, `creada_por`, `fecha_creacion`, `fecha_resolucion`) VALUES
(4, 'PORTABILIDAD_RECHAZADA', 'PIN incorrecto proporcionado por cliente', 'AUTOMATICA', 'ABIERTA', 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP01' LIMIT 1), 
  DATE_SUB(NOW(), INTERVAL 5 DAY), NULL),

(1, 'DOCUMENTACION', 'Falta foto de DNI reverso', 'BACK_OFFICE', 'EN_REVISION', 
  (SELECT persona_id FROM usuario WHERE legajo = 'BO001' LIMIT 1), 
  DATE_SUB(NOW(), INTERVAL 3 DAY), NULL),

(6, 'DATOS_INCORRECTOS', 'Cliente no responde llamadas', 'SUPERVISOR', 'RESUELTA', 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP02' LIMIT 1), 
  DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),

(9, 'PORTABILIDAD_RECHAZADA', 'Operador origen rechazó portabilidad', 'AUTOMATICA', 'ABIERTA', 
  (SELECT persona_id FROM usuario WHERE legajo = 'SUP02' LIMIT 1), 
  DATE_SUB(NOW(), INTERVAL 4 DAY), NULL),

(3, 'PLAN_INCORRECTO', 'Cliente solicitó cambio de plan', 'BACK_OFFICE', 'RESUELTA', 
  (SELECT persona_id FROM usuario WHERE legajo = 'BO002' LIMIT 1), 
  DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =====================================================
-- 18. RECLAMOS DE CORREO
-- =====================================================

INSERT IGNORE INTO `reclamo_correo` (`sap_id`, `titulo`, `comentario`) VALUES
('SAP001', 'Demora en entrega', 'El paquete lleva más de 5 días y aún no ha sido entregado. Cliente solicita información del estado.'),
('SAP004', 'Cliente ausente', 'Se realizaron dos intentos de entrega pero el cliente nunca estuvo en el domicilio. Se requiere coordinación de horario.'),
('SAP006', 'Paquete vencido', 'El envío superó el plazo de entrega comprometido. Cliente solicita reenvío urgente o compensación.');

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

SELECT '=== ✅ DATASET COMPLETO INSERTADO EXITOSAMENTE ===' AS '';

SELECT 
  'INFRAESTRUCTURA' AS Categoría,
  CONCAT('Empresas: ', (SELECT COUNT(*) FROM empresa)) AS Detalle
UNION ALL
SELECT 'INFRAESTRUCTURA', CONCAT('Células: ', (SELECT COUNT(*) FROM celula))
UNION ALL
SELECT 'INFRAESTRUCTURA', CONCAT('Empresas Origen: ', (SELECT COUNT(*) FROM empresa_origen))
UNION ALL
SELECT 'INFRAESTRUCTURA', CONCAT('Permisos: ', (SELECT COUNT(*) FROM permisos))
UNION ALL
SELECT '', ''
UNION ALL
SELECT 'USUARIOS', CONCAT('Personas: ', (SELECT COUNT(*) FROM persona))
UNION ALL
SELECT 'USUARIOS', CONCAT('Usuarios Totales: ', (SELECT COUNT(*) FROM usuario))
UNION ALL
SELECT 'USUARIOS', CONCAT('Back Office: ', (SELECT COUNT(*) FROM back_office))
UNION ALL
SELECT 'USUARIOS', CONCAT('Supervisores: ', (SELECT COUNT(*) FROM supervisor))
UNION ALL
SELECT 'USUARIOS', CONCAT('Vendedores: ', (SELECT COUNT(*) FROM vendedor))
UNION ALL
SELECT 'USUARIOS', CONCAT('Clientes: ', (SELECT COUNT(*) FROM cliente))
UNION ALL
SELECT 'USUARIOS', CONCAT('Contraseñas: ', (SELECT COUNT(*) FROM password))
UNION ALL
SELECT '', ''
UNION ALL
SELECT 'PRODUCTOS', CONCAT('Planes: ', (SELECT COUNT(*) FROM plan))
UNION ALL
SELECT 'PRODUCTOS', CONCAT('Promociones: ', (SELECT COUNT(*) FROM promocion))
UNION ALL
SELECT '', ''
UNION ALL
SELECT 'VENTAS', CONCAT('Ventas Totales: ', (SELECT COUNT(*) FROM venta))
UNION ALL
SELECT 'VENTAS', CONCAT('Líneas Nuevas: ', (SELECT COUNT(*) FROM linea_nueva))
UNION ALL
SELECT 'VENTAS', CONCAT('Portabilidades: ', (SELECT COUNT(*) FROM portabilidad))
UNION ALL
SELECT 'VENTAS', CONCAT('Estados Venta: ', (SELECT COUNT(*) FROM estado))
UNION ALL
SELECT 'VENTAS', CONCAT('Alertas: ', (SELECT COUNT(*) FROM alerta))
UNION ALL
SELECT '', ''
UNION ALL
SELECT 'LOGÍSTICA', CONCAT('Correos: ', (SELECT COUNT(*) FROM correo))
UNION ALL
SELECT 'LOGÍSTICA', CONCAT('Estados Correo: ', (SELECT COUNT(*) FROM estado_correo))
UNION ALL
SELECT 'LOGÍSTICA', CONCAT('Reclamos Correo: ', (SELECT COUNT(*) FROM reclamo_correo));

-- =====================================================
-- ESTADÍSTICAS DE CORREOS
-- =====================================================

SELECT '=== 📊 ESTADÍSTICAS DE CORREOS ===' AS '';

SELECT 
  COUNT(DISTINCT ec.sap_id) as 'Total Correos',
  SUM(CASE WHEN ec.entregado_ok = 1 THEN 1 ELSE 0 END) as 'Entregados',
  SUM(CASE WHEN ec.entregado_ok = 0 AND ec.estado_guia NOT LIKE '%DEVUELTO%' THEN 1 ELSE 0 END) as 'En Tránsito',
  SUM(CASE WHEN ec.estado_guia LIKE '%DEVUELTO%' THEN 1 ELSE 0 END) as 'Devueltos',
  ROUND(
    (SUM(CASE WHEN ec.entregado_ok = 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT ec.sap_id)) * 100, 
    2
  ) as '% Entrega'
FROM (
  SELECT sap_id, entregado_ok, estado_guia,
         ROW_NUMBER() OVER (PARTITION BY sap_id ORDER BY ultimo_evento_fecha DESC) as rn
  FROM estado_correo
) ec
WHERE ec.rn = 1;

SELECT '=== ✅ SCRIPT COMPLETADO ===' AS '';

/*
═══════════════════════════════════════════════════════════
                  RESUMEN DEL DATASET
═══════════════════════════════════════════════════════════

✅ INFRAESTRUCTURA:
   - 2 Empresas (TelecomPlus, MoviTech)
   - 6 Células organizacionales
   - 4 Empresas Origen (Movistar, Claro, Personal, Tuenti)
   - 4 Niveles de permisos

✅ USUARIOS:
   - 2 Back Office (SUPERADMIN, ADMIN)
   - 2 Supervisores
   - 10 Vendedores
   - 10 Clientes
   - Contraseñas en tabla separada con intentos_fallidos

✅ PRODUCTOS:
   - 5 Planes variados (Básico a Ultra)
   - 5 Promociones (descuentos del 20% al 50%)

✅ VENTAS:
   - 10 Ventas totales
   - 6 Líneas nuevas
   - 4 Portabilidades
   - 10 Estados de venta (workflow completo)
   - 5 Alertas (diferentes tipos y orígenes)

✅ LOGÍSTICA:
   - 6 Correos con diferentes estados
   - 23 Estados de correo (historial completo)
   - Ejemplos de entregas exitosas, en tránsito y devueltas
   - 3 Reclamos de correo

═══════════════════════════════════════════════════════════
                  CARACTERÍSTICAS
═══════════════════════════════════════════════════════════

✅ Idempotente: Se puede ejecutar múltiples veces sin errores
✅ Historial completo: Cada correo tiene múltiples estados
✅ Casos reales: Entregas exitosas, devoluciones, demoras
✅ Passwords separados: Nueva tabla password con intentos_fallidos
✅ Empresa_origen: Correctamente integrada
✅ Referencias correctas: Todos los FK válidos

═══════════════════════════════════════════════════════════
*/