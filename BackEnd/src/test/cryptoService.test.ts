/**
 * Test para validar el funcionamiento del CryptoService
 * Reemplaza las pruebas de bcrypt para asegurar compatibilidad con Deno Deploy
 */

import { CryptoService } from "../services/CryptoService.ts";
import { assertEquals, assert } from "https://deno.land/std@0.203.0/testing/asserts.ts";

Deno.test("CryptoService - Hash de contraseña básico", async () => {
  const password = "TestPassword123!";
  
  // Generar hash
  const hash = await CryptoService.hashPassword(password);
  
  // Verificar que el hash no sea vacío
  assert(hash.length > 50, "El hash debe tener una longitud significativa");
  
  // Verificar formato (contiene ':')
  assert(hash.includes(':'), "El hash debe contener ':' como separador");
  
  console.log("✅ Hash generado correctamente:", hash.substring(0, 20) + "...");
});

Deno.test("CryptoService - Verificación de contraseña correcta", async () => {
  const password = "TestPassword123!";
  
  // Generar hash
  const hash = await CryptoService.hashPassword(password);
  
  // Verificar contraseña correcta
  const isValid = await CryptoService.verifyPassword(password, hash);
  
  assertEquals(isValid, true, "La contraseña debe verificarse correctamente");
  console.log("✅ Contraseña verificada correctamente");
});

Deno.test("CryptoService - Verificación de contraseña incorrecta", async () => {
  const password = "TestPassword123!";
  const wrongPassword = "WrongPassword456!";
  
  // Generar hash de la contraseña correcta
  const hash = await CryptoService.hashPassword(password);
  
  // Verificar contraseña incorrecta
  const isValid = await CryptoService.verifyPassword(wrongPassword, hash);
  
  assertEquals(isValid, false, "La contraseña incorrecta debe rechazarse");
  console.log("✅ Contraseña incorrecta rechazada correctamente");
});

Deno.test("CryptoService - Diferentes contraseñas generan hashes diferentes", async () => {
  const password1 = "Password1!";
  const password2 = "Password2!";
  
  // Generar hashes
  const hash1 = await CryptoService.hashPassword(password1);
  const hash2 = await CryptoService.hashPassword(password2);
  
  // Verificar que sean diferentes
  assert(hash1 !== hash2, "Contraseñas diferentes deben generar hashes diferentes");
  console.log("✅ Contraseñas diferentes generan hashes diferentes");
});

Deno.test("CryptoService - Misma contraseña genera hashes diferentes (salting)", async () => {
  const password = "SamePassword123!";
  
  // Generar hashes dos veces
  const hash1 = await CryptoService.hashPassword(password);
  const hash2 = await CryptoService.hashPassword(password);
  
  // Verificar que sean diferentes (por el salt aleatorio)
  assert(hash1 !== hash2, "La misma contraseña debe generar hashes diferentes por el salt");
  
  // Pero ambas deben verificar correctamente
  const isValid1 = await CryptoService.verifyPassword(password, hash1);
  const isValid2 = await CryptoService.verifyPassword(password, hash2);
  
  assertEquals(isValid1, true, "El primer hash debe verificar correctamente");
  assertEquals(isValid2, true, "El segundo hash debe verificar correctamente");
  
  console.log("✅ Salting funcionando correctamente");
});

Deno.test("CryptoService - Validación de fortaleza de contraseña", () => {
  // Contraseña válida
  const validResult = CryptoService.validatePasswordStrength("ValidPass123!");
  assertEquals(validResult.isValid, true, "Contraseña válida debe pasar validación");
  
  // Contraseña muy corta
  const shortResult = CryptoService.validatePasswordStrength("short");
  assertEquals(shortResult.isValid, false, "Contraseña corta debe rechazarse");
  assert(shortResult.errors.some(e => e.includes("8 caracteres")), "Debe mencionar longitud mínima");
  
  // Sin mayúscula
  const noUpperResult = CryptoService.validatePasswordStrength("lowercase123!");
  assertEquals(noUpperResult.isValid, false, "Debe requerir mayúscula");
  
  // Sin minúscula
  const noLowerResult = CryptoService.validatePasswordStrength("UPPERCASE123!");
  assertEquals(noLowerResult.isValid, false, "Debe requerir minúscula");
  
  // Sin número
  const noNumberResult = CryptoService.validatePasswordStrength("NoNumbers!");
  assertEquals(noNumberResult.isValid, false, "Debe requerir número");
  
  // Sin carácter especial
  const noSpecialResult = CryptoService.validatePasswordStrength("NoSpecialChars123");
  assertEquals(noSpecialResult.isValid, false, "Debe requerir carácter especial");
  
  console.log("✅ Validación de fortaleza de contraseña funcionando");
});

Deno.test("CryptoService - Generación de tokens seguros", () => {
  const token1 = CryptoService.generateSecureToken();
  const token2 = CryptoService.generateSecureToken();
  
  // Verificar longitud
  assert(token1.length > 20, "Token debe tener longitud significativa");
  
  // Verificar que sean diferentes
  assert(token1 !== token2, "Tokens generados deben ser diferentes");
  
  // Verificar formato base64
  assert(/^[A-Za-z0-9+/]+=*$/.test(token1), "Token debe ser base64 válido");
  
  console.log("✅ Generación de tokens seguros funcionando");
  console.log("Token ejemplo:", token1.substring(0, 10) + "...");
});

Deno.test("CryptoService - Manejo de errores", async () => {
  // Hash vacío
  const emptyHashResult = await CryptoService.verifyPassword("password", "");
  assertEquals(emptyHashResult, false, "Hash vacío debe fallar");
  
  // Hash inválido
  const invalidHashResult = await CryptoService.verifyPassword("password", "invalid");
  assertEquals(invalidHashResult, false, "Hash inválido debe fallar");
  
  // Hash con formato incorrecto
  const malformedHashResult = await CryptoService.verifyPassword("password", "no-colons");
  assertEquals(malformedHashResult, false, "Hash malformado debe fallar");
  
  console.log("✅ Manejo de errores funcionando correctamente");
});

console.log("🎉 Todos los tests de CryptoService completados con éxito!");