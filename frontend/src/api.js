// Central API service for LOCAL development only
// Hardcoded to local FastAPI server
const API_BASE = 'http://localhost:8000'

async function http(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, opts)
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const message = data?.detail || data?.message || res.statusText
    throw new Error(message)
  }
  return data
}

// Public API functions
export async function getAvailableSlots(date, type) {
  return http('GET', `/allAvailableSlots?date=${encodeURIComponent(date)}&type=${encodeURIComponent(type)}`)
}

export async function bookAppointment(appointmentData) {
  return http('POST', `/appointments`, appointmentData)
}

export async function getAppointmentsForDate(date) {
  return http('GET', `/appointments?date=${encodeURIComponent(date)}`)
}

// Optional: needed by Dentist view for cancellations
export async function cancelAppointment(appointmentId) {
  return http('DELETE', `/appointments/${encodeURIComponent(appointmentId)}`)
}

export { API_BASE }
