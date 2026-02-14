-- Sample data for testing

USE `BO_System`;

-- Insert sample persona
INSERT INTO persona (persona_id, nombre, apellido, fecha_nacimiento, documento, email, creado_en, telefono, tipo_documento, nacionalidad, genero) VALUES
('8efc06b1-9419-4d7b-bf6f-723b2d5ff2f4', 'Juan', 'Perez', '1990-01-01', '12345678', 'juan@example.com', '2025-01-01', '123456789', 'DNI', 'Argentina', 'Masculino'),
('f6d7075b-f604-431b-ae4f-c273d12da8b2', 'Maria', 'Gomez', '1992-02-02', '87654321', 'maria@example.com', '2025-01-01', '987654321', 'DNI', 'Argentina', 'Femenino');

-- Insert sample empresa
INSERT INTO empresa (id_empresa, nombre, cuit, entidad) VALUES
(1, 'Empresa Ejemplo', '12345678901', 1);

-- Insert sample password
INSERT INTO password (password_hash, usuario_persona_id, activa) VALUES
('$2y$10$abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNOP', 'f6d7075b-f604-431b-ae4f-c273d12da8b2', true);

-- Insert sample usuario
INSERT INTO usuario (usuario_id, persona_id, rol, status, legajo, exa) VALUES
('f6d7075b-f604-431b-ae4f-c273d12da8b2', 'f6d7075b-f604-431b-ae4f-c273d12da8b2', 'VENDEDOR', 'ACTIVO', 'LEG001', 'EXA001');

-- Insert sample cliente
INSERT INTO cliente (persona_id, empresa_id, tipo_cliente) VALUES
('8efc06b1-9419-4d7b-bf6f-723b2d5ff2f4', 1, 'INDIVIDUAL');

-- Insert sample plan
INSERT INTO plan (plan_id, nombre, precio, descripcion, whatsapp, roaming, minutos, datos, beneficios) VALUES
(1, 'Plan Básico', 1000.00, 'Plan básico', 'Si', 'No', '100 min', '1GB', 'Beneficio 1'),
(2, 'Plan Premium', 2000.00, 'Plan premium', 'Si', 'Si', '500 min', '5GB', 'Beneficio 2');

-- Insert sample promocion
INSERT INTO promocion (promocion_id, nombre, descuento, descripcion, empresa_id, beneficios) VALUES
(1, 'Promo 10%', 10.00, 'Descuento 10%', 1, 'Beneficio promo'),
(2, 'Promo 20%', 20.00, 'Descuento 20%', 1, 'Beneficio promo 2');

-- Insert sample estado_correo
INSERT INTO estado_correo (estado_correo_id, nombre) VALUES (1, 'Activo');

-- Insert sample correo (optional for SAP)
INSERT INTO correo (sap, cliente_id, fecha_vencimiento, estado_correo_id) VALUES
('SP65345624', '8efc06b1-9419-4d7b-bf6f-723b2d5ff2f4', '2025-12-31', 1),
('SP98765432', '8efc06b1-9419-4d7b-bf6f-723b2d5ff2f4', '2025-12-31', 1);