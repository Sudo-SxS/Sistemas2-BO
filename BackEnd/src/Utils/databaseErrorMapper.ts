interface MappedError {
  message: string;
  statusCode: number;
}

export function mapDatabaseError(error: unknown, isDevelopment: boolean): MappedError | null {
  if (!(error instanceof Error) || !error.message) return null;

  const msg = error.message.toLowerCase();

  // Unique key violation (ER_DUP_ENTRY: 1062)
  if (msg.includes('duplicate entry')) {
    let simpleMessage = 'Entrada duplicada';
    if (msg.includes('nombre_unique')) simpleMessage = 'Nombre ya existe';
    if (msg.includes('usuario_unique')) simpleMessage = 'Usuario ya asignado';
    if (msg.includes('sap_unique')) simpleMessage = 'SAP ya registrado';

    const message = isDevelopment
      ? `${simpleMessage} - Detalles: ${error.message}`
      : simpleMessage;

    return { message, statusCode: 400 };
  }

  // Foreign key violation on insert/update (ER_NO_REFERENCED_ROW: 1452)
  if (msg.includes('foreign key constraint fails') && (msg.includes('add') || msg.includes('update'))) {
    const message = isDevelopment
      ? `Referencia no válida - Detalles: ${error.message}`
      : 'Referencia no válida';

    return { message, statusCode: 400 };
  }

  // Foreign key violation on delete (ER_ROW_IS_REFERENCED: 1451)
  if (msg.includes('foreign key constraint fails') && (msg.includes('delete') || msg.includes('update'))) {
    const message = isDevelopment
      ? `No se puede eliminar porque hay dependencias - Detalles: ${error.message}`
      : 'No se puede eliminar porque hay dependencias';

    return { message, statusCode: 400 };
  }

  // Other potential constraints
  if (msg.includes('data too long')) {
    const message = isDevelopment
      ? `Dato demasiado largo - Detalles: ${error.message}`
      : 'Dato demasiado largo';

    return { message, statusCode: 400 };
  }

  if (msg.includes('cannot be null')) {
    const message = isDevelopment
      ? `Campo requerido faltante - Detalles: ${error.message}`
      : 'Campo requerido faltante';

    return { message, statusCode: 400 };
  }

  return null; // Not a mapped DB error
}