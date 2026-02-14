import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento } from '../types';

export const MOCK_SALES_DETAIL: SaleDetail[] = [
  {
    "id": "V-11000",
    "sds": "SDS-2025-001",
    "sap": "SAP-900000",
    "chip": "SIM",
    "stl": "6008429153",
    "tipoVenta": "PORTABILIDAD",
    "multiple": 0,
    "fechaCreacion": "2024-11-27T10:30:00",
    "plan": {
      "id": 1,
      "nombre": "GigaMax Ilimitada",
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
      "nombre": "50% OFF 12 Meses",
      "descuento": "50%",
      "beneficios": "Descuento en cuota mensual"
    },
    "cliente": {
      "id": "CLI-001",
      "nombre": "Juan",
      "apellido": "García",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "38475621",
      "email": "juan.garcia456@email.com",
      "telefono": "+54 11 7392-1847",
      "genero": Genero.MASCULINO,
      "fechaNacimiento": "1994-06-18",
      "nacionalidad": "Argentina"
    },
    "portabilidad": {
      "spn": "SPN-84291",
      "empresaOrigen": "Movistar",
      "mercadoOrigen": "Prepago",
      "numeroPortar": "6009472834",
      "pin": 7392,
      "fechaPortacion": "2024-12-15"
    },
    "correo": {
      "sapId": "SAP-900000",
      "telefonoContacto": "+54 11 5829-3746",
      "telefonoAlternativo": "+54 11 9158-2736",
      "destinatario": "Juan García",
      "personaAutorizada": "María Rodríguez",
      "direccion": "Av. Corrientes",
      "numeroCasa": 2847,
      "entreCalles": "Entre Av. Santa Fe y Av. Libertador",
      "barrio": "San Nicolás",
      "localidad": "Buenos Aires",
      "departamento": "Buenos Aires",
      "codigoPostal": 2847,
      "piso": "12",
      "departamentoNumero": "B",
      "geolocalizacion": "-34.573928, -58.391847",
      "comentarioCartero": "Tocar timbre, dejar en portería si no hay respuesta",
      "fechaLimite": "2024-12-12"
    },
    "estadoVentaActual": SaleStatus.ACTIVADO,
    "estadoCorreoActual": LogisticStatus.ENTREGADO,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.ACTIVADO,
        "descripcion": "Cambio a estado ACTIVADO",
        "fecha": "2024-11-28T14:32:00.000Z",
        "usuario": "Clark Kent (SUP-001)"
      },
      {
        "estado": SaleStatus.APROBADO,
        "descripcion": "Cambio a estado APROBADO",
        "fecha": "2024-11-25T11:47:00.000Z",
        "usuario": "Clark Kent (SUP-001)"
      },
      {
        "estado": SaleStatus.EN_PROCESO,
        "descripcion": "Cambio a estado EN_PROCESO",
        "fecha": "2024-11-20T09:15:00.000Z",
        "usuario": "Clark Kent (SUP-001)"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.ENTREGADO,
        "descripcion": null,
        "fecha": "2024-11-28T16:45:00.000Z",
        "usuario": null,
        "ubicacionActual": null
      },
      {
        "estado": LogisticStatus.EN_TRANSITO,
        "descripcion": "Paquete en camino al domicilio",
        "fecha": "2024-11-26T10:30:00.000Z",
        "usuario": null,
        "ubicacionActual": "Buenos Aires"
      },
      {
        "estado": LogisticStatus.ASIGNADO,
        "descripcion": "Asignado a repartidor",
        "fecha": "2024-11-24T14:20:00.000Z",
        "usuario": "Carolina López (S003)",
        "ubicacionActual": null
      }
    ],
    "comentarios": [],
    "vendedor": {
      "id": "VEND-SUP-001",
      "nombre": "Clark",
      "apellido": "Kent",
      "legajo": "SUP-001",
      "exa": "SUPER-01",
      "email": "clark.kent@dailyplanet.com",
      "telefono": "+54 11 9999-0001",
      "celula": 1
    },
    "supervisor": {
      "id": "SUP-001",
      "nombre": "Alberto",
      "apellido": "Gómez",
      "legajo": "S002",
      "email": "alberto.gomez@flortelecom.com"
    },
    "priority": "ALTA"
  },
  {
    "id": "V-11001",
    "sds": null,
    "sap": "SAP-900001",
    "chip": "ESIM",
    "stl": null,
    "tipoVenta": "LINEA_NUEVA",
    "multiple": 0,
    "fechaCreacion": "2024-11-15",
    "plan": {
      "id": 2,
      "nombre": "Power 50GB",
      "precio": 6999,
      "gigabyte": 50,
      "llamadas": "Ilimitadas",
      "mensajes": "1000 SMS",
      "beneficios": "Redes sociales gratis",
      "whatsapp": "Gratis",
      "roaming": "No incluido"
    },
    "promocion": {
      "id": 4,
      "nombre": "Línea Nueva 25% OFF",
      "descuento": "25%",
      "beneficios": "Descuento especial líneas nuevas"
    },
    "cliente": {
      "id": "CLI-002",
      "nombre": "María",
      "apellido": "Rodríguez",
      "tipoDocumento": TipoDocumento.DNI,
      "documento": "42159876",
      "email": "maria.rodriguez123@email.com",
      "telefono": "+54 11 6147-8293",
      "genero": Genero.FEMENINO,
      "fechaNacimiento": "1989-03-22",
      "nacionalidad": "Uruguay"
    },
    "correo": {
      "sapId": "SAP-900001",
      "telefonoContacto": "+54 11 9473-6158",
      "telefonoAlternativo": null,
      "destinatario": "María Rodríguez",
      "personaAutorizada": null,
      "direccion": "Av. Santa Fe",
      "numeroCasa": 5193,
      "entreCalles": "Entre Av. Callao y Av. Pueyrredón",
      "barrio": "Palermo",
      "localidad": "Buenos Aires",
      "departamento": "Córdoba",
      "codigoPostal": 5193,
      "piso": null,
      "departamentoNumero": null,
      "geolocalizacion": "-33.912847, -58.274619",
      "comentarioCartero": null,
      "fechaLimite": "2024-11-30"
    },
    "estadoVentaActual": SaleStatus.EN_PROCESO,
    "estadoCorreoActual": LogisticStatus.ASIGNADO,
    "historialEstadosVenta": [
      {
        "estado": SaleStatus.EN_PROCESO,
        "descripcion": "Cambio a estado EN_PROCESO",
        "fecha": "2024-11-18T13:45:00.000Z",
        "usuario": "Tony Stark (IRN-001)"
      },
      {
        "estado": SaleStatus.PENDIENTE_DOCUMENTACION,
        "descripcion": "Cambio a estado PENDIENTE_DOCUMENTACION",
        "fecha": "2024-11-16T09:30:00.000Z",
        "usuario": "Tony Stark (IRN-001)"
      }
    ],
    "historialEstadosCorreo": [
      {
        "estado": LogisticStatus.ASIGNADO,
        "descripcion": "Asignado a repartidor",
        "fecha": "2024-11-17T11:20:00.000Z",
        "usuario": "Carolina López (S003)",
        "ubicacionActual": "Centro de Distribución"
      },
      {
        "estado": LogisticStatus.INICIAL,
        "descripcion": null,
        "fecha": "2024-11-15T16:00:00.000Z",
        "usuario": "Sistema",
        "ubicacionActual": null
      }
    ],
    "comentarios": [],
    "vendedor": {
      "id": "VEND-IRN-001",
      "nombre": "Tony",
      "apellido": "Stark",
      "legajo": "IRN-001",
      "exa": "STARK-01",
      "email": "tony.stark@starkindustries.com",
      "telefono": "+54 11 9999-0002",
      "celula": 2
    },
    "supervisor": {
      "id": "SUP-002",
      "nombre": "Carolina",
      "apellido": "López",
      "legajo": "S003",
      "email": "carolina.lopez@flortelecom.com"
    },
    "priority": "MEDIA"
  }
];

// Helper para obtener venta por ID
export const getSaleDetailById = (id: string): SaleDetail | undefined => {
  return MOCK_SALES_DETAIL.find(sale => sale.id === id);
};

// Helper para obtener todas las ventas
export const getAllSalesDetail = (): SaleDetail[] => {
  return MOCK_SALES_DETAIL;
};
