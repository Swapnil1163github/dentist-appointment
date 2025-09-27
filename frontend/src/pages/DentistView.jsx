import React, { useEffect, useMemo, useState } from 'react'
import { getAppointmentsForDate, cancelAppointment } from '../api'
import { format } from 'date-fns'
import Avatar from '../components/Avatar'

const DentistView = () => {
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadAppointments = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await getAppointmentsForDate(selectedDate)
      setAppointments(data)
    } catch (e) {
      setError('Failed to load appointments. Ensure backend is running on http://localhost:8000')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id)
      setSuccess('Appointment cancelled successfully.')
      await loadAppointments()
    } catch (e) {
      setError('Failed to cancel appointment.')
    }
  }

  return (
    <div className="px-4">
      <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-white/60 animate-scale-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dentist View</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAppointments}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 rounded-md bg-green-50 text-green-800 border border-green-200">{success}</div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 border border-red-200">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500">No appointments booked for this date.</p>
        ) : (
          <div className="overflow-x-auto animate-fade-in-up">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map(appt => (
                  <tr key={appt.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {new Date(appt.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(appt.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <Avatar name={appt.patient_name} size={8} />
                        <span>{appt.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{appt.contact_info}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{appt.appointment_type}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{appt.duration_minutes} min</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                        appt.status === 'booked' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appt.status === 'booked' ? '✅' : '❌'} {appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      {appt.status === 'booked' && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DentistView
