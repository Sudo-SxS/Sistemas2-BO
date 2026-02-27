-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.back_office (
  back_office_id integer NOT NULL DEFAULT nextval('back_office_back_office_id_seq'::regclass),
  usuario uuid NOT NULL UNIQUE,
  CONSTRAINT back_office_pkey PRIMARY KEY (back_office_id),
  CONSTRAINT fk_backoffice_usuario FOREIGN KEY (usuario) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.celula (
  id_celula integer NOT NULL,
  empresa integer NOT NULL,
  nombre character varying NOT NULL DEFAULT 'default'::character varying,
  tipo_cuenta character varying NOT NULL,
  CONSTRAINT celula_pkey PRIMARY KEY (id_celula),
  CONSTRAINT fk_celula_empresa FOREIGN KEY (empresa) REFERENCES public.empresa(id_empresa)
);
CREATE TABLE public.cliente (
  persona_id uuid NOT NULL,
  CONSTRAINT cliente_pkey PRIMARY KEY (persona_id),
  CONSTRAINT fk_cliente_persona FOREIGN KEY (persona_id) REFERENCES public.persona(persona_id)
);
CREATE TABLE public.comentario (
  comentario_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  titulo text NOT NULL,
  comentario text NOT NULL,
  fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
  venta_id integer NOT NULL,
  usuarios_id uuid NOT NULL,
  tipo_comentario text NOT NULL,
  CONSTRAINT comentario_pkey PRIMARY KEY (comentario_id),
  CONSTRAINT comentario_usuarios_id_fkey FOREIGN KEY (usuarios_id) REFERENCES public.usuario(persona_id),
  CONSTRAINT comentario_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id)
);
CREATE TABLE public.correo (
  sap_id character varying NOT NULL,
  telefono_contacto character varying NOT NULL,
  telefono_alternativo character varying,
  destinatario character varying NOT NULL,
  persona_autorizada character varying,
  direccion character varying NOT NULL,
  numero_casa integer NOT NULL,
  entre_calles character varying,
  barrio character varying,
  localidad character varying NOT NULL,
  departamento character varying NOT NULL,
  codigo_postal integer NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT now(),
  fecha_limite date NOT NULL,
  piso character varying,
  departamento_numero character varying,
  geolocalizacion character varying,
  comentario_cartero character varying,
  sap character varying,
  CONSTRAINT correo_pkey PRIMARY KEY (sap_id)
);
CREATE TABLE public.empresa (
  id_empresa integer NOT NULL DEFAULT nextval('empresa_id_empresa_seq'::regclass),
  nombre character varying NOT NULL,
  cuit character varying NOT NULL,
  entidad integer NOT NULL,
  CONSTRAINT empresa_pkey PRIMARY KEY (id_empresa)
);
CREATE TABLE public.empresa_origen (
  empresa_origen_id integer NOT NULL DEFAULT nextval('empresa_origen_empresa_origen_id_seq'::regclass),
  nombre_empresa character varying NOT NULL,
  pais character varying NOT NULL,
  CONSTRAINT empresa_origen_pkey PRIMARY KEY (empresa_origen_id)
);
CREATE TABLE public.estado (
  estado_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  venta_id integer NOT NULL,
  estado character varying NOT NULL,
  descripcion character varying NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT now(),
  usuario_id uuid NOT NULL,
  CONSTRAINT estado_pkey PRIMARY KEY (estado_id),
  CONSTRAINT fk_estado_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id),
  CONSTRAINT fk_estado_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id)
);
CREATE TABLE public.estado_correo (
  estado_correo_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sap_id character varying NOT NULL,
  estado character varying NOT NULL,
  descripcion character varying,
  fecha_creacion timestamp without time zone DEFAULT now(),
  usuario_id uuid NOT NULL,
  ubicacion_actual text,
  CONSTRAINT estado_correo_pkey PRIMARY KEY (estado_correo_id),
  CONSTRAINT fk_estado_correo_correo FOREIGN KEY (sap_id) REFERENCES public.correo(sap_id),
  CONSTRAINT fk_estado_correo_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.linea_nueva (
  venta_id integer NOT NULL,
  CONSTRAINT linea_nueva_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_linea_nueva_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id)
);
CREATE TABLE public.mensaje (
  mensaje_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['ALERTA'::text, 'NOTIFICACION'::text])),
  titulo text NOT NULL,
  comentario text NOT NULL,
  fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
  resuelto boolean DEFAULT false,
  fecha_resolucion timestamp without time zone,
  usuario_creador_id uuid NOT NULL,
  referencia_id bigint,
  CONSTRAINT mensaje_pkey PRIMARY KEY (mensaje_id),
  CONSTRAINT mensaje_usuario_creador_id_fkey FOREIGN KEY (usuario_creador_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.mensaje_destinatario (
  mensaje_id bigint NOT NULL,
  usuario_id uuid NOT NULL,
  leida boolean NOT NULL DEFAULT false,
  fecha_lectura timestamp without time zone,
  CONSTRAINT mensaje_destinatario_pkey PRIMARY KEY (mensaje_id, usuario_id),
  CONSTRAINT mensaje_destinatario_mensaje_id_fkey FOREIGN KEY (mensaje_id) REFERENCES public.mensaje(mensaje_id),
  CONSTRAINT mensaje_destinatario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.password (
  password_id integer NOT NULL DEFAULT nextval('password_password_id_seq'::regclass),
  password_hash character varying NOT NULL,
  usuario_persona_id uuid NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT now(),
  activa boolean DEFAULT true,
  intentos_fallidos integer DEFAULT 0,
  CONSTRAINT password_pkey PRIMARY KEY (password_id),
  CONSTRAINT fk_password_usuario FOREIGN KEY (usuario_persona_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.permisos (
  permisos_id integer NOT NULL DEFAULT nextval('permisos_permisos_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  CONSTRAINT permisos_pkey PRIMARY KEY (permisos_id)
);
CREATE TABLE public.permisos_has_usuario (
  permisos_id integer NOT NULL,
  persona_id uuid NOT NULL,
  CONSTRAINT permisos_has_usuario_pkey PRIMARY KEY (permisos_id, persona_id),
  CONSTRAINT fk_permiso FOREIGN KEY (permisos_id) REFERENCES public.permisos(permisos_id),
  CONSTRAINT fk_permiso_usuario FOREIGN KEY (persona_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.persona (
  persona_id uuid NOT NULL,
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  fecha_nacimiento date NOT NULL,
  documento character varying NOT NULL,
  tipo_documento character varying NOT NULL,
  nacionalidad character varying NOT NULL,
  genero character varying NOT NULL,
  email character varying NOT NULL,
  telefono character varying,
  creado_en timestamp without time zone DEFAULT now(),
  telefono_alternativo character varying,
  CONSTRAINT persona_pkey PRIMARY KEY (persona_id)
);
CREATE TABLE public.plan (
  plan_id integer NOT NULL DEFAULT nextval('plan_plan_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  gigabyte numeric NOT NULL,
  llamadas character varying NOT NULL,
  mensajes character varying NOT NULL,
  whatsapp character varying NOT NULL,
  roaming character varying NOT NULL,
  beneficios character varying,
  precio integer NOT NULL,
  fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
  empresa_origen_id integer NOT NULL,
  fecha_duracion date,
  promocion_id integer,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT plan_pkey PRIMARY KEY (plan_id),
  CONSTRAINT fk_plan_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id),
  CONSTRAINT plan_promocion_id_fkey FOREIGN KEY (promocion_id) REFERENCES public.promocion(promocion_id)
);
CREATE TABLE public.portabilidad (
  venta_id integer NOT NULL,
  spn character varying,
  empresa_origen character varying NOT NULL,
  mercado_origen text NOT NULL CHECK (mercado_origen = ANY (ARRAY['PREPAGO'::text, 'POSPAGO'::text])),
  numero_portar character varying NOT NULL,
  pin character varying,
  fecha_portacion timestamp without time zone,
  fecha_vencimiento_pin date,
  CONSTRAINT portabilidad_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_portabilidad_venta FOREIGN KEY (venta_id) REFERENCES public.venta(venta_id)
);
CREATE TABLE public.promocion (
  promocion_id integer NOT NULL DEFAULT nextval('promocion_promocion_id_seq'::regclass),
  nombre character varying NOT NULL UNIQUE,
  beneficios character varying,
  fecha_creacion timestamp without time zone NOT NULL DEFAULT now(),
  empresa_origen_id integer NOT NULL,
  fecha_terminacion date,
  descuento integer NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT promocion_pkey PRIMARY KEY (promocion_id),
  CONSTRAINT fk_promocion_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id)
);
CREATE TABLE public.supervisor (
  supervisor_id integer NOT NULL DEFAULT nextval('supervisor_supervisor_id_seq'::regclass),
  usuario_id uuid NOT NULL UNIQUE,
  CONSTRAINT supervisor_pkey PRIMARY KEY (supervisor_id),
  CONSTRAINT fk_supervisor_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.usuario (
  persona_id uuid NOT NULL,
  legajo character varying NOT NULL,
  exa character varying NOT NULL,
  estado character varying NOT NULL DEFAULT 'ACTIVO'::character varying,
  celula integer NOT NULL,
  rol text NOT NULL CHECK (rol = ANY (ARRAY['VENDEDOR'::text, 'SUPERVISOR'::text, 'BACK_OFFICE'::text, 'ADMIN'::text, 'SUPERADMIN'::text])),
  CONSTRAINT usuario_pkey PRIMARY KEY (persona_id),
  CONSTRAINT fk_usuario_persona FOREIGN KEY (persona_id) REFERENCES public.persona(persona_id),
  CONSTRAINT fk_usuario_celula FOREIGN KEY (celula) REFERENCES public.celula(id_celula)
);
CREATE TABLE public.vendedor (
  vendedor_id integer NOT NULL DEFAULT nextval('vendedor_vendedor_id_seq'::regclass),
  usuario_id uuid NOT NULL UNIQUE,
  CONSTRAINT vendedor_pkey PRIMARY KEY (vendedor_id),
  CONSTRAINT fk_vendedor_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(persona_id)
);
CREATE TABLE public.venta (
  venta_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  sds character varying,
  chip text DEFAULT 'SIM'::text CHECK (chip = ANY (ARRAY['SIM'::text, 'ESIM'::text])),
  stl character varying,
  tipo_venta text NOT NULL CHECK (tipo_venta = ANY (ARRAY['PORTABILIDAD'::text, 'LINEA_NUEVA'::text])),
  sap character varying,
  cliente_id uuid NOT NULL,
  vendedor_id uuid NOT NULL,
  multiple integer DEFAULT 0,
  plan_id integer NOT NULL,
  promocion_id integer,
  fecha_creacion timestamp without time zone DEFAULT now(),
  empresa_origen_id integer NOT NULL,
  CONSTRAINT venta_pkey PRIMARY KEY (venta_id),
  CONSTRAINT fk_venta_sap FOREIGN KEY (sap) REFERENCES public.correo(sap_id),
  CONSTRAINT fk_venta_cliente FOREIGN KEY (cliente_id) REFERENCES public.cliente(persona_id),
  CONSTRAINT fk_venta_vendedor FOREIGN KEY (vendedor_id) REFERENCES public.usuario(persona_id),
  CONSTRAINT fk_venta_plan FOREIGN KEY (plan_id) REFERENCES public.plan(plan_id),
  CONSTRAINT fk_venta_promocion FOREIGN KEY (promocion_id) REFERENCES public.promocion(promocion_id),
  CONSTRAINT fk_venta_empresa_origen FOREIGN KEY (empresa_origen_id) REFERENCES public.empresa_origen(empresa_origen_id)
);
