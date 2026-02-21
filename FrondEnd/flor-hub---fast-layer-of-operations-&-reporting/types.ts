
export enum SaleStatus {
  INICIAL = 'INICIAL',
  REPACTAR = 'REPACTAR',
  AGENDADO = 'AGENDADO',
  APROBADO_ABD = 'APROBADO ABD',
  CREADO_SIN_DOCU = 'CREADO SIN DOCU',
  CREADO_DOCU_OK = 'CREADO DOCU OK',
  CREADO = 'CREADO',
  PENDIENTE_DOCU_PIN = 'PENDIENTE DOCU/PIN',
  PIN_INGRESADO = 'PIN INGRESADO',
  PENDIENTE_CARGA_PIN = 'PENDIENTE CARGA PIN',
  EVALUANDO_DONANTE = 'EVALUANDO DONANTE',
  APROBADO = 'APROBADO',
  ACTIVADO_NRO_PORTADO = 'ACTIVADO NRO PORTADO',
  ACTIVADO_NRO_CLARO = 'ACTIVADO NRO CLARO',
  ACTIVADO = 'ACTIVADO',
  EXITOSO = 'EXITOSO',
  RECHAZADO_DONANTE = 'RECHAZADO DONANTE',
  RECHAZADO_ABD = 'RECHAZADO ABD',
  CANCELADO = 'CANCELADO',
  SPN_CANCELADA = 'SPN CANCELADA',
  CLIENTE_DESISTE = 'CLIENTE DESISTE'
}

export enum LogisticStatus {
  INICIAL = 'INICIAL',
  ASIGNADO = 'ASIGNADO',
  EN_TRANSITO = 'EN TRANSITO',
  INGRESADO_CENTRO_LOGISTICO = 'INGRESADO CENTRO LOGISTICO - ECOMMERCE',
  INGRESADO_AGENCIA = 'INGRESADO EN AGENCIA',
  INGRESADO_PICKUP = 'INGRESADO PICK UP CENTER UES',
  DEVUELTO = 'DEVUELTO',
  DEVUELTO_CLIENTE = 'DEVUELTO AL CLIENTE',
  ENTREGADO = 'ENTREGADO',
  NO_ENTREGADO = 'NO ENTREGADO',
  RENDIDO_AL_CLIENTE = 'RENDIDO AL CLIENTE',
  RECLAMO_UES = 'RECLAMO UES',
  ESIM = 'ESIM'
}

export enum LineStatus {
  PENDIENTE_PRECARGA = 'PENDIENTE PRECARGA',
  PRECARGADA = 'PRECARGADA',
  AUDITORIA_OK = 'AUDITORIA OK',
  PENDIENTE_PORTABILIDAD = 'PENDIENTE PORTABILIDAD',
  ERROR_TECNICO = 'ERROR TÉCNICO',
  ACTIVA = 'ACTIVA'
}

export enum ProductType {
  PORTABILITY = 'PORTABILIDAD',
  NEW_LINE = 'LÍNEA NUEVA',
  BAF = 'BAF',
  FIBER = 'FIBRA'
}

export enum OriginMarket {
  PREPAGO = 'PREPAGO',
  POSPAGO = 'POSPAGO',
  CONTRAFACTURA = 'CONTRAFACTURA'
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO',
  PREFIERO_NO_DECIR = 'PREFIERO NO DECIR'
}

export enum TipoDocumento {
  DNI = 'DNI',
  CUIL = 'CUIL',
  PASAPORTE = 'PASAPORTE'
}

export interface Comment {
  id: string;
  title: string;
  text: string;
  date: string;
  author: string;
  type?: string;
}

// Interfaz original de Sale (mantener para compatibilidad)
export interface Sale {
  id: string;
  customerName: string;
  dni: string;
  phoneNumber: string;
  status: SaleStatus;
  logisticStatus: LogisticStatus;
  logisticStatusDisplay?: string; // Texto original del estado de correo del backend
  lineStatus: LineStatus;
  productType: ProductType;
  originMarket: OriginMarket;
  originCompany?: string;
  plan: string;
  promotion: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  date: string;
  amount: number;
  comments: Comment[];
  advisor: string;
  supervisor: string;
  // Campos adicionales para SaleFormModal
  chip?: 'SIM' | 'ESIM';
  sds?: string | null;
  stl?: string | null;
  plan_id?: number;
  promocion_id?: number | null;
  empresa_origen_id?: number;
  // Campos de portabilidad
  spn?: string;
  numero_portar?: string;
  pin?: string | null;
  fecha_vencimiento_pin?: string | null;
  mercado_origen?: 'PREPAGO' | 'POSPAGO';
  // Campo para actualización de estado de correo
  correo_id?: number | null;
  sap?: string | null;
  // Historial de estados
  historial_estados?: Array<{
    estado_id: number;
    estado: string;
    descripcion: string | null;
    fecha_creacion: string;
  }>;
  historial_correo?: Array<{
    estado_correo_id: number;
    estado: string;
    descripcion: string | null;
    ubicacion_actual: string | null;
    fecha_creacion: string;
  }>;
}

