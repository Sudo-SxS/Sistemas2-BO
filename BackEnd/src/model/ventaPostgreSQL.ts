// model/ventaPostgreSQL.ts
// ============================================
// Modelo Venta para PostgreSQL con conexión resiliente
// Sistema que siempre funciona aunque la BD no esté disponible
// ============================================

import { PostgresClient } from "../database/PostgreSQL.ts";
import { logger } from "../Utils/logger.ts";
import { VentaModelDB } from "../interface/venta.ts";
import { Venta, VentaCreate } from "../schemas/venta/Venta.ts";

interface VentaRow {
  venta_id: number;
  sds: string;
  chip: string;
  stl: string;
  tipo_venta: string;
  sap: string;
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  promocion_id: number | null;
  empresa_origen_id: number;
  fecha_creacion: Date;
}

// Función helper para convertir BigInt a Number recursivamente
function convertBigIntToNumber(obj: any): any {
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  if (obj !== null && typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntToNumber(obj[key]);
    }
    return converted;
  }
  return obj;
}

export class VentaPostgreSQL implements VentaModelDB {
  connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  private mapRowToVenta(row: VentaRow): Venta {
    return {
      venta_id: row.venta_id,
      sds: row.sds,
      chip: row.chip as "SIM" | "ESIM",
      stl: row.stl,
      tipo_venta: row.tipo_venta as "PORTABILIDAD" | "LINEA_NUEVA",
      sap: row.sap,
      cliente_id: row.cliente_id,
      vendedor_id: row.vendedor_id,
      multiple: row.multiple,
      plan_id: row.plan_id,
      promocion_id: row.promocion_id as number,
      empresa_origen_id: row.empresa_origen_id,
      fecha_creacion: row.fecha_creacion,
    };
  }

  async getAll(
    params: { page?: number; limit?: number } = {},
  ): Promise<Venta[]> {
    const { page = 1, limit = 10 } = params;
    const offset = (page - 1) * limit;

    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    logger.debug("Venta rows:", result.rows || []);

    return ((result.rows || []) as VentaRow[]).map((row: VentaRow) => 
      convertBigIntToNumber(this.mapRowToVenta(row))
    );
  }

  async getById({ id }: { id: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE venta_id = $1`,
      [id]
    );

    if (!result.rows.length) return undefined;

    return convertBigIntToNumber(this.mapRowToVenta(result.rows[0] as VentaRow));
  }

  async getBySDS({ sds }: { sds: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE sds = $1`,
      [sds]
    );

    if (!result.rows.length) return undefined;

    return convertBigIntToNumber(this.mapRowToVenta(result.rows[0] as VentaRow));
  }

  async getBySPN({ spn }: { spn: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `SELECT * FROM venta WHERE sap = $1`,
      [spn]
    );

    return result.rows?.[0] as Venta | undefined;
  }

