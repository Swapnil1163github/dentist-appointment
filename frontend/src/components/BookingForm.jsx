import React, { useState } from 'react'

const BookingForm = ({ selectedSlot, selectedDate, appointmentType, onSubmit, submitting }) => {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !contact.trim()) return
    onSubmit({ name: name.trim(), contact: contact.trim() })
  }

  if (!selectedSlot) return null

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Booking</h3>
      <div className="mb-4 text-sm text-gray-700">
        <p><span className="font-medium">Appointment Type:</span> {appointmentType}</p>
        <p><span className="font-medium">Date:</span> {selectedDate}</p>
        <p><span className="font-medium">Time:</span> {selectedSlot.start_time} - {selectedSlot.end_time}</p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Email or Phone)</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="john@example.com / +1 234 567 890"
            required
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-md text-white ${submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
          >
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookingForm
