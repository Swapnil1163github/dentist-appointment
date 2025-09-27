import React from 'react'

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-11/12 max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div>{children}</div>
        <div className="mt-5 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">OK</button>
        </div>
      </div>
    </div>
  )
}

export default Modal
