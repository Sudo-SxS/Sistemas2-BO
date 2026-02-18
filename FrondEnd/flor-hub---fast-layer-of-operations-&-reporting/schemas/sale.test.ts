import { describe, it, expect } from 'vitest';
import { Fase1Schema, Fase2Schema, Fase3Schema } from './sale';

describe('Sale Schemas', () => {
  describe('Fase1Schema - Client Data', () => {
    it('should validate correct client data', () => {
      const validData = {
        tipo_documento: 'DNI',
        documento: '12345678',
        nombre: 'JUAN',
        apellido: 'PEREZ',
        email: 'juan@example.com',
        telefono: '3511234567',
        fecha_nacimiento: '1990-01-01',
        genero: 'MASCULINO',
        nacionalidad: 'ARGENTINA',
      };

      const result = Fase1Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        tipo_documento: 'DNI',
        documento: '12345678',
        nombre: 'JUAN',
        apellido: 'PEREZ',
        email: 'invalid-email',
        telefono: '3511234567',
        fecha_nacimiento: '1990-01-01',
        genero: 'MASCULINO',
        nacionalidad: 'ARGENTINA',
      };

      const result = Fase1Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require mandatory fields', () => {
      const incompleteData = {
        tipo_documento: 'DNI',
        documento: '12345678',
      };

      const result = Fase1Schema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('Fase2Schema - Sale Data', () => {
    it('should validate LINEA_NUEVA sale', () => {
      const validData = {
        tipo_venta: 'LINEA_NUEVA',
        plan_id: 1,
        chip: 'SIM',
        sds: 'SDS001',
        stl: 'STL001',
        empresa_origen_id: 2,
      };

      const result = Fase2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate PORTABILIDAD sale with required fields', () => {
      const validData = {
        tipo_venta: 'PORTABILIDAD',
        plan_id: 1,
        chip: 'SIM',
        sds: 'SDS001',
        stl: 'STL001',
        empresa_origen_id: 3,
        spn: 'SPN123456',
        numero_portar: '3511234567',
        mercado_origen: 'PREPAGO',
      };

      const result = Fase2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject PORTABILIDAD without empresa_origen_id', () => {
      const invalidData = {
        tipo_venta: 'PORTABILIDAD',
        plan_id: 1,
        chip: 'SIM',
        empresa_origen_id: 0,
        spn: 'SPN123456',
        numero_portar: '3511234567',
      };

      const result = Fase2Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow ESIM without STL', () => {
      const validData = {
        tipo_venta: 'LINEA_NUEVA',
        plan_id: 1,
        chip: 'ESIM',
        sds: 'SDS001',
        empresa_origen_id: 2,
      };

      const result = Fase2Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Fase3Schema - Logistics Data', () => {
    it('should validate complete logistics data', () => {
      const validData = {
        sap_id: 'SAP123',
        numero: '600000000',
        tipo: 'RESIDENCIAL',
        direccion: 'Calle 123',
        numero_casa: '456',
        localidad: 'Córdoba',
        provincia: 'Córdoba',
        codigo_postal: '5000',
      };

      const result = Fase3Schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow optional fields to be empty', () => {
      const minimalData = {
        numero: '600000000',
        tipo: 'RESIDENCIAL',
      };

      const result = Fase3Schema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should validate tipo enum values', () => {
      const invalidData = {
        numero: '600000000',
        tipo: 'INVALID_TYPE',
      };

      const result = Fase3Schema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
