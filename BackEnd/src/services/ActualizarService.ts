import { EstadoCorreoModelDB } from "../interface/estadoCorreo.ts";
import { EstadoVentaModelDB } from "../interface/EstadoVenta.ts";
import { VentaModelDB } from "../interface/venta.ts";

import { EstadoCorreoCreate } from "../schemas/correo/EstadoCorreo.ts";
import { EstadoVentaCreate } from "../schemas/venta/EstadoVenta.ts";
import { VentaCreate, VentaUpdateSchema } from "../schemas/venta/Venta.ts";

export class ActualizarService {
  constructor(
    private estadoCorreoModelDB: EstadoCorreoModelDB,
    private estadoVentaModelDB: EstadoVentaModelDB,
    private ventaModelDB: VentaModelDB,
  ) {}

  async actualizarEstadoCorreo(
    estadoNew: EstadoCorreoCreate,
  ): Promise<number> {
    if (!estadoNew) {
      return 0;
    }
    const estadoCorreoActual = await this.estadoCorreoModelDB
      .getLastBySAP({ sap: estadoNew.sap_id });
    if (!estadoCorreoActual) {
      await this.estadoCorreoModelDB.add({
        input: estadoNew,
      });
      return 1;
    }
    if (estadoCorreoActual) {
      if (estadoCorreoActual.estado === "INICIAL") {
        await this.estadoCorreoModelDB.add({
          input: estadoNew,
        });
        return 1;
      } else if (
        estadoCorreoActual.usuario_id ===
          "0219c4f7-a760-4365-99e2-20929b47fe99" &&
        estadoNew.usuario_id === "0219c4f7-a760-4365-99e2-20929b47fe99"
      ) {
        if (estadoCorreoActual.estado === estadoNew.estado) {
          return 0;
        } else if (estadoCorreoActual.estado !== estadoNew.estado) {
          await this.estadoCorreoModelDB.add({
            input: estadoNew,
          });
          return 1;
        }
      }
    }
    return 0;
  }

  //-------------------------------------------------------------------------------------
  // ------------------------------------------------------------------------------------
  async actualizarEstadoVenta(
    estadoNew: EstadoVentaCreate,
  ): Promise<number> {
    if (!estadoNew) {
      // DEBUG: Descomentar para debugging
      // console.log("✗ estadoNew es null/undefined");
      return 0;
    }
    // DEBUG: Descomentar para debugging
    // console.log("=== actualizarEstadoVenta Service ===");
    // console.log("estadoNew recibido:", estadoNew);

    const estadoVentaActual = await this.estadoVentaModelDB
      .getLastByVentaId({ venta_id: estadoNew.venta_id });

    // DEBUG: Descomentar para debugging
    // console.log("estadoVentaActual:", estadoVentaActual);

    // Si no hay estado previo, crear el primero
    if (!estadoVentaActual) {
      // DEBUG: Descomentar para debugging
      // console.log("No hay estado previo, creando primer estado");
      await this.estadoVentaModelDB.add({
        input: estadoNew,
      });
      return 1;
    }

    // Si hay estado previo, verificar condiciones
    if (
      estadoVentaActual.estado === "PENDIENTE DE CARGA" ||
      estadoVentaActual.estado === "CREADO DOCU OK"
    ) {
      // DEBUG: Descomentar para debugging
      // console.log(
      //   "Estado previo permite actualización:",
      //   estadoVentaActual.estado,
      // );
      if (estadoNew.estado == undefined) {
        console.error("✗ ERROR: Estado nuevo no definido");
        return 0;
      }
      await this.estadoVentaModelDB.add({
        input: estadoNew,
      });
      return 1;
    }

    // Verificar si es el mismo usuario y el estado cambió
    if (
      estadoVentaActual.usuario_id ===
        "0219c4f7-a760-4365-99e2-20929b47fe99" &&
      estadoNew.usuario_id === "0219c4f7-a760-4365-99e2-20929b47fe99" &&
      estadoVentaActual.estado !== estadoNew.estado
    ) {
      // DEBUG: Descomentar para debugging
      // console.log("Usuario coincide y estado cambió, actualizando");
      await this.estadoVentaModelDB.add({
        input: estadoNew,
      });
      return 1;
    }

    // DEBUG: Descomentar para debugging
    // console.log(
    //   "Condiciones no cumplidas - Estado actual:",
    //   estadoVentaActual.estado,
    // );

    return 0;
  }

  async actualizarSegumientoLinea(ventaNew: VentaCreate): Promise<number> {
    if (!ventaNew) {
      return 0;
    }
    if (!ventaNew.sds) {
      return 0;
    }
    const ventaActual = await this.ventaModelDB.getBySDS({ sds: ventaNew.sds });
    if (!ventaActual) {
      await this.ventaModelDB.add({
        input: ventaNew,
      });
      //falta implemantacion para dispara una alerta motivo ausencia de carga ya que si se crea los datos por el siste
      // significa que el asesor no cargo en el gestor.
      return 1;
    } else if (ventaActual.sds === ventaNew.sds) {
      const ventaUpdate = VentaUpdateSchema.parse(ventaNew);
      await this.ventaModelDB.update({
        id: ventaActual.venta_id.toString(), // o string directamente
        input: ventaUpdate,
      });
      //falta implemantacion para dispara una alerta motivo mala carga ya que si se actualiza los datos por el siste
      // significa que el asesor cargo mal en el gestor.
      return 1;
    }
    return 0;
  }
}