// Nueva interfaz completa para detalles de venta
export interface SaleDetail {
  // Datos básicos de venta
  id: string;
  sds: string | null;
  sap: string | null;
  chip: 'SIM' | 'ESIM';
  stl: string | null;
  tipoVenta: 'PORTABILIDAD' | 'LINEA_NUEVA';
  multiple: number;
  fechaCreacion: string;
  
  // Datos del plan
  plan: {
    id: number;
    nombre: string;
    precio: number;
    gigabyte: number;
    llamadas: string;
    mensajes: string;
    beneficios: string | null;
    whatsapp: string;
    roaming: string;
  };
  
  // Datos de la promoción
  promocion?: {
    id: number;
    nombre: string;
    descuento: number | null;
    beneficios: string | null;
  };
  
  // Datos del cliente
  cliente: {
    id: string;
    nombre: string;
    apellido: string;
    tipoDocumento: TipoDocumento;
    documento: string;
    email: string;
    telefono: string | null;
    genero: Genero;
    fechaNacimiento: string;
    nacionalidad: string;
  };
  
  // Datos de portabilidad (si aplica)
  portabilidad?: {
    spn: string;
    empresaOrigen: string;
    mercadoOrigen: string;
    numeroPortar: string;
    pin: string | null;
    fechaPortacion: string | null;
  };
  
  // Datos del correo
  correo?: {
    sapId: string;
    telefonoContacto: string;
    telefonoAlternativo: string | null;
    destinatario: string;
    personaAutorizada: string | null;
    direccion: string;
    numeroCasa: number;
    entreCalles: string | null;
    barrio: string | null;
    localidad: string;
    departamento: string;
    codigoPostal: number;
    piso: string | null;
    departamentoNumero: string | null;
    geolocalizacion: string | null;
    comentarioCartero: string | null;
    fechaLimite: string;
  };
  
  // Estados actuales
  estadoVentaActual: SaleStatus;
  estadoCorreoActual: LogisticStatus | null;
  
  // Datos de precios
  precioFinal: number;
  precioBase: number;
  descuento: number;
  
  // Origen
  empresa_origen?: string;
  
  // Historiales
  historialEstadosVenta: {
    estado: SaleStatus;
    descripcion: string;
    fecha: string;
    usuario: string;
  }[];
  
  historialEstadosCorreo: {
    estado: LogisticStatus;
    descripcion: string | null;
    fecha: string;
    usuario: string | null;
    ubicacionActual: string | null;
  }[];
  
  // Comentarios
  comentarios: {
    id: number;
    titulo: string;
    comentario: string;
    tipo: 'GENERAL' | 'IMPORTANTE' | 'SISTEMA' | 'SEGUIMIENTO';
    fecha: string;
    autor: {
      nombre: string;
      apellido: string;
      legajo: string;
      rol: string;
    };
  }[];
  
  // Datos del vendedor
  vendedor: {
    id: string;
    nombre: string;
    apellido: string;
    legajo: string;
    exa: string;
    email: string;
    telefono: string | null;
    celula: number;
  };
  
  // Datos del supervisor
  supervisor: {
    id: string;
    nombre: string;
    apellido: string;
    legajo: string;
    email: string;
  };
  
  // Prioridad calculada
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
}

export interface Seller {
  legajo: string;
  exa: string;
  name: string;
  email: string;
  dni: string;
  supervisor: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export interface Notification {
  id: string;
  type: 'CRITICAL' | 'RECENT';
  title: string;
  message: string;
  timestamp: string;
}

export type AppTab = 'GESTIÓN' | 'SEGUIMIENTO' | 'REPORTES' | 'OFERTAS';
