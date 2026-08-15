export function toISO(date) {
  return date.toISOString().slice(0, 10);
}

export function parseISO(fecha) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDaysISO(fecha, dias) {
  const d = parseISO(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return toISO(d);
}

export function shortDate(fecha) {
  const d = parseISO(fecha);
  return new Intl.DateTimeFormat("es-UY", { weekday: "short", day: "numeric", month: "numeric", timeZone: "UTC" })
    .format(d)
    .replace(".", "");
}

export function monthKey(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
}

export function dateInMonth(fechaISO, date) {
  return fechaISO && fechaISO.slice(0, 7) === monthKey(date);
}
