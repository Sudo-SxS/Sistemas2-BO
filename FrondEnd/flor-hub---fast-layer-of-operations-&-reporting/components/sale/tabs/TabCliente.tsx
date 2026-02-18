
import React, { memo } from 'react';
import { SaleDetail } from '../../../types';
import { EditableField, SectionHeader } from '../SaleModalHelpers';

export const TabCliente = memo(({ editedData }: { editedData: SaleDetail | null }) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Información del Cliente" icon="👤" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <EditableField label="Nombre" value={editedData?.cliente?.nombre || ''} field="cliente.nombre" readonly />
      <EditableField label="Apellido" value={editedData?.cliente?.apellido || ''} field="cliente.apellido" readonly />
      <EditableField label="DNI/CUIT" value={editedData?.cliente?.documento || ''} field="cliente.documento" readonly />
      <EditableField label="Email" value={editedData?.cliente?.email || ''} field="cliente.email" readonly />
      <EditableField label="Teléfono" value={editedData?.cliente?.telefono || ''} field="cliente.telefono" readonly />
      <EditableField label="Género" value={editedData?.cliente?.genero || ''} field="cliente.genero" readonly />
      <EditableField label="F. Nacimiento" value={editedData?.cliente?.fechaNacimiento || ''} field="cliente.fechaNacimiento" readonly />
      <EditableField label="Nacionalidad" value={editedData?.cliente?.nacionalidad || ''} field="cliente.nacionalidad" readonly />
    </div>
  </div>
));
