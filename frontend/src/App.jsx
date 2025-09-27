import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DentistView from './pages/DentistView'

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-white/15 rounded-full p-1">
                  {/* Tooth icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-white">
                    <path d="M12 2c2.21 0 4 1.79 4 4 0 .53-.1 1.04-.28 1.5h.01c.53 1.31 1.75 2.25 3.22 2.25.61 0 1.18-.15 1.69-.41C20.95 13.88 17.09 18 12 18S3.05 13.88 3.36 9.34c.51.26 1.08.41 1.69.41 1.47 0 2.69-.94 3.22-2.25h.01C8.1 7.04 8 6.53 8 6c0-2.21 1.79-4 4-4z"/>
                  </svg>
                </div>
                <h1 className="text-xl font-semibold tracking-tight">Dentist Appointment Booking</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Book Appointment
                </Link>
                <Link 
                  to="/dentist" 
                  className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dentist View
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dentist" element={<DentistView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
