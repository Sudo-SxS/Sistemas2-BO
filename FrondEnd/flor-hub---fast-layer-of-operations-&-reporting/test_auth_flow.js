#!/usr/bin/env node

// Prueba completa del flujo de autenticación
console.log('=== INICIANDO PRUEBA COMPLETA DE AUTENTICACIÓN ===\n');

// Configuración
const API_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:8000';

// Simular fetch del navegador
const fetchLike = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'http://localhost:3001',
      'Referer': 'http://localhost:3001/',
      ...options.headers
    },
    credentials: 'include'
  });
};

async function testFlow() {
  try {
    // PASO 1: Login
    console.log('🔍 [PASO 1] Login...');
    const loginResponse = await fetchLike(`${API_URL}/usuario/login`, {
      method: 'POST',
      body: JSON.stringify({
        user: {
          email: 'santi.sanchez@pruva.com',
          password: 'A_a87654321'
        }
      })
    });

    console.log('   Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('   Response:', JSON.stringify(loginData, null, 2));
    console.log('   Success:', loginData.success);

    if (!loginData.success) {
      throw new Error('Login falló');
    }

    // PASO 2: Simular refresh de página (verificar sin login directo)
    console.log('\n🔄 [PASO 2] Simulando refresh de página...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const verifyResponse = await fetchLike(`${API_URL}/usuario/verify`, {
      method: 'GET'
    });

    console.log('   Status:', verifyResponse.status);
    const verifyData = await verifyResponse.json();
    console.log('   Response:', JSON.stringify(verifyData, null, 2));
    console.log('   Authenticated:', verifyData.success);

    if (verifyData.success) {
      console.log('\n✅ [ÉXITO] La sesión se mantiene después del refresh');
      console.log('✅ [USUARIO] Nombre:', verifyData.payload?.nombre);
      console.log('✅ [USUARIO] Email:', verifyData.payload?.email);
      console.log('✅ [USUARIO] Rol:', verifyData.payload?.rol);
    } else {
      console.log('\n❌ [ERROR] La sesión no se mantiene después del refresh');
      console.log('❌ [ERROR] Mensaje:', verifyData.message);
    }

    // PASO 3: Verificar directamente contra el backend (para comparar)
    console.log('\n🔍 [PASO 3] Verificación directa contra backend...');
    const directResponse = await fetch(`${BACKEND_URL}/usuario/verify`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3001',
        'Referer': 'http://localhost:3001/'
      },
      credentials: 'include'
    });

    console.log('   Status:', directResponse.status);
    const directData = await directResponse.json();
    console.log('   Response:', JSON.stringify(directData, null, 2));

  } catch (error) {
    console.error('\n❌ [ERROR CRÍTICO]', error.message);
    process.exit(1);
  }
}

// Ejecutar prueba
testFlow();