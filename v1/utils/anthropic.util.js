// Le pide a Claude que lea una foto de una planilla de datos físicos (GPS) y devuelva,
// para cada jugador que reconozca, su nombre y el valor numérico principal (distancia u
// otra métrica de carga). Requiere la variable de entorno ANTHROPIC_API_KEY.

export async function extraerDatosFisicos(base64Imagen, mediaType, metrica) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const error = new Error(
      "Falta configurar ANTHROPIC_API_KEY en el backend (.env) para poder leer planillas automáticamente."
    );
    error.status = 500;
    throw error;
  }

  const prompt =
    `Esta imagen es una planilla de datos físicos (GPS) de un entrenamiento de fútbol. ` +
    `Extraé, para cada jugador que aparezca con su nombre, el valor numérico correspondiente a "${metrica || "distancia total"}". ` +
    `Si esa métrica exacta no está pero hay una de distancia recorrida, usá esa. ` +
    `Respondé ÚNICAMENTE con un JSON array, sin texto adicional ni explicaciones, con este formato exacto: ` +
    `[{"nombre": "Nombre tal como figura en la planilla", "valor": 1234}]. ` +
    `Si no podés leer el nombre o el valor de alguna fila con confianza, no la incluyas.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Imagen } },
            { type: "text", text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const texto = await response.text();
    const error = new Error("Error al consultar la IA para leer la imagen: " + texto);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const bloqueTexto = (data.content || []).find((c) => c.type === "text");
  const textoRespuesta = bloqueTexto ? bloqueTexto.text : "[]";
  const limpio = textoRespuesta.replace(/```json|```/g, "").trim();

  try {
    const filas = JSON.parse(limpio);
    if (!Array.isArray(filas)) return [];
    return filas.filter((f) => f && typeof f.nombre === "string" && typeof f.valor === "number");
  } catch (e) {
    const error = new Error("No se pudo interpretar lo que devolvió la IA. Probá con una foto más clara.");
    error.status = 502;
    throw error;
  }
}
