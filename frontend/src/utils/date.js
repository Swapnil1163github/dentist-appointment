import { format } from 'date-fns'

export const formatDateDisplay = (dateStr) => {
  try {
    const d = new Date(dateStr)
    return format(d, 'yyyy-MM-dd')
  } catch {
    return dateStr
  }
}

export const toLocalNaiveISO = (dateStr, hhmm) => {
  // Returns YYYY-MM-DDTHH:MM:00 (no timezone)
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(dateStr)
  d.setHours(h, m, 0, 0)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const HH = String(d.getHours()).padStart(2, '0')
  const MM = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:00`
}
