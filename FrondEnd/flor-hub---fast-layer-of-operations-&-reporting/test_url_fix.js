#!/usr/bin/env node

console.log('=== PRUEBA DE CORRECCIÓN DE URLS ===');

const API_URL = 'http://localhost:8000/';
const endpoints = ['/usuario/login', '/usuario/verify', '/usuario/logout'];

endpoints.forEach(endpoint => {
  const url = API_URL.endsWith('/') 
    ? `${API_URL}${endpoint.slice(1)}`  // NUEVA LÓGICA
    : `${API_URL}${endpoint}`;             // NUEVA LÓGICA
  
  console.log(`Endpoint: ${endpoint}`);
  console.log(`URL generada: ${url}`);
  console.log('---');
});

// También probar directamente la función del api
console.log('\n=== PRUEBA CON API REQUEST ===');
const testUrl = 'http://localhost:8000/usuario/login';
console.log('API_URL:', API_URL);
console.log('Endpoint:', '/usuario/login');

const endpoint = '/usuario/login';
const url = API_URL.endsWith('/') 
  ? `${API_URL}${endpoint.slice(1)}`
  : `${API_URL}${endpoint}`;

console.log('URL final:', url);
console.log('Esperado: http://localhost:8000/usuario/login');