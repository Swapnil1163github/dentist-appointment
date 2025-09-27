import React from 'react'

const colors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
]

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

const Avatar = ({ name = '', size = 8 }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const idx = hashString(name) % colors.length
  const colorClass = colors[idx]
  const dimension = `w-${size} h-${size}`

  return (
    <div className={`${dimension} ${colorClass} rounded-full flex items-center justify-center font-semibold`}> 
      <span className="text-xs">{initials || '?'}</span>
    </div>
  )
}

export default Avatar
