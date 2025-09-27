import React, { useMemo } from 'react'

const SlotList = ({ slots, onSlotSelect, selectedSlot, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading available slots...</span>
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-lg">No available slots for the selected date and appointment type.</p>
        <p className="text-gray-400 text-sm mt-2">Please try a different date or appointment type.</p>
      </div>
    )
  }

  // Build a combined list including lunch-break disabled items
  const enrichedSlots = useMemo(() => {
    const set = new Map()
    // Add available slots
    slots.forEach(s => set.set(s.start_time, { ...s, available: true }))
    // Add lunch break disabled slots at 15-min intervals
    const lunchTimes = ['13:00', '13:15', '13:30', '13:45']
    lunchTimes.forEach(t => {
      if (!set.has(t)) {
        // Duration here is not relevant for UI; we'll just show disabled blocks
        set.set(t, { start_time: t, end_time: '', available: false, reason: 'lunch' })
      }
    })
    // Sort by time key HH:MM lexicographically
    return Array.from(set.values()).sort((a, b) => (a.start_time > b.start_time ? 1 : -1))
  }, [slots])

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {enrichedSlots.map((slot, index) => {
          const selected = selectedSlot?.start_time === slot.start_time
          const isLunch = slot.available === false && slot.reason === 'lunch'
          return (
            <button
              key={index}
              onClick={() => {
                if (isLunch) return
                onSlotSelect(slot)
              }}
              disabled={isLunch}
              className={`group p-3 rounded-xl border transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isLunch
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : selected
                    ? 'bg-blue-600 text-white border-blue-600 focus:ring-blue-300'
                    : 'bg-white text-gray-800 border-green-300 hover:border-green-500 hover:shadow-md focus:ring-green-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {!selected && !isLunch && (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500"></span>
                )}
                {selected && !isLunch && (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-white"></span>
                )}
                <div className="text-sm font-semibold tracking-wide">
                  {slot.start_time}
                  {!isLunch && slot.end_time ? ` - ${slot.end_time}` : ''}
                  {isLunch && <span className="text-xs font-normal text-gray-500"> (Lunch)</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {selectedSlot && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            Selected: {selectedSlot.start_time} - {selectedSlot.end_time}
          </p>
        </div>
      )}
    </div>
  )
}

export default SlotList
