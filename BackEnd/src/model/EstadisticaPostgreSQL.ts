// ============================================
// BackEnd/src/model/EstadisticaPostgreSQL.ts
// Modelo para consultas de estadísticas
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import {
  EstadisticaFilters,
  EstadisticaResumen,
  RecargaInfo,
  RecargaDetallada,
  TopAsesorRecarga,
  TopCellRecarga,
  EstadisticaVendedor,
  EstadisticaCell,
  EstadisticaDetalle,
  EstadisticaCompleta,
} from "../interface/Estadistica.ts";

function convertBigIntToNumber(obj: any): any {
  if (typeof obj === "bigint") {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  if (obj !== null && typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

export class EstadisticaPostgreSQL {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  private getFechaInicio(periodo: string): Date {
    const now = new Date();
    switch (periodo) {
      case "HOY":
        return new Date(now.setHours(0, 0, 0, 0));
      case "SEMANA":
        return new Date(now.setDate(now.getDate() - 7));
      case "MES":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "SEMESTRE":
        return new Date(new Date().setDate(new Date().getDate() - 180));
      case "AÑO":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case "TODO":
      default:
        return new Date(0);
    }
  }

  /**
   * Construye el WHERE base (fecha_creacion, vendedor, celula) y por separado
   * las condiciones de portación (p.fecha_portacion).
   *
   * Las condiciones de portación SOLO deben concatenarse en queries que
   * incluyan `LEFT JOIN portabilidad p`. Mezclarlas en el WHERE base causaba
   * el error "missing FROM-clause entry for table p" en queries sin ese JOIN.
   */
  private buildWhereClause(filters: EstadisticaFilters) {
    const { periodo, cellaId, asesorId, userId, userRol, fechaPortacionDesde, fechaPortacionHasta } = filters;
    const fechaInicio = this.getFechaInicio(periodo);

    let whereClause = "WHERE v.fecha_creacion >= $1";
    const values: any[] = [fechaInicio];
    let paramIndex = 2;

    if (userRol === "VENDEDOR") {
      whereClause += ` AND v.vendedor_id = $${paramIndex++}`;
      values.push(userId);
    } else if (asesorId) {
      whereClause += ` AND v.vendedor_id = $${paramIndex++}`;
      values.push(asesorId);
    }

    if (cellaId) {
      whereClause += ` AND u.celula = $${paramIndex++}`;
      values.push(cellaId);
    }

    // Condiciones de portación separadas: solo para queries con JOIN portabilidad p
    let portacionClause = "";
    if (fechaPortacionDesde) {
      portacionClause += ` AND p.fecha_portacion >= $${paramIndex++}`;
      values.push(fechaPortacionDesde);
    }
    if (fechaPortacionHasta) {
      portacionClause += ` AND p.fecha_portacion <= $${paramIndex++}`;
      values.push(fechaPortacionHasta);
    }

    return { whereClause, portacionClause, values, paramIndex };
  }

  async getEstadisticas(filters: EstadisticaFilters): Promise<EstadisticaCompleta> {
    const client = this.connection.getClient();
    const { whereClause, portacionClause, values } = this.buildWhereClause(filters);

    // Todas las queries de getEstadisticas incluyen LEFT JOIN portabilidad p,
    // por lo que pueden usar whereClause + portacionClause de forma segura.

    const resumenQuery = `
      SELECT
        COUNT(*) as total_ventas,
        COUNT(*) FILTER (WHERE e.estado = 'AGENDADO') as agendados,
        COUNT(*) FILTER (WHERE e.estado = 'APROBADO ABD') as aprobado_abd,
        COUNT(*) FILTER (WHERE e.estado IN ('RECHAZADO DONANTE', 'RECHAZADO ABD', 'RECHAZADO')) as rechazados,
        COUNT(*) FILTER (WHERE ec.estado NOT IN ('ENTREGADO', 'RENDIDO AL CLIENTE') OR ec.estado IS NULL) as no_entregados,
        COUNT(*) FILTER (WHERE ec.estado IN ('ENTREGADO', 'RENDIDO AL CLIENTE')) as entregados,
        COUNT(*) FILTER (WHERE ec.estado = 'RENDIDO AL CLIENTE') as rendidos,
        COUNT(*) FILTER (WHERE e.estado = 'ACTIVADO NRO PORTADO') as activado_portado,
        COUNT(*) FILTER (WHERE e.estado IN ('ACTIVADO NRO CLARO', 'ACTIVADO')) as activado_claro,
        COUNT(*) FILTER (WHERE e.estado = 'CANCELADO') as cancelados,
        COUNT(*) FILTER (WHERE e.estado = 'SPN CANCELADA') as sp_cancelados,
        COUNT(*) FILTER (WHERE e.estado IN ('PENDIENTE DOCU/PIN', 'PENDIENTE CARGA PIN')) as pendiente_pin
      FROM venta v
      INNER JOIN (
        SELECT DISTINCT ON (venta_id) venta_id, estado
        FROM estado 
        ORDER BY venta_id, fecha_creacion DESC
      ) e ON v.venta_id = e.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      LEFT JOIN LATERAL (
        SELECT estado
        FROM estado_correo
        WHERE sap_id = v.sap OR (v.sap IS NULL AND sap_id IS NULL)
        ORDER BY fecha_creacion DESC
        LIMIT 1
      ) ec ON true
      LEFT JOIN portabilidad p ON v.venta_id = p.venta_id
      ${whereClause}${portacionClause}
    `;

    const resumenResult = await client.queryObject(resumenQuery, [...values]);
    const r = resumenResult.rows[0] as any;
    const totalVentas = Number(r.total_ventas) || 0;
    const totalParaPorc = totalVentas || 1;

    const resumen: EstadisticaResumen = {
      totalVentas,
      agendados: Number(r.agendados) || 0,
      aprobadoAbd: Number(r.aprobado_abd) || 0,
      rechazados: Number(r.rechazados) || 0,
      noEntregados: Number(r.no_entregados) || 0,
      entregados: Number(r.entregados) || 0,
      rendidos: Number(r.rendidos) || 0,
      activadoPortado: Number(r.activado_portado) || 0,
      activadoClaro: Number(r.activado_claro) || 0,
      cancelados: Number(r.cancelados) || 0,
      spCancelados: Number(r.sp_cancelados) || 0,
      pendientePin: Number(r.pendiente_pin) || 0,

      percAgendados: Number(((Number(r.agendados) / totalParaPorc) * 100).toFixed(2)),
      percAprobadoAbd: Number(((Number(r.aprobado_abd) / totalParaPorc) * 100).toFixed(2)),
      percRechazados: Number(((Number(r.rechazados) / totalParaPorc) * 100).toFixed(2)),
      percNoEntregados: Number(((Number(r.no_entregados) / totalParaPorc) * 100).toFixed(2)),
      percEntregados: Number(((Number(r.entregados) / totalParaPorc) * 100).toFixed(2)),
      percRendidos: Number(((Number(r.rendidos) / totalParaPorc) * 100).toFixed(2)),
      percActivadoPortado: Number(((Number(r.activado_portado) / totalParaPorc) * 100).toFixed(2)),
      percActivadoClaro: Number(((Number(r.activado_claro) / totalParaPorc) * 100).toFixed(2)),
      percCancelados: Number(((Number(r.cancelados) / totalParaPorc) * 100).toFixed(2)),
      percSpCancelados: Number(((Number(r.sp_cancelados) / totalParaPorc) * 100).toFixed(2)),
      percPendientePin: Number(((Number(r.pendiente_pin) / totalParaPorc) * 100).toFixed(2)),
    };

    const ventasPorVendedorQuery = `
      SELECT
        v.vendedor_id,
        CONCAT(pv.nombre, ' ', pv.apellido) as vendedor_nombre,
        u.legajo as legajo,
        u.exa as exa,
        pv.email as email,
        u.celula as cella_id,
        COALESCE(c.nombre, 'Sin Célula') as cella_nombre,
        COUNT(*) as total_ventas,
        COUNT(*) FILTER (WHERE e.estado = 'AGENDADO') as agendados,
        COUNT(*) FILTER (WHERE e.estado = 'APROBADO ABD') as aprobado_abd,
        COUNT(*) FILTER (WHERE e.estado IN ('RECHAZADO DONANTE', 'RECHAZADO ABD', 'RECHAZADO')) as rechazados,
        COUNT(*) FILTER (WHERE ec.estado NOT IN ('ENTREGADO', 'RENDIDO AL CLIENTE') OR ec.estado IS NULL) as no_entregados,
        COUNT(*) FILTER (WHERE ec.estado IN ('ENTREGADO', 'RENDIDO AL CLIENTE')) as entregados,
        COUNT(*) FILTER (WHERE ec.estado = 'RENDIDO AL CLIENTE') as rendidos,
        COUNT(*) FILTER (WHERE e.estado = 'ACTIVADO NRO PORTADO') as activado_portado,
        COUNT(*) FILTER (WHERE e.estado IN ('ACTIVADO NRO CLARO', 'ACTIVADO')) as activado_claro,
        COUNT(*) FILTER (WHERE e.estado = 'CANCELADO') as cancelados,
        COUNT(*) FILTER (WHERE e.estado = 'SPN CANCELADA') as sp_cancelados,
        COUNT(*) FILTER (WHERE e.estado IN ('PENDIENTE DOCU/PIN', 'PENDIENTE CARGA PIN')) as pendiente_pin
      FROM venta v
      INNER JOIN (
        SELECT DISTINCT ON (venta_id) venta_id, estado
        FROM estado 
        ORDER BY venta_id, fecha_creacion DESC
      ) e ON v.venta_id = e.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      INNER JOIN persona pv ON u.persona_id = pv.persona_id
      LEFT JOIN LATERAL (
        SELECT estado
        FROM estado_correo
        WHERE sap_id = v.sap OR (v.sap IS NULL AND sap_id IS NULL)
        ORDER BY fecha_creacion DESC
        LIMIT 1
      ) ec ON true
      LEFT JOIN portabilidad p ON v.venta_id = p.venta_id
      LEFT JOIN celula c ON u.celula = c.id_celula
      ${whereClause}${portacionClause}
      GROUP BY v.vendedor_id, pv.nombre, pv.apellido, u.legajo, u.exa, pv.email, u.celula, c.nombre
      ORDER BY total_ventas DESC
      LIMIT 20
    `;

    const vendedorResult = await client.queryObject(ventasPorVendedorQuery, [...values]);
    const ventasPorVendedor: EstadisticaVendedor[] = (vendedorResult.rows || []).map((row: any) => {
      const rowTotal = Number(row.total_ventas) || 1;
      const activados = Number(row.activado_portado) + Number(row.activado_claro);
      return {
        vendedorId: row.vendedor_id,
        vendedorNombre: row.vendedor_nombre,
        legajo: row.legajo || '',
        exa: row.exa || '',
        email: row.email || '',
        cellaId: row.cella_id,
        cellaNombre: row.cella_nombre,
        totalVentas: Number(row.total_ventas),
        agendados: Number(row.agendados),
        aprobadoAbd: Number(row.aprobado_abd),
        rechazados: Number(row.rechazados),
        noEntregados: Number(row.no_entregados),
        entregados: Number(row.entregados),
        rendidos: Number(row.rendidos),
        activadoPortado: Number(row.activado_portado),
        activadoClaro: Number(row.activado_claro),
        cancelados: Number(row.cancelados),
        spCancelados: Number(row.sp_cancelados),
        pendientePin: Number(row.pendiente_pin),
        percActivados: Number(((activados / rowTotal) * 100).toFixed(2)),
      };
    });

    const ventasPorCellQuery = `
      SELECT
        u.celula as cella_id,
        COALESCE(c.nombre, 'Sin Célula') as cella_nombre,
        COUNT(*) as total_ventas,
        COUNT(*) FILTER (WHERE e.estado = 'AGENDADO') as agendados,
        COUNT(*) FILTER (WHERE e.estado = 'APROBADO ABD') as aprobado_abd,
        COUNT(*) FILTER (WHERE e.estado IN ('RECHAZADO DONANTE', 'RECHAZADO ABD', 'RECHAZADO')) as rechazados,
        COUNT(*) FILTER (WHERE ec.estado NOT IN ('ENTREGADO', 'RENDIDO AL CLIENTE') OR ec.estado IS NULL) as no_entregados,
        COUNT(*) FILTER (WHERE ec.estado IN ('ENTREGADO', 'RENDIDO AL CLIENTE')) as entregados,
        COUNT(*) FILTER (WHERE ec.estado = 'RENDIDO AL CLIENTE') as rendidos,
        COUNT(*) FILTER (WHERE e.estado = 'ACTIVADO NRO PORTADO') as activado_portado,
        COUNT(*) FILTER (WHERE e.estado IN ('ACTIVADO NRO CLARO', 'ACTIVADO')) as activado_claro,
        COUNT(*) FILTER (WHERE e.estado = 'CANCELADO') as cancelados,
        COUNT(*) FILTER (WHERE e.estado = 'SPN CANCELADA') as sp_cancelados,
        COUNT(*) FILTER (WHERE e.estado IN ('PENDIENTE DOCU/PIN', 'PENDIENTE CARGA PIN')) as pendiente_pin
      FROM venta v
      INNER JOIN (
        SELECT DISTINCT ON (venta_id) venta_id, estado
        FROM estado 
        ORDER BY venta_id, fecha_creacion DESC
      ) e ON v.venta_id = e.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      LEFT JOIN LATERAL (
        SELECT estado
        FROM estado_correo
        WHERE sap_id = v.sap OR (v.sap IS NULL AND sap_id IS NULL)
        ORDER BY fecha_creacion DESC
        LIMIT 1
      ) ec ON true
      LEFT JOIN portabilidad p ON v.venta_id = p.venta_id
      LEFT JOIN celula c ON u.celula = c.id_celula
      ${whereClause}${portacionClause}
      GROUP BY u.celula, c.nombre
      ORDER BY total_ventas DESC
    `;

    const cellResult = await client.queryObject(ventasPorCellQuery, [...values]);
    const ventasPorCell: EstadisticaCell[] = (cellResult.rows || []).map((row: any) => {
      const rowTotal = Number(row.total_ventas) || 1;
      const activados = Number(row.activado_portado) + Number(row.activado_claro);
      return {
        cellaId: row.cella_id,
        cellaNombre: row.cella_nombre,
        totalVentas: Number(row.total_ventas),
        agendados: Number(row.agendados),
        aprobadoAbd: Number(row.aprobado_abd),
        rechazados: Number(row.rechazados),
        noEntregados: Number(row.no_entregados),
        entregados: Number(row.entregados),
        rendidos: Number(row.rendidos),
        activadoPortado: Number(row.activado_portado),
        activadoClaro: Number(row.activado_claro),
        cancelados: Number(row.cancelados),
        spCancelados: Number(row.sp_cancelados),
        pendientePin: Number(row.pendiente_pin),
        percActivados: Number(((activados / rowTotal) * 100).toFixed(2)),
      };
    });

    const detalleQuery = `
      SELECT
        v.venta_id,
        v.sds,
        v.sap,
        v.tipo_venta,
        e.estado,
        TO_CHAR(v.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha_creacion,
        p.fecha_portacion,
        CONCAT(pc.nombre, ' ', pc.apellido) as cliente_nombre,
        pc.documento as cliente_documento,
        pc.email as cliente_email,
        v.vendedor_id,
        CONCAT(pv.nombre, ' ', pv.apellido) as vendedor_nombre,
        u.legajo as vendedor_legajo,
        u.exa as vendedor_exa,
        pv.email as vendedor_email,
        COALESCE(c.nombre, 'Sin Célula') as cella_nombre
      FROM venta v
      INNER JOIN (
        SELECT DISTINCT ON (venta_id) venta_id, estado
        FROM estado 
        ORDER BY venta_id, fecha_creacion DESC
      ) e ON v.venta_id = e.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      INNER JOIN persona pv ON u.persona_id = pv.persona_id
      INNER JOIN cliente cl ON v.cliente_id = cl.persona_id
      INNER JOIN persona pc ON cl.persona_id = pc.persona_id
      LEFT JOIN portabilidad p ON v.venta_id = p.venta_id
      LEFT JOIN celula c ON u.celula = c.id_celula
      ${whereClause}${portacionClause}
      ORDER BY v.fecha_creacion DESC
      LIMIT 200
    `;

    const detalleResult = await client.queryObject(detalleQuery, [...values]);
    const detalle: EstadisticaDetalle[] = (detalleResult.rows || []).map((row: any) => ({
      ventaId: row.venta_id,
      sds: row.sds,
      sap: row.sap,
      tipoVenta: row.tipo_venta,
      estado: row.estado,
      fechaCreacion: row.fecha_creacion,
      fechaPortacion: row.fecha_portacion,
      clienteNombre: row.cliente_nombre,
      clienteDocumento: row.cliente_documento,
      clienteEmail: row.cliente_email,
      vendedorId: row.vendedor_id,
      vendedorNombre: row.vendedor_nombre,
      vendedorLegajo: row.vendedor_legajo || '',
      vendedorExa: row.vendedor_exa || '',
      vendedorEmail: row.vendedor_email || '',
      cellaNombre: row.cella_nombre,
    }));

    const recargas = await this.getRecargasDetalladas(filters);

    const totalActivados = resumen.activadoPortado + resumen.activadoClaro;
    const tasaConversion = totalVentas > 0
      ? Number(((totalActivados / totalVentas) * 100).toFixed(2))
      : 0;

    return convertBigIntToNumber({
      resumen,
      ventasPorVendedor,
      ventasPorCell,
      detalle,
      recargas,
      totales: {
        totalVentas,
        totalActivados,
        tasaConversion,
      },
    });
  }

  async getRecargasDetalladas(filters: EstadisticaFilters): Promise<RecargaDetallada> {
    const { periodo, cellaId, userId, userRol } = filters;
    const fechaInicio = this.getFechaInicio(periodo);
    const client = this.connection.getClient();

    // Filtra por v.fecha_creacion: portabilidad no tiene fecha_creacion en el esquema.
    let whereClause = "WHERE v.fecha_creacion >= $1";
    const values: any[] = [fechaInicio];
    let paramIndex = 2;

    if (userRol === "VENDEDOR") {
      whereClause += ` AND v.vendedor_id = $${paramIndex++}`;
      values.push(userId);
    }

    if (cellaId) {
      whereClause += ` AND u.celula = $${paramIndex++}`;
      values.push(cellaId);
    }

    const totalRecargasQuery = `
      SELECT
        COUNT(DISTINCT sub.numero_portar) as total_recargas,
        SUM(sub.cantidad) as total_portaciones
      FROM (
        SELECT p.numero_portar, COUNT(*) as cantidad
        FROM portabilidad p
        INNER JOIN venta v ON p.venta_id = v.venta_id
        INNER JOIN usuario u ON v.vendedor_id = u.persona_id
        ${whereClause}
        AND p.numero_portar IS NOT NULL
        GROUP BY p.numero_portar
        HAVING COUNT(*) > 1
      ) sub
    `;

    const totalResult = await client.queryObject(totalRecargasQuery, [...values]);
    const totalRecargas = Number(totalResult.rows[0]?.total_recargas) || 0;
    const totalPortacionesRecargadas = Number(totalResult.rows[0]?.total_portaciones) || 0;

    const topAsesorQuery = `
      SELECT
        v.vendedor_id,
        CONCAT(pv.nombre, ' ', pv.apellido) as vendedor_nombre,
        COUNT(*) as cantidad_recargas
      FROM portabilidad p
      INNER JOIN venta v ON p.venta_id = v.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      INNER JOIN persona pv ON u.persona_id = pv.persona_id
      ${whereClause}
      AND p.numero_portar IS NOT NULL
      AND p.numero_portar IN (
        SELECT p2.numero_portar
        FROM portabilidad p2
        INNER JOIN venta v2 ON p2.venta_id = v2.venta_id
        WHERE v2.fecha_creacion >= $1
          AND p2.numero_portar IS NOT NULL
        GROUP BY p2.numero_portar
        HAVING COUNT(*) > 1
      )
      GROUP BY v.vendedor_id, pv.nombre, pv.apellido
      ORDER BY cantidad_recargas DESC
      LIMIT 5
    `;

    const topAsesorResult = await client.queryObject(topAsesorQuery, [...values]);
    const topAsesorRecargas: TopAsesorRecarga[] = (topAsesorResult.rows || []).map((row: any) => ({
      vendedorId: row.vendedor_id,
      vendedorNombre: row.vendedor_nombre,
      cantidadRecargas: Number(row.cantidad_recargas),
    }));

    const topCellQuery = `
      SELECT
        u.celula as cella_id,
        COALESCE(c.nombre, 'Sin Célula') as cella_nombre,
        COUNT(*) as cantidad_recargas
      FROM portabilidad p
      INNER JOIN venta v ON p.venta_id = v.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      LEFT JOIN celula c ON u.celula = c.id_celula
      ${whereClause}
      AND p.numero_portar IS NOT NULL
      AND p.numero_portar IN (
        SELECT p2.numero_portar
        FROM portabilidad p2
        INNER JOIN venta v2 ON p2.venta_id = v2.venta_id
        WHERE v2.fecha_creacion >= $1
          AND p2.numero_portar IS NOT NULL
        GROUP BY p2.numero_portar
        HAVING COUNT(*) > 1
      )
      GROUP BY u.celula, c.nombre
      ORDER BY cantidad_recargas DESC
      LIMIT 5
    `;

    const topCellResult = await client.queryObject(topCellQuery, [...values]);
    const topCellRecargas: TopCellRecarga[] = (topCellResult.rows || []).map((row: any) => ({
      cellaId: row.cella_id,
      cellaNombre: row.cella_nombre,
      cantidadRecargas: Number(row.cantidad_recargas),
    }));

    const numerosRecargadosQuery = `
      SELECT
        p.numero_portar,
        COUNT(*) as cantidad_portaciones,
        MAX(p.venta_id) as ultima_venta_id,
        MAX(v.fecha_creacion) as ultima_fecha
      FROM portabilidad p
      INNER JOIN venta v ON p.venta_id = v.venta_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      ${whereClause}
      AND p.numero_portar IS NOT NULL
      GROUP BY p.numero_portar
      HAVING COUNT(*) > 1
      ORDER BY cantidad_portaciones DESC
      LIMIT 50
    `;

    const numerosResult = await client.queryObject(numerosRecargadosQuery, [...values]);
    const numerosRecargados: RecargaInfo[] = (numerosResult.rows || []).map((row: any) => ({
      numeroPortar: row.numero_portar,
      cantidadPortaciones: Number(row.cantidad_portaciones),
      ultimaVentaId: Number(row.ultima_venta_id),
      ultimaFecha: row.ultima_fecha,
    }));

    return {
      totalRecargas,
      totalPortacionesRecargadas,
      topAsesorRecargas,
      topCellRecargas,
      numerosRecargados,
    };
  }
}