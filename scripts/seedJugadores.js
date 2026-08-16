// Script para cargar de una los jugadores que vimos mencionados durante las pruebas.
// Uso:
//   1. Asegurate de tener el backend corriendo (npm run dev) en otra pestaña.
//   2. Corré: node scripts/seedJugadores.js tu-email@ejemplo.com tu-contraseña
//
// Si algún jugador ya existe con ese nombre, lo salta (no duplica).

const API_URL = process.env.API_URL || "http://localhost:3000/v1";

const JUGADORES = [
  { nombre: "Martín Cáceres", altura: 178, peso: 77, posicion: "" },
  { nombre: "Emanuel Cecchini", altura: 180, peso: 78, posicion: "Volante Central" },
  { nombre: "Alejo Cruz", altura: null, peso: null, posicion: "" },
  { nombre: "Ramiro Peralta", altura: null, peso: null, posicion: "" },
  { nombre: "Gastón Pereiro", altura: null, peso: null, posicion: "" },
];

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("Uso: node scripts/seedJugadores.js tu-email@ejemplo.com tu-contraseña");
    process.exit(1);
  }

  console.log("Iniciando sesión...");
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    console.error("No se pudo iniciar sesión:", await loginRes.text());
    process.exit(1);
  }
  const { token } = await loginRes.json();

  console.log("Buscando jugadores ya cargados...");
  const listRes = await fetch(`${API_URL}/jugadores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existentes = await listRes.json();
  const nombresExistentes = new Set(existentes.map((j) => j.nombre));

  for (const jugador of JUGADORES) {
    if (nombresExistentes.has(jugador.nombre)) {
      console.log(`- Ya existe "${jugador.nombre}", lo salteo.`);
      continue;
    }
    const datos = { nombre: jugador.nombre };
    if (jugador.posicion) datos.posicion = jugador.posicion;
    if (jugador.altura) datos.altura = jugador.altura;
    if (jugador.peso) datos.peso = jugador.peso;

    const res = await fetch(`${API_URL}/jugadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(datos),
    });
    if (res.ok) {
      console.log(`✓ Creado: ${jugador.nombre}`);
    } else {
      console.error(`✗ Error al crear ${jugador.nombre}:`, await res.text());
    }
  }

  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
