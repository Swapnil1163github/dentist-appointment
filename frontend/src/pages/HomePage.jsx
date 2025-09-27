import React, { useEffect, useMemo, useState } from 'react'
import { getAvailableSlots, bookAppointment } from '../api'
import SlotList from '../components/SlotList'
import BookingForm from '../components/BookingForm'
import { format } from 'date-fns'
import { toLocalNaiveISO } from '../utils/date'
import Modal from '../components/Modal'

const APPOINTMENT_TYPES = [
  { value: 'Regular Check-up', label: '🩺 Regular Check-up' },
  { value: 'Specific Treatment', label: '💉 Specific Treatment' },
  { value: 'Operation', label: '🛠️ Operation' },
]

const HomePage = () => {
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [appointmentType, setAppointmentType] = useState(APPOINTMENT_TYPES[0].value)
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [lastBooked, setLastBooked] = useState(null) // { name, type, date, time }

  const fetchSlots = async () => {
    if (!selectedDate || !appointmentType) return
    setLoadingSlots(true)
    setError(null)
    try {
      const data = await getAvailableSlots(selectedDate, appointmentType)
      setSlots(data)
    } catch (e) {
      setError('Failed to load available slots. Make sure the backend is running on http://localhost:8000')
    } finally {
      setLoadingSlots(false)
    }
  }

  useEffect(() => {
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, appointmentType])

  const handleBook = async ({ name, contact }) => {
    if (!selectedSlot) return
    setSubmitting(true)
    setMessage(null)
    setError(null)
    try {
      const start_datetime = toLocalNaiveISO(selectedDate, selectedSlot.start_time)
      const resp = await bookAppointment({
        patient_name: name,
        contact_info: contact,
        appointment_type: appointmentType,
        start_datetime,
      })
      setMessage(`Appointment booked successfully on ${selectedDate} at ${selectedSlot.start_time}.`)
      setLastBooked({
        name,
        type: appointmentType,
        date: selectedDate,
        time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`,
      })
      setSelectedSlot(null)
      await fetchSlots()
    } catch (e) {
      const detail = e?.response?.data?.detail || 'Booking failed.'
      setError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4">
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-white/60 animate-scale-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Book an Appointment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
            >
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={todayStr}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-md bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-6">
          <SlotList
            slots={slots}
            onSlotSelect={setSelectedSlot}
            selectedSlot={selectedSlot}
            loading={loadingSlots}
          />
        </div>

        <BookingForm
          selectedSlot={selectedSlot}
          selectedDate={selectedDate}
          appointmentType={appointmentType}
          onSubmit={handleBook}
          submitting={submitting}
        />
      </div>

      <Modal
        open={!!message}
        onClose={() => setMessage(null)}
        title="Appointment Confirmed"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700">✅</span>
          </div>
          <div className="text-gray-800">
            <p className="font-medium">Appointment Confirmed!</p>
            {lastBooked && (
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li><span className="font-medium">Name:</span> {lastBooked.name}</li>
                <li><span className="font-medium">Type:</span> {lastBooked.type}</li>
                <li><span className="font-medium">Date:</span> {lastBooked.date}</li>
                <li><span className="font-medium">Time:</span> {lastBooked.time}</li>
              </ul>
            )}
            <p className="text-sm text-gray-600 mt-3">We look forward to seeing you. A reminder can be sent to your contact if enabled later.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default HomePage
