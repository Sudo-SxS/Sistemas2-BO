// Simulación del flujo de autenticación del frontend

// Paso 1: Login para obtener cookie
console.log("=== PASO 1: Login ===");
const loginResponse = await fetch("http://localhost:3000/usuario/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Origin": "http://localhost:3000"
  },
  body: JSON.stringify({
    user: {
      email: "santi.sanchez@pruva.com",
      password: "A_a87654321"
    }
  }),
  credentials: "include"
});

console.log("Login Status:", loginResponse.status);
const loginData = await loginResponse.json();
console.log("Login Response:", loginData);

// Paso 2: Verificar con la cookie
console.log("\n=== PASO 2: Verificar Token ===");
const verifyResponse = await fetch("http://localhost:3000/usuario/verify", {
  method: "GET",
  headers: {
    "Origin": "http://localhost:3000"
  },
  credentials: "include"
});

console.log("Verify Status:", verifyResponse.status);
const verifyData = await verifyResponse.json();
console.log("Verify Response:", verifyData);

// Paso 3: Simular refresco de página
console.log("\n=== PASO 3: Simular Refresco ===");
// Esto simularía lo que pasa cuando el usuario refresca la página
// y useAuthCheck hace la petición a /usuario/verify

console.log("Flujo completado");
