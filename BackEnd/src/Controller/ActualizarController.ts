import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import {
  EstadoVentaCreate,
  EstadoVentaEnum,
  EstadoVentaEstado,
} from "../schemas/venta/EstadoVenta.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { CorreoModelDB } from "../interface/correo.ts";

import { ActualizarService } from "../services/ActualizarService.ts";

export class ActualizarController {
  constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
    private ventaModelDB: VentaModelDB,
    private correoModelDB: CorreoModelDB,
    private actualizarService: ActualizarService,
  ) {}

  async actualizarEstadoCorreo(
    estadoNew: string[][],
    Guia?: number,
    Estado?: number,
    Descripcion?: number,
    Ubicacion?: number,
  ): Promise<number> {
    let count = 0;

    let numeroDeGuiaSAP: number = 0;
    let numeroDeEstadoSAP: number = 0;
    let numeroDeDescripcionSAP: number = 0;
    let numeroDeUbicacionSAP: number = 0;

    for (let i = 0; i < estadoNew[0].length; i++) {
      if (estadoNew[0][i] === "Guia") {
        console.log("Guia encontrada");
        numeroDeGuiaSAP = i;
      }
      if (estadoNew[0][i] === "Estado Guia") {
        console.log("Estado encontrada");
        numeroDeEstadoSAP = i;
      }
      if (estadoNew[0][i] === "Ultimo Evento Nombre") {
        console.log("Descripcion encontrada");
        numeroDeDescripcionSAP = i;
      }
      if (estadoNew[0][i] === "Ubicacion") {
        console.log("Ubicacion encontrada");
        numeroDeUbicacionSAP = i;
      }
    }

    if (Guia) {
      numeroDeGuiaSAP = Guia;
    }
    if (Estado) {
      numeroDeEstadoSAP = Estado;
    }
    if (Descripcion) {
      numeroDeDescripcionSAP = Descripcion;
    }
    if (Ubicacion) {
      numeroDeUbicacionSAP = Ubicacion;
    }

    const todosLosEstados = await this.estadoCorreoModelDB.getAll();

    if (!todosLosEstados || todosLosEstados.length === 0) {
      return 0;
    }

    // Optimización: Crear Map para búsqueda O(1) en lugar de O(n)
    const correoMap = new Map();
    for (const correo of todosLosEstados) {
      if (correo.sap_id) {
        correoMap.set(correo.sap_id, correo);
      }
    }

    for (const estado of estadoNew.slice(1)) {
      const guiaValue = estado[numeroDeGuiaSAP];
      if (!guiaValue) continue;

      const correo = correoMap.get(guiaValue);
      if (correo) {
        /*console.log(
          `Estado: ${estado[numeroDeEstadoSAP]}, Descripcion: ${
            estado[numeroDeDescripcionSAP]
          }, Ubicacion: ${estado[numeroDeUbicacionSAP]}`,
        );*/
        const estadoCorreoCreate: EstadoCorreoCreate = {
          estado: estado[numeroDeEstadoSAP] as
            | "INICIAL"
            | "ASIGNADO"
            | "EN TRANSITO"
            | "INGRESADO CENTRO LOGISTICO - ECOMMERCE"
            | "INGRESADO EN AGENCIA"
            | "INGRESADO PICK UP CENTER UES"
            | "DEVUELTO"
            | "DEVUELTO AL CLIENTE"
            | "ENTREGADO"
            | "NO ENTREGADO"
            | "RENDIDO AL CLIENTE"
            | "RECLAMO UES",
          descripcion: estado[numeroDeDescripcionSAP],
          usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
          ubicacion_actual: estado[numeroDeUbicacionSAP],
        };
        count += await this.actualizarService.actualizarEstadoCorreo(
          estadoCorreoCreate,
        );
      }
    }

    return count;
  }

  async actualizarEstadoVenta(
    estadoNew: string[][],
    VentaSDS?: number,
    Estado?: number,
    Descripcion?: number,
  ): Promise<number> {
    let count = 0;
    // DEBUG: Descomentar para debugging
    // console.log("=== INICIO actualizarEstadoVenta ===");
    // console.log("Total de filas recibidas:", estadoNew.length);
    // console.log("Headers:", estadoNew[0]);

    let numeroDeVentaSDS: number = -1;
    let numeroDeEstado: number = -1;
    let numeroDeDescripcion: number = -1;

    for (let i = 0; i < estadoNew[0].length; i++) {
      const header = estadoNew[0][i].trim();
      // DEBUG: Descomentar para debugging
      // console.log(`Header[${i}]: "${header}"`);
      if (header === "SDS") {
        // console.log("✓ SDS encontrada en posición", i);
        numeroDeVentaSDS = i;
      }
      if (header === "DESCRIPCION ESTADO") {
        // console.log("✓ DESCRIPCION ESTADO encontrada en posición", i);
        numeroDeEstado = i;
      }
      if (header === "DESCRIPCION RECHAZOS") {
        // console.log("✓ DESCRIPCION RECHAZOS encontrada en posición", i);
        numeroDeDescripcion = i;
      }
    }

    // Validar que se encontraron todos los headers necesarios
    if (numeroDeVentaSDS === -1) {
      console.error("✗ ERROR: No se encontró columna 'SDS'");
      return 0;
    }
    if (numeroDeEstado === -1) {
      console.error("✗ ERROR: No se encontró columna 'DESCRIPCION ESTADO'");
      return 0;
    }

    // DEBUG: Descomentar para debugging
    // console.log(
    //   "Índices encontrados - SDS:",
    //   numeroDeVentaSDS,
    //   "Estado:",
    //   numeroDeEstado,
    //   "Descripcion:",
    //   numeroDeDescripcion,
    // );

    if (VentaSDS !== undefined) numeroDeVentaSDS = VentaSDS;
    if (Estado !== undefined) numeroDeEstado = Estado;
    if (Descripcion !== undefined) numeroDeDescripcion = Descripcion;

    const todosLosEstadosActuales = await this.ventaModelDB.getAll({
      page: 1,
      limit: 100000,
    });
    // ✅ Validación agregada
    if (!todosLosEstadosActuales || todosLosEstadosActuales.length === 0) {
      console.error("✗ ERROR: No se encontraron ventas");
      return 0;
    }

    // Optimización: Crear Map para búsqueda O(1) en lugar de O(n)
    const ventasMap = new Map();
    for (const venta of todosLosEstadosActuales) {
      if (venta.sds) {
        ventasMap.set(venta.sds, venta);
      }
    }

    for (const estado of estadoNew.slice(1)) {
      const sdsValue = estado[numeroDeVentaSDS];
      if (!sdsValue) continue;

      const ventaActual = ventasMap.get(sdsValue);
      if (ventaActual) {
        //console.log(ventaActual, "Nuevo Estado:", estado[numeroDeEstado]);
        if (estado[numeroDeEstado] === undefined) {
          console.error("✗ ERROR: Estado nuevo no definido");
          continue;
        }

        const estadoVentaCreate: EstadoVentaCreate = {
          venta_id: ventaActual.venta_id,
          estado: estado[numeroDeEstado] as
            | "INICIAL"
            | "REPACTAR"
            | "AGENDADO"
            | "APROBADO ABD"
            | "CREADO SIN DOCU"
            | "CREADO DOCU OK"
            | "CREADO"
            | "PENDIENTE DOCU/PIN"
            | "PIN INGRESADO"
            | "PENDIENTE CARGA PIN"
            | "EVALUANDO DONANTE"
            | "APROBADO"
            | "ACTIVADO NRO PORTADO"
            | "ACTIVADO NRO CLARO"
            | "ACTIVADO"
            | "EXITOSO"
            | "RECHAZADO DONANTE"
            | "RECHAZADO ABD"
            | "CANCELADO"
            | "SPN CANCELADA"
            | "CLIENTE DESISTE",
          descripcion: estado[numeroDeDescripcion] || "",
          usuario_id: "0219c4f7-a760-4365-99e2-20929b47fe99",
        };
        // DEBUG: Descomentar para debugging
        // console.log("EstadoVentaCreate:", estadoVentaCreate);
        const result = await this.actualizarService.actualizarEstadoVenta(
          estadoVentaCreate,
        );
        // DEBUG: Descomentar para debugging
        // console.log("Resultado de actualizarEstadoVenta:", result);
        count += result;
      } else {
        // DEBUG: Descomentar para debugging
        // console.log("Venta no encontrada:", estado[numeroDeVentaSDS]);
      }

      // console.log("Count acumulado:", count);
    }
    return count;
  }

  async actualizarSegumientoLinea(
    ventaNew: string[][],
    documento?: number,
    fechaNacimiento?: number,
    promo?: number,
    planID?: number,
    pedidoSTL?: number,
    numeroDeContacto?: number,
    pedidoSAP?: number,
    ultimoStatus?: number,
    operadoraPortacion?: number,
    esnProMark?: number,
    exaUsuario?: number,
  ): Promise<number> {
    let count = 0;

    let numeroDeVentaDocumento: number = 0;
    let numeroDeFechaNacimiento: number = 0;
    let numeroDePromo: number = 0;
    let numeroDePlanID: number = 0;
    let numeroDePedidoSTL: number = 0;
    let numeroDeNumeroDeContacto: number = 0;
    let numeroDePedidoSAP: number = 0;
    let numeroDeUltimoStatus: number = 0;
    let numeroDeSRFromNunber: number = 0;
    let numeroDeOperadoraPortacion: number = 0;
    let numeroDeESNProMark: number = 0;
    let numeroDeEXAUsuario: number = 0;

    for (let i = 0; i < ventaNew[0].length; i++) {
      const header = ventaNew[0][i].trim();
      if (header === "DOCUMENTO") {
        numeroDeVentaDocumento = i;
        console.log("Documento encontrado en la columna", i);
      }
      if (header === "FECHA_NACIMIENTO") {
        numeroDeFechaNacimiento = i;
        console.log("Fecha de nacimiento encontrada en la columna", i);
      }
      if (header === "PROMO") {
        numeroDePromo = i;
        console.log("Promo encontrada en la columna", i);
      }
      if (header === "PLAN_ID") {
        numeroDePlanID = i;
        console.log("Plan ID encontrado en la columna", i);
      }
      if (header === "PEDIDO_STL") {
        numeroDePedidoSTL = i;
        console.log("Pedido STL encontrado en la columna", i);
      }
      if (header === "NUMERO_CONTACTO") {
        numeroDeNumeroDeContacto = i;
        console.log("Número de contacto encontrado en la columna", i);
      }
      if (header === "PEDIDO_SAP") {
        numeroDePedidoSAP = i;
        console.log("Pedido SAP encontrado en la columna", i);
      }
      if (header === "ULTIMO_STATUS") {
        numeroDeUltimoStatus = i;
        console.log("Último status encontrado en la columna", i);
      }
      if (header === "SR_FROM_NUMBER") {
        numeroDeSRFromNunber = i;
        console.log("SR From Number encontrado en la columna", i);
      }
      if (header === "OPERADORA_PORTACION") {
        numeroDeOperadoraPortacion = i;
        console.log("Operadora Portación encontrado en la columna", i);
      }
      if (header === "esn_pro_mark") {
        numeroDeESNProMark = i;
        console.log("ESN Pro Mark encontrado en la columna", i);
      }
      if (header === "EXA USUARIO") {
        numeroDeEXAUsuario = i;
        console.log("EXA Usuario encontrado en la columna", i);
      }
    }

    if (documento !== undefined) numeroDeNumeroDeContacto = documento;
    if (fechaNacimiento !== undefined) {
      numeroDeFechaNacimiento = fechaNacimiento;
    }
    if (promo !== undefined) numeroDePromo = promo;
    if (planID !== undefined) numeroDePlanID = planID;
    if (pedidoSTL !== undefined) numeroDePedidoSTL = pedidoSTL;
    if (numeroDeContacto !== undefined) {
      numeroDeNumeroDeContacto = numeroDeContacto;
    }
    if (pedidoSAP !== undefined) numeroDePedidoSAP = pedidoSAP;
    if (ultimoStatus !== undefined) numeroDeUltimoStatus = ultimoStatus;
    if (operadoraPortacion !== undefined) {
      numeroDeOperadoraPortacion = operadoraPortacion;
    }
    if (esnProMark !== undefined) {
      numeroDeESNProMark = esnProMark;
    }
    if (exaUsuario !== undefined) {
      numeroDeEXAUsuario = exaUsuario;
    }

    /*for (const venta of ventaNew.slice(1)) {
      const ventaCreate: VentaCreate = {
        venta_id: Number(venta[numeroDeVentaSAP]),
        estado: venta[numeroDeEstadoSAP] as EstadoVentaEstado, // Typed cast to satisfy lint
        descripcion: venta[numeroDeDescripcionSAP],
        usuario_id: "0000000000",
        fecha_creacion: new Date(),
      };
      count += await this.actualizarService.actualizarSegumientoLinea(
        ventaCreate,
      );
      }*/
    return count;
  }
}
