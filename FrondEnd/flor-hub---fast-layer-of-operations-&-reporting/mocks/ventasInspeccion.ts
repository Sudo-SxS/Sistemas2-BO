import { Sale, SaleStatus, LogisticStatus, ProductType, LineStatus, SaleDetail, Genero, TipoDocumento, OriginMarket } from '../types';
import { VentaCompletaResponse } from '../services/ventaDetalle';

export const INSPECTION_MOCK_SALES_DETAIL: SaleDetail[] = [
  {
    "id": "INS-001",
    "sds": "SDS-INS-001",
    "sap": "SAP-INS-001",
    "chip": "SIM",
    "stl": "STL-INS-001",
    "tipoVenta": "PORTABILIDAD",
    "multiple": 0,
    "fechaCreacion": "2024-12-01",
    "plan": {
      "id": 1,
      "nombre": "GigaMax Ilimitada (INS)",
      "precio": 8999,
      "gigabyte": 100,
      "llamadas": "Ilimitadas",
      "mensajes": "Ilimitados",
      "beneficios": "Roaming incluido en Sudamérica",
      "whatsapp": "Gratis",
      "roaming": "Incluido"
    },
    "promocion": {
      "id": 1,
      "nombre": "Inspección 50% OFF",
      "descuento": "50%",
      "beneficios": "Descuento en cuota mensual"
    },
    "cliente": {
      "id": "CLI-INS-001",
      "nombre": "Usuario",
      "apellido": "De Prueba 1",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "12345678",
      "email": "prueba1@inspeccion.com",
      "telefono": "+54 11 1111-1111",
      "genero": Genero.MASCULINO,
      "fechaNacimiento": "1990-01-01",
      "nacionalidad": "Argentina"
    },
    "portabilidad": {
      "spn": "SPN-INS-001",
      "empresaOrigen": "Movistar",
      "mercadoOrigen": "Prepago",
      "numeroPortar": "1111222233",
      "pin": 1234,
      "fechaPortacion": "2024-12-10"
    },
    "correo": {
      "sapId": "SAP-INS-001",
      "telefonoContacto": "+54 11 1111-1111",
      "telefonoAlternativo": null,
      "destinatario": "Usuario de Prueba 1",
      "personaAutorizada": null,
      "direccion": "Av. Inspección",
      "numeroCasa": 123,
      "entreCalles": "Calle 1 y Calle 2",
      "barrio": "Bento City",
      "localidad": "Distrito Capital",
      "departamento": "Buenos Aires",
      "codigoPostal": 1000,
      "piso": "1",
      "departamentoNumero": "A",
      "geolocalizacion": "-34.6, -58.4",
      "comentarioCartero": "Dejar bajo la puerta",
      "fechaLimite": "2024-12-15"
    },
    "estadoVentaActual": SaleStatus.EN_PROCESO,
    "estadoCorreoActual": LogisticStatus.ASIGNADO,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.EN_PROCESO,
        "descripcion": "Iniciando prueba de inspección",
        "fecha": "2024-12-01T10:00:00.000Z",
        "usuario": "Modo Inspección"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.ASIGNADO,
        "descripcion": "Asignado para testeo",
        "fecha": "2024-12-01T10:05:00.000Z",
        "usuario": "Repartidor Test",
        "ubicacionActual": "Almacén Central"
      }
    ],
    "comentarios": [
      {
        "id": 1001,
        "titulo": "Nota de Inspección",
        "comentario": "Este es un comentario de prueba para verificar el escalado en Bitácora.",
        "tipo": "GENERAL",
        "fecha": "2024-12-01T10:10:00.000Z",
        "autor": {
          "nombre": "ADMIN",
          "apellido": "TEST",
          "legajo": "TEST-001",
          "rol": "ADMIN"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "ALTA"
  },
  {
    "id": "INS-002",
    "sds": null,
    "sap": "SAP-INS-002",
    "chip": "ESIM",
    "stl": null,
    "tipoVenta": "LINEA_NUEVA",
    "multiple": 0,
    "fechaCreacion": "2024-12-02",
    "plan": {
      "id": 2,
      "nombre": "MegaPlan LN (INS)",
      "precio": 12000,
      "gigabyte": 200,
      "llamadas": "Ilimitadas",
      "mensajes": "Ilimitados",
      "beneficios": "Noche libre",
      "whatsapp": "Ilimitado",
      "roaming": "No"
    },
    "promocion": {
      "id": 2,
      "nombre": "Promo Invierno Test",
      "descuento": "30%",
      "beneficios": "3 meses bono"
    },
    "cliente": {
      "id": "CLI-INS-002",
      "nombre": "Cliente",
      "apellido": "De Prueba 2",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "87654321",
      "email": "prueba2@inspeccion.com",
      "telefono": "+54 11 2222-2222",
      "genero": Genero.FEMENINO,
      "fechaNacimiento": "1995-12-12",
      "nacionalidad": "Argentina"
    },
    "correo": {
      "sapId": "SAP-INS-002",
      "telefonoContacto": "+54 11 2222-2222",
      "telefonoAlternativo": null,
      "destinatario": "Cliente de Prueba 2",
      "personaAutorizada": null,
      "direccion": "Ruta de Pruebas 40",
      "numeroCasa": 500,
      "entreCalles": null,
      "barrio": "Pradera",
      "localidad": "San Luis",
      "departamento": "San Luis",
      "codigoPostal": 5700,
      "piso": null,
      "departamentoNumero": null,
      "geolocalizacion": "-33.3, -66.3",
      "comentarioCartero": "Zona de difícil acceso",
      "fechaLimite": "2024-12-20"
    },
    "estadoVentaActual": SaleStatus.APROBADO,
    "estadoCorreoActual": LogisticStatus.EN_TRANSITO,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.APROBADO,
        "descripcion": "Aprobación técnica superada",
        "fecha": "2024-12-02T15:00:00.000Z",
        "usuario": "Venta Automática"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.EN_TRANSITO,
        "descripcion": "Salió de base central",
        "fecha": "2024-12-03T08:00:00.000Z",
        "usuario": "Logística Global",
        "ubicacionActual": "Villa Mercedes"
      }
    ],
    "comentarios": [
      {
        "id": 1002,
        "titulo": "Logística",
        "comentario": "Se coordina entrega prioritaria.",
        "tipo": "SEGUIMIENTO",
        "fecha": "2024-12-03T09:00:00.000Z",
        "autor": {
          "nombre": "LOG",
          "apellido": "AGENT",
          "legajo": "L-500",
          "rol": "LOGISTICA"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "MEDIA"
  },
  {
    "id": "INS-003",
    "sds": "SDS-INS-003",
    "sap": "SAP-INS-003",
    "chip": "SIM",
    "stl": "600000001",
    "tipoVenta": "PORTABILIDAD",
    "multiple": 0,
    "fechaCreacion": "2024-12-05",
    "plan": {
      "id": 3,
      "nombre": "Ultra 5G (INS)",
      "precio": 15000,
      "gigabyte": 500,
      "llamadas": "Ilimitadas",
      "mensajes": "Ilimitados",
      "beneficios": "Pass de Streaming",
      "whatsapp": "Ilimitado",
      "roaming": "Si"
    },
    "promocion": {
      "id": 3,
      "nombre": "Promo Lanzamiento 5G",
      "descuento": "70%",
      "beneficios": "Primeros 6 meses"
    },
    "cliente": {
      "id": "CLI-INS-003",
      "nombre": "Tester",
      "apellido": "Maestro",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "99999999",
      "email": "maestro@inspeccion.com",
      "telefono": "+54 11 9999-9999",
      "genero": Genero.OTRO,
      "fechaNacimiento": "1980-05-05",
      "nacionalidad": "Argentina"
    },
    "portabilidad": {
      "spn": "SPN-INS-003",
      "empresaOrigen": "Claro",
      "mercadoOrigen": "Pospago",
      "numeroPortar": "1199887766",
      "pin": 9988,
      "fechaPortacion": "2024-12-15"
    },
    "correo": {
      "sapId": "SAP-INS-003",
      "telefonoContacto": "+54 11 9999-9999",
      "telefonoAlternativo": null,
      "destinatario": "Tester Maestro",
      "personaAutorizada": "Asistente Robot",
      "direccion": "Calle de los Bits",
      "numeroCasa": 1,
      "entreCalles": "CPU y GPU",
      "barrio": "Silicon",
      "localidad": "Tech",
      "departamento": "Santa Fe",
      "codigoPostal": 2000,
      "piso": null,
      "departamentoNumero": null,
      "geolocalizacion": "-32.9, -60.6",
      "comentarioCartero": "Recepción 24hs",
      "fechaLimite": "2024-12-25"
    },
    "estadoVentaActual": SaleStatus.ACTIVADO,
    "estadoCorreoActual": LogisticStatus.RENDIDO_AL_CLIENTE,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.ACTIVADO,
        "descripcion": "Venta exitosa finalizada",
        "fecha": "2024-12-10T11:00:00.000Z",
        "usuario": "Audit Test"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.RENDIDO_AL_CLIENTE,
        "descripcion": "Confirmado por el cliente",
        "fecha": "2024-12-10T12:00:00.000Z",
        "usuario": "Sistema Logístico",
        "ubicacionActual": "Domicilio"
      }
    ],
    "comentarios": [
      {
        "id": 1003,
        "titulo": "Feedback",
        "comentario": "Proceso impecable.",
        "tipo": "GENERAL",
        "fecha": "2024-12-11T10:00:00.000Z",
        "autor": {
          "nombre": "TEST",
          "apellido": "USER",
          "legajo": "U-111",
          "rol": "USER"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "ALTA"
  },
  {
    "id": "INS-004",
    "sds": "SDS-INS-004",
    "sap": "SAP-INS-004",
    "chip": "SIM",
    "stl": "600000004",
    "tipoVenta": "PORTABILIDAD",
    "multiple": 0,
    "fechaCreacion": "2024-12-08",
    "plan": {
      "id": 1,
      "nombre": "Plan Control (INS)",
      "precio": 4500,
      "gigabyte": 30,
      "llamadas": "300 min",
      "mensajes": "500",
      "beneficios": "Social Pass",
      "whatsapp": "Ilimitado",
      "roaming": "No"
    },
    "promocion": null,
    "cliente": {
      "id": "CLI-INS-004",
      "nombre": "Ramiro",
      "apellido": "Rechazo",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "55555555",
      "email": "ramiro@test.com",
      "telefono": "12345678",
      "genero": Genero.MASCULINO,
      "fechaNacimiento": "1988-08-08",
      "nacionalidad": "Argentina"
    },
    "portabilidad": {
      "spn": "SPN-INS-004",
      "empresaOrigen": "Personal",
      "mercadoOrigen": "Prepago",
      "numeroPortar": "1144445555",
      "pin": 4444,
      "fechaPortacion": "2024-12-12"
    },
    "estadoVentaActual": SaleStatus.RECHAZADO,
    "estadoCorreoActual": null,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.RECHAZADO,
        "descripcion": "Crédito insuficiente para portabilidad",
        "fecha": "2024-12-09T09:00:00.000Z",
        "usuario": "Scoring BCRA"
      }
    ],
    "historialEstadosCorreo": [],
    "comentarios": [
      {
        "id": 1004,
        "titulo": "Auditoría",
        "comentario": "El cliente no califica por deuda previa.",
        "tipo": "SEGUIMIENTO",
        "fecha": "2024-12-09T09:30:00.000Z",
        "autor": {
          "nombre": "AUDITOR",
          "apellido": "SR",
          "legajo": "A-999",
          "rol": "ADMIN"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "BAJA"
  },
  {
    "id": "INS-005",
    "sds": "SDS-INS-005",
    "sap": "SAP-INS-005",
    "chip": "SIM",
    "stl": null,
    "tipoVenta": "LINEA_NUEVA",
    "multiple": 0,
    "fechaCreacion": "2024-12-10",
    "plan": {
      "id": 4,
      "nombre": "Plan Familiar (INS)",
      "precio": 22000,
      "gigabyte": 100,
      "llamadas": "Ilimitadas",
      "mensajes": "Ilimitados",
      "beneficios": "Disney+ incluido",
      "whatsapp": "Ilimitado",
      "roaming": "No"
    },
    "promocion": null,
    "cliente": {
      "id": "CLI-INS-005",
      "nombre": "Candelaria",
      "apellido": "Cancela",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "44444444",
      "email": "cande@test.com",
      "telefono": "88887777",
      "genero": Genero.FEMENINO,
      "fechaNacimiento": "1994-04-04",
      "nacionalidad": "Argentina"
    },
    "estadoVentaActual": SaleStatus.CANCELADO,
    "estadoCorreoActual": null,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.CANCELADO,
        "descripcion": "Cliente se arrepintió de la oferta",
        "fecha": "2024-12-11T14:00:00.000Z",
        "usuario": "Vendedor Test"
      }
    ],
    "historialEstadosCorreo": [],
    "comentarios": [
      {
        "id": 1005,
        "titulo": "Cancelación",
        "comentario": "Solicita baja inmediata del trámite por cambio de opinión.",
        "tipo": "GENERAL",
        "fecha": "2024-12-11T14:15:00.000Z",
        "autor": {
          "nombre": "Vendedor",
          "apellido": "Test",
          "legajo": "T-001",
          "rol": "VENDEDOR"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "BAJA"
  },
  {
    "id": "INS-006",
    "sds": "SDS-INS-006",
    "sap": "SAP-INS-006",
    "chip": "ESIM",
    "stl": "600000006",
    "tipoVenta": "LINEA_NUEVA",
    "multiple": 0,
    "fechaCreacion": "2024-12-12",
    "plan": {
      "id": 5,
      "nombre": "Black Edition 500GB (INS)",
      "precio": 45000,
      "gigabyte": 500,
      "llamadas": "Ilimitadas World",
      "mensajes": "Ilimitados World",
      "beneficios": "Concierge 24/7",
      "whatsapp": "Ilimitado",
      "roaming": "Ilimitado"
    },
    "promocion": {
      "id": 6,
      "nombre": "Vip Experience",
      "descuento": "20%",
      "beneficios": "Acceso a salas VIP"
    },
    "cliente": {
      "id": "CLI-INS-006",
      "nombre": "Victor",
      "apellido": "Vip",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "11111111",
      "email": "victor@vip.com",
      "telefono": "99990000",
      "genero": Genero.MASCULINO,
      "fechaNacimiento": "1975-01-01",
      "nacionalidad": "Argentina"
    },
    "estadoVentaActual": SaleStatus.APROBADO,
    "estadoCorreoActual": LogisticStatus.EN_TRANSITO,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.APROBADO,
        "descripcion": "Venta VIP aprobada con prioridad 1",
        "fecha": "2024-12-12T08:00:00.000Z",
        "usuario": "Gerencia Comercial"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.EN_TRANSITO,
        "descripcion": "Envío VIP via Courier Express",
        "fecha": "2024-12-13T10:00:00.000Z",
        "usuario": "DHL Premium",
        "ubicacionActual": "Puerto Madero"
      }
    ],
    "comentarios": [
      {
        "id": 1006,
        "titulo": "Prioridad VIP",
        "comentario": "Trato preferencial, cliente corporativo de alto valor.",
        "tipo": "GENERAL",
        "fecha": "2024-12-12T08:30:00.000Z",
        "autor": {
          "nombre": "DIRECTOR",
          "apellido": "COMERCIAL",
          "legajo": "D-001",
          "rol": "ADMIN"
        }
      }
    ],
    "vendedor": {
      "id": "VEND-INS-001",
      "nombre": "Vendedor",
      "apellido": "Test",
      "legajo": "T-001",
      "exa": "TEST-01",
      "email": "vendedor@test.com",
      "telefono": "11112222",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-INS-001",
      "nombre": "Supervisor",
      "apellido": "Test",
      "legajo": "S-001",
      "email": "supervisor@test.com"
    },
    "priority": "ALTA"
  }
];

export const mapDetailToVentaCompleta = (detail: SaleDetail): VentaCompletaResponse => {
  return {
    venta: {
      venta_id: 1000 + INSPECTION_MOCK_SALES_DETAIL.indexOf(detail),
      sds: detail.sds || '',
      chip: detail.chip,
      stl: detail.stl || '',
      tipo_venta: detail.tipoVenta as 'PORTABILIDAD' | 'LINEA_NUEVA',
      cliente_id: detail.cliente.id,
      vendedor_id: detail.vendedor.id,
      multiple: detail.multiple,
      plan_id: detail.plan.id,
      empresa_origen_id: 1,
      fecha_creacion: detail.fechaCreacion,
      cliente_nombre: detail.cliente.nombre,
      cliente_apellido: detail.cliente.apellido,
      cliente_documento: detail.cliente.documento,
      cliente_email: detail.cliente.email,
      cliente_telefono: detail.cliente.telefono || '',
      vendedor_nombre: detail.vendedor.nombre,
      vendedor_apellido: detail.vendedor.apellido,
      vendedor_email: detail.vendedor.email,
      plan_nombre: detail.plan.nombre,
      plan_precio: detail.plan.precio,
      empresa_origen_nombre: detail.portabilidad?.empresaOrigen || 'N/A'
    },
    comentarios: detail.comentarios.map(c => ({
      comentario_id: c.id,
      venta_id: 0,
      usuario_id: c.autor.legajo,
      tipo_comentario: c.tipo === 'GENERAL' ? 'GENERAL' : (c.tipo === 'SEGUIMIENTO' ? 'LOGISTICA' : 'ESTADO'),
      texto: c.comentario,
      fecha_creacion: c.fecha,
      usuario_nombre: c.autor.nombre,
      usuario_apellido: c.autor.apellido
    })),
    portabilidad: detail.portabilidad ? {
      portabilidad_id: 1,
      venta_id: 0,
      numero_portar: detail.portabilidad.numeroPortar,
      operador_origen_id: 1,
      operador_origen_nombre: detail.portabilidad.empresaOrigen,
      estado: 'PENDIENTE',
      fecha_solicitud: detail.fechaCreacion
    } : undefined,
    estados: detail.historialEstadosVenta.map((h, i) => ({
      estado_venta_id: i,
      venta_id: 0,
      estado_nuevo: h.estado,
      fecha_cambio: h.fecha,
      usuario_id: '0',
      usuario_nombre: h.usuario
    })),
    correos: detail.correo ? [{
      correo_id: 1,
      venta_id: 0,
      cliente_id: detail.cliente.id,
      destinatario_nombre: detail.correo.destinatario,
      destinatario_direccion: detail.correo.direccion,
      destinatario_localidad: detail.correo.localidad,
      destinatario_provincia: detail.correo.departamento,
      codigo_postal: detail.correo.codigoPostal.toString(),
      tipo_envio: 'CHICO',
      estado_actual: detail.estadoCorreoActual || 'INICIAL',
      fecha_envio: detail.fechaCreacion
    }] : []
  };
};

export const mapDetailToSale = (detail: SaleDetail): Sale => {
  return {
    id: detail.id,
    customerName: `${detail.cliente.nombre} ${detail.cliente.apellido}`,
    dni: detail.cliente.documento,
    phoneNumber: detail.stl || detail.portabilidad?.numeroPortar || '',
    status: detail.estadoVentaActual,
    logisticStatus: (detail.estadoCorreoActual as LogisticStatus) || LogisticStatus.INICIAL,
    lineStatus: LineStatus.PRECARGADA,
    productType: detail.tipoVenta as ProductType,
    originMarket: (detail.portabilidad?.mercadoOrigen as OriginMarket) || OriginMarket.PREPAGO,
    plan: detail.plan.nombre,
    promotion: detail.promocion?.nombre || 'Sin promo',
    priority: detail.priority,
    date: detail.fechaCreacion,
    amount: detail.plan.precio,
    comments: [],
    advisor: `${detail.vendedor.nombre} ${detail.vendedor.apellido}`,
    supervisor: `${detail.supervisor.nombre} ${detail.supervisor.apellido}`
  };
};

export const getInspectionSales = (): Sale[] => {
  return INSPECTION_MOCK_SALES_DETAIL.map(mapDetailToSale);
};

export const getInspectionDetailById = (id: string): VentaCompletaResponse | null => {
  const detail = INSPECTION_MOCK_SALES_DETAIL.find(d => d.id === id);
  return detail ? mapDetailToVentaCompleta(detail) : null;
};