  async getBySAP({ sap }: { sap: string }): Promise<Venta | undefined> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE sap = $1`,
      [sap]
    );

    if (!result.rows.length) return undefined;

    return convertBigIntToNumber(this.mapRowToVenta(result.rows[0] as VentaRow));
  }

  async add({ input }: { input: VentaCreate }): Promise<Venta> {
    const {
      sds,
      chip,
      stl,
      tipo_venta,
      sap,
      cliente_id,
      vendedor_id,
      multiple,
      plan_id,
      promocion_id,
      empresa_origen_id,
    } = input;

    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `INSERT INTO venta (sds, chip, stl, tipo_venta, sap, cliente_id, vendedor_id, multiple, plan_id, promocion_id, empresa_origen_id, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        sds,
        chip,
        stl,
        tipo_venta,
        sap,
        cliente_id,
        vendedor_id,
        multiple,
        plan_id,
        promocion_id,
        empresa_origen_id,
        new Date(),
      ],
    );

    const newVenta = result.rows[0];
    return convertBigIntToNumber(this.mapRowToVenta(newVenta as VentaRow));
  }

  async update(
    { id, input }: { id: string; input: Partial<Venta> },
  ): Promise<Venta | undefined> {
    const fields = [];
    const values: (string | number | null)[] = [];

    if (input.sds !== undefined) {
      fields.push(`sds = $${values.length + 1}`);
      values.push(input.sds);
    }
    if (input.stl !== undefined) {
      fields.push(`stl = $${values.length + 1}`);
      values.push(input.stl);
    }
    if (input.cliente_id !== undefined) {
      fields.push(`cliente_id = $${values.length + 1}`);
      values.push(input.cliente_id);
    }
    if (input.vendedor_id !== undefined) {
      fields.push(`vendedor_id = $${values.length + 1}`);
      values.push(input.vendedor_id);
    }
    if (input.sap !== undefined) {
      fields.push(`sap = $${values.length + 1}`);
      values.push(input.sap);
    }
    if (input.chip !== undefined) {
      fields.push(`chip = $${values.length + 1}`);
      values.push(input.chip);
    }

    if (input.plan_id !== undefined) {
      fields.push(`plan_id = $${values.length + 1}`);
      values.push(input.plan_id);
    }
    if (input.promocion_id !== undefined) {
      fields.push(`promocion_id = $${values.length + 1}`);
      values.push(input.promocion_id);
    }
    if (input.multiple !== undefined) {
      fields.push(`multiple = $${values.length + 1}`);
      values.push(input.multiple);
    }

    if (fields.length === 0) return undefined;

    values.push(id);

    const client = this.connection.getClient();
    const result = await client.queryObject(
      `UPDATE venta SET ${fields.join(", ")} WHERE venta_id = $${values.length}`,
      values
    );

    if (result.rowCount !== undefined && result.rowCount > 0) {
      return await this.getById({ id });
    }

    return undefined;
  }

  async delete({ id }: { id: string }): Promise<boolean> {
    const client = this.connection.getClient();
    const result = await client.queryObject(
      `DELETE FROM venta WHERE venta_id = $1`,
      [id]
    );

    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getByVendedor({ vendedor }: { vendedor: string }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE vendedor_id = $1`,
      [vendedor]
    );

    return (result.rows || []).map((row) => this.mapRowToVenta(row as VentaRow));
  }

  async getByCliente({ cliente }: { cliente: string }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE cliente_id = $1`,
      [cliente]
    );

    return (result.rows || []).map((row) => this.mapRowToVenta(row as VentaRow));
  }

  async getByPlan({ plan }: { plan: number }): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE plan_id = $1`,
      [plan]
    );

    return (result.rows || []).map((row) => this.mapRowToVenta(row as VentaRow));
  }

  async getByDateRange(
    { start, end }: { start: Date; end: Date },
  ): Promise<Venta[]> {
    const client = this.connection.getClient();
    const result = await client.queryObject<VentaRow>(
      `SELECT * FROM venta WHERE fecha_creacion BETWEEN $1 AND $2`,
      [start, end]
    );

    return (result.rows || []).map((row) => this.mapRowToVenta(row as VentaRow));
  }

  async getStatistics(): Promise<{
    totalVentas: number;
    ventasPorPlan: Array<
      { plan_id: number; plan_nombre: string; cantidad: number }
    >;
    ventasPorVendedor: Array<
      { vendedor_id: string; vendedor_nombre: string; cantidad: number }
    >;
    ventasPorMes: Array<{ mes: string; cantidad: number }>;
  }> {
    // Total ventas
    const client = this.connection.getClient();
    const totalResult = await client.queryObject(
      `SELECT COUNT(*) as total FROM venta`
    );
    
    const totalVentas = (totalResult.rows[0] as { total: number })?.total || 0;

    // Ventas por plan
    const planResult = await client.queryObject(
      `SELECT p.plan_id, p.nombre, COUNT(*) as cantidad
      FROM plan p
      LEFT JOIN venta v ON p.plan_id = v.plan_id
      GROUP BY p.plan_id, p.nombre`
    );
    
    const ventasPorPlan = (planResult.rows || []).map((
      row: any,
    ) => ({
      plan_id: row.plan_id,
      plan_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por vendedor
    const vendedorResult = await client.queryObject(`
      SELECT v.vendedor_id, CONCAT(pe.nombre, ' ', pe.apellido) as nombre, COUNT(*) as cantidad
      FROM venta v
      INNER JOIN usuario u ON u.persona_id = v.vendedor_id
      INNER JOIN persona pe ON pe.persona_id = u.persona_id
      GROUP BY v.vendedor_id, pe.nombre, pe.apellido
    `);
    
    const ventasPorVendedor = (vendedorResult.rows || []).map((
      row: any,
    ) => ({
      vendedor_id: row.vendedor_id,
      vendedor_nombre: row.nombre,
      cantidad: row.cantidad,
    }));

    // Ventas por mes - DATE_FORMAT → TO_CHAR
    const mesResult = await client.queryObject(`
      SELECT TO_CHAR(fecha_creacion, 'YYYY-MM') as mes, COUNT(*) as cantidad
      FROM venta
      GROUP BY mes
      ORDER BY mes
    `);

    const ventasPorMes = (mesResult.rows || []).map((row: any) => ({
      mes: row.mes,
      cantidad: row.cantidad,
    }));

    return {
      totalVentas,
      ventasPorPlan,
      ventasPorVendedor,
      ventasPorMes,
    };
  }

  // ============================================
  // NUEVO MÉTODO: getVentasUI
  // Devuelve ventas con todos los JOINs necesarios para la UI
  // Con paginación, filtros y lógica de permisos (vendedor solo ve sus ventas)
  // ============================================
  async getVentasUI(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string;
    userRol?: string;
  }): Promise<{ ventas: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 50, startDate, endDate, search, userId, userRol } = params;
    const offset = (page - 1) * limit;

    const client = this.connection.getClient();

    // Construir condiciones WHERE dinámicamente
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Filtro por vendedor (solo si es VENDEDOR)
    if (userId && userRol === 'VENDEDOR') {
      conditions.push(`v.vendedor_id = $${paramIndex++}`);
      values.push(userId);
    }

    // Filtro por fecha inicio
    if (startDate) {
      conditions.push(`v.fecha_creacion >= $${paramIndex++}`);
      values.push(startDate);
    }

    // Filtro por fecha fin
    if (endDate) {
      conditions.push(`v.fecha_creacion <= $${paramIndex++}`);
      values.push(endDate);
    }

    // Filtro por búsqueda
    if (search) {
      conditions.push(`(v.sds ILIKE $${paramIndex} OR p_cliente.nombre ILIKE $${paramIndex} OR p_cliente.documento ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query principal con JOINs y DISTINCT ON
    const query = `
      SELECT DISTINCT ON (v.venta_id)
        v.venta_id, v.sds, v.chip, v.stl, v.tipo_venta, 
        TO_CHAR(v.fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as fecha_creacion,
        p_cliente.nombre as cliente_nombre, 
        p_cliente.apellido as cliente_apellido,
        p_cliente.tipo_documento as cliente_tipo_documento,
        p_cliente.documento as cliente_documento, 
        p_cliente.email as cliente_email,
        p_cliente.telefono as cliente_telefono,
        p_vendedor.nombre as vendedor_nombre, 
        p_vendedor.apellido as vendedor_apellido,
        p_supervisor.nombre as supervisor_nombre, 
        p_supervisor.apellido as supervisor_apellido,
        pl.nombre as plan_nombre, 
        pl.precio as plan_precio,
        pr.nombre as promocion_nombre,
        pr.descuento as promocion_descuento,
        eo.nombre_empresa as empresa_origen_nombre,
        (SELECT estado FROM estado WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as estado_actual,
        (SELECT estado FROM estado_correo WHERE sap_id = v.sap ORDER BY fecha_creacion DESC LIMIT 1) as correo_estado,
        po.numero_portar, po.empresa_origen as operador_origen_nombre, po.mercado_origen,
        (SELECT titulo FROM comentario WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as ultimo_comentario_titulo,
        (SELECT comentario FROM comentario WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as ultimo_comentario,
        (SELECT TO_CHAR(fecha_creacion, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') FROM comentario WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as fecha_ultimo_comentario
      FROM venta v
      INNER JOIN cliente c ON v.cliente_id = c.persona_id
      INNER JOIN persona p_cliente ON c.persona_id = p_cliente.persona_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      INNER JOIN persona p_vendedor ON u.persona_id = p_vendedor.persona_id
      LEFT JOIN usuario u_supervisor ON u.celula = u_supervisor.celula AND u_supervisor.rol = 'SUPERVISOR'
      LEFT JOIN supervisor sup ON u_supervisor.persona_id = sup.usuario_id
      LEFT JOIN persona p_supervisor ON u_supervisor.persona_id = p_supervisor.persona_id
      INNER JOIN plan pl ON v.plan_id = pl.plan_id
      LEFT JOIN promocion pr ON v.promocion_id = pr.promocion_id
      LEFT JOIN empresa_origen eo ON v.empresa_origen_id = eo.empresa_origen_id
      LEFT JOIN portabilidad po ON v.venta_id = po.venta_id
      LEFT JOIN linea_nueva ln ON v.venta_id = ln.venta_id
      ${whereClause}
      ORDER BY v.venta_id, v.fecha_creacion DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    values.push(limit, offset);

    const result = await client.queryObject(query, values);

    // Eliminar duplicados por si acaso y ordenar por fecha
    const seen = new Set<string>();
    const uniqueRows: any[] = [];
    const rows = result.rows as any[] || [];
    for (const row of rows) {
      const key = String(row.venta_id);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRows.push(row);
      }
    }

    // Ordenar por fecha DESC (más reciente primero)
    uniqueRows.sort((a, b) => {
      const dateA = new Date(a.fecha_creacion).getTime();
      const dateB = new Date(b.fecha_creacion).getTime();
      return dateB - dateA;
    });

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM venta v
      INNER JOIN cliente c ON v.cliente_id = c.persona_id
      INNER JOIN persona p_cliente ON c.persona_id = p_cliente.persona_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      ${whereClause}
    `;
    const countValues = values.slice(0, -2);
    const countResult = await client.queryObject(countQuery, countValues);

    const total = (countResult.rows[0] as { total: number })?.total || 0;

    return {
      ventas: uniqueRows.map((row: any) => convertBigIntToNumber(row)),
      total,
      page,
      limit,
    };
  }

  // ============================================
  // NUEVO MÉTODO: getVentaDetalleCompleto
  // Devuelve todos los datos de una venta (detalle completo)
  // ============================================
  async getVentaDetalleCompleto(ventaId: number): Promise<any | undefined> {
    const client = this.connection.getClient();

    // Query principal de la venta con todos los JOINs
    const ventaQuery = `
      SELECT 
        v.*,
        -- Cliente
        p_cliente.nombre as cliente_nombre, 
        p_cliente.apellido as cliente_apellido,
        p_cliente.documento as cliente_documento, 
        p_cliente.email as cliente_email,
        p_cliente.telefono as cliente_telefono,
        p_cliente.tipo_documento as cliente_tipo_documento,
        p_cliente.genero as cliente_genero,
        p_cliente.fecha_nacimiento as cliente_fecha_nacimiento,
        p_cliente.nacionalidad as cliente_nacionalidad,
        -- Vendedor
        p_vendedor.nombre as vendedor_nombre, 
        p_vendedor.apellido as vendedor_apellido,
        p_vendedor.email as vendedor_email,
        p_vendedor.telefono as vendedor_telefono,
        u.legajo as vendedor_legajo,
        u.exa as vendedor_exa,
        u.celula as vendedor_celula,
        -- Supervisor
        sup.supervisor_id as supervisor_id,
        p_supervisor.nombre as supervisor_nombre, 
        p_supervisor.apellido as supervisor_apellido,
        p_supervisor.email as supervisor_email,
        u_supervisor.legajo as supervisor_legajo,
        -- Plan
        pl.nombre as plan_nombre, 
        pl.precio as plan_precio,
        pl.beneficios as plan_descripcion,
        pl.gigabyte as plan_gigabyte,
        pl.llamadas as plan_llamadas,
        pl.mensajes as plan_mensajes,
        pl.whatsapp as plan_whatsapp,
        pl.roaming as plan_roaming,
        -- Promoción
        pr.nombre as promocion_nombre,
        pr.descuento as promocion_descuento,
        pr.beneficios as promocion_beneficios,
        -- Empresa origen
        eo.nombre_empresa as empresa_origen_nombre,
        eo.pais as empresa_origen_pais,
        -- Estado actual (subquery)
        (SELECT estado FROM estado WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as estado_actual,
        (SELECT descripcion FROM estado WHERE venta_id = v.venta_id ORDER BY fecha_creacion DESC LIMIT 1) as estado_descripcion,
        -- Estado correo actual (subquery)
        (SELECT estado FROM estado_correo WHERE sap_id = v.sap ORDER BY fecha_creacion DESC LIMIT 1) as correo_estado_actual,
        (SELECT ubicacion_actual FROM estado_correo WHERE sap_id = v.sap ORDER BY fecha_creacion DESC LIMIT 1) as correo_ubicacion
      FROM venta v
      INNER JOIN cliente c ON v.cliente_id = c.persona_id
      INNER JOIN persona p_cliente ON c.persona_id = p_cliente.persona_id
      INNER JOIN usuario u ON v.vendedor_id = u.persona_id
      INNER JOIN persona p_vendedor ON u.persona_id = p_vendedor.persona_id
      -- Supervisor por celula del vendedor
      LEFT JOIN usuario u_supervisor ON u.celula = u_supervisor.celula AND u_supervisor.rol = 'SUPERVISOR'
      LEFT JOIN supervisor sup ON u_supervisor.persona_id = sup.usuario_id
      LEFT JOIN persona p_supervisor ON u_supervisor.persona_id = p_supervisor.persona_id
      INNER JOIN plan pl ON v.plan_id = pl.plan_id
      LEFT JOIN promocion pr ON v.promocion_id = pr.promocion_id
      LEFT JOIN empresa_origen eo ON v.empresa_origen_id = eo.empresa_origen_id
      WHERE v.venta_id = $1
    `;

    const ventaResult = await client.queryObject(ventaQuery, [ventaId]);
    
    if (!ventaResult.rows || ventaResult.rows.length === 0) {
      return undefined;
    }

    const venta = ventaResult.rows[0] as any;

    // Queries paralelas para datos relacionados
    const [
      estadosVenta,
      estadosCorreo,
      comentarios,
      portabilidad,
      lineaNueva,
      correo
    ] = await Promise.all([
      // Historial de estados de la venta
      client.queryObject(
        `SELECT * FROM estado WHERE venta_id = $1 ORDER BY fecha_creacion DESC`,
        [ventaId]
      ),
      // Historial de estados del correo (si tiene SAP)
      venta.sap 
        ? client.queryObject(
            `SELECT * FROM estado_correo WHERE sap_id = $1 ORDER BY fecha_creacion DESC`,
            [venta.sap]
          )
        : Promise.resolve({ rows: [] }),
      // Comentarios
      client.queryObject(
        `SELECT c.*, p.nombre as autor_nombre, p.apellido as autor_apellido 
         FROM comentario c 
         INNER JOIN persona p ON c.usuarios_id = p.persona_id 
         WHERE c.venta_id = $1 
         ORDER BY c.fecha_creacion DESC`,
        [ventaId]
      ),
      // Portabilidad
      client.queryObject(
        `SELECT * FROM portabilidad WHERE venta_id = $1`,
        [ventaId]
      ),
      // Línea nueva
      client.queryObject(
        `SELECT * FROM linea_nueva WHERE venta_id = $1`,
        [ventaId]
      ),
      // Datos del correo
      venta.sap
        ? client.queryObject(
            `SELECT * FROM correo WHERE sap_id = $1`,
            [venta.sap]
          )
        : Promise.resolve({ rows: [] }),
    ]);

    return convertBigIntToNumber({
      venta: {
        venta_id: venta.venta_id,
        sds: venta.sds,
        chip: venta.chip,
        stl: venta.stl,
        tipo_venta: venta.tipo_venta,
        sap: venta.sap,
        multiple: venta.multiple,
        fecha_creacion: venta.fecha_creacion,
      },
      cliente: {
        persona_id: venta.cliente_id,
        nombre: venta.cliente_nombre,
        apellido: venta.cliente_apellido,
        documento: venta.cliente_documento,
        email: venta.cliente_email,
        telefono: venta.cliente_telefono,
        tipoDocumento: venta.cliente_tipo_documento,
        genero: venta.cliente_genero,
        fechaNacimiento: venta.cliente_fecha_nacimiento,
        nacionalidad: venta.cliente_nacionalidad,
      },
      vendedor: {
        persona_id: venta.vendedor_id,
        nombre: venta.vendedor_nombre,
        apellido: venta.vendedor_apellido,
        email: venta.vendedor_email,
        telefono: venta.vendedor_telefono,
        legajo: venta.vendedor_legajo,
        exa: venta.vendedor_exa,
        celula: venta.vendedor_celula,
      },
      supervisor: venta.supervisor_nombre ? {
        id: venta.supervisor_id,
        nombre: venta.supervisor_nombre,
        apellido: venta.supervisor_apellido,
        legajo: venta.supervisor_legajo,
        email: venta.supervisor_email,
      } : null,
      plan: {
        id: venta.plan_id,
        nombre: venta.plan_nombre,
        precio: venta.plan_precio,
        descripcion: venta.plan_descripcion,
        gigabyte: venta.plan_gigabyte,
        llamadas: venta.plan_llamadas,
        mensajes: venta.plan_mensajes,
        whatsapp: venta.plan_whatsapp,
        roaming: venta.plan_roaming,
      },
      promocion: venta.promocion_nombre ? {
        promocion_id: venta.promocion_id,
        nombre: venta.promocion_nombre,
        descuento: venta.promocion_descuento,
        beneficios: venta.promocion_beneficios,
      } : null,
      empresa_origen: venta.empresa_origen_nombre ? {
        empresa_origen_id: venta.empresa_origen_id,
        nombre: venta.empresa_origen_nombre,
        pais: venta.empresa_origen_pais,
      } : null,
      estado_actual: {
        estado: venta.estado_actual,
        descripcion: venta.estado_descripcion,
      },
      correo_estado: venta.correo_estado_actual ? {
        estado: venta.correo_estado_actual,
        ubicacion: venta.correo_ubicacion,
      } : null,
      portabilidad: portabilidad.rows && portabilidad.rows.length > 0 ? portabilidad.rows[0] : null,
      linea_nueva: lineaNueva.rows && lineaNueva.rows.length > 0 ? lineaNueva.rows[0] : null,
      historial_estados: (estadosVenta.rows || []).map((e: any) => ({
        estado_id: e.estado_id,
        estado: e.estado,
        descripcion: e.descripcion,
        fecha_creacion: e.fecha_creacion,
        usuario_id: e.usuario_id,
      })),
      historial_correo: (estadosCorreo.rows || []).map((e: any) => ({
        estado_correo_id: e.estado_correo_id,
        estado: e.estado,
        descripcion: e.descripcion,
        ubicacion_actual: e.ubicacion_actual,
        fecha_creacion: e.fecha_creacion,
      })),
      comentarios: (comentarios.rows || []).map((c: any) => ({
        comentario_id: c.comentario_id,
        titulo: c.titulo,
        comentario: c.comentario,
        tipo: c.tipo_comentario,
        fecha: c.fecha_creacion,
        author: `${c.autor_nombre} ${c.autor_apellido}`,
      })),
      correo: correo.rows && correo.rows.length > 0 ? correo.rows[0] : null,
    });
  }
}