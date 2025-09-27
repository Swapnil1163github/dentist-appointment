# Dentist Appointment Booking Platform

A full-stack web application for booking dentist appointments.

- Backend: FastAPI + SQLModel + SQLite
- Frontend: React (Vite) + Axios + date-fns + Tailwind CSS

## Features

- Select appointment type: Regular Check-up (30m), Specific Treatment (60m), Operation (120m)
- Pick a date using a calendar input
- View available slots between 09:30 and 20:00
- 15-minute granularity
- Prevent overlaps and block lunch break (13:00–14:00)
- Book by entering Name and Contact (email/phone)
- Dentist view to see all bookings for a date and cancel appointments

---

## Project Structure

```
dentist-appointment-platform/
  backend/
    main.py
    requirements.txt
  frontend/
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
    src/
      App.jsx
      api.js
      index.css
      main.jsx
      utils/
        date.js
      components/
        BookingForm.jsx
        SlotList.jsx
      pages/
        HomePage.jsx
        DentistView.jsx
  README.md
```

---

## Prerequisites (Windows)

- Python 3.10+
- Node.js 18+ and npm

Verify versions:

```powershell
python --version
node --version
npm --version
```

---

## Backend Setup (FastAPI)

1. Open PowerShell and navigate to the backend directory:

```powershell
# Do not include cd in tool commands, but for you locally:
cd C:\Users\PRATHMESH\CascadeProjects\dentist-appointment-platform\backend
```

2. Create and activate a virtual environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Run the API server:

```powershell
uvicorn main:app --reload --port 8000
```

The API will be available at:

- http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs

---

## Frontend Setup (React + Vite)

1. Open a new PowerShell window and navigate to the frontend directory:

```powershell
cd C:\Users\PRATHMESH\CascadeProjects\dentist-appointment-platform\frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Run the development server:

```powershell
npm run dev
```

Vite will serve the app at (by default):

- http://localhost:5173

Make sure the backend is running at http://localhost:8000.

This project is configured for local development only and does not require any environment variables.

---

## Usage

- Open http://localhost:5173
- In the "Book Appointment" page:
  - Select appointment type and date
  - Pick a time slot from the available list
  - Enter patient name and contact, click "Book Appointment"
- Switch to "Dentist View" to see all bookings for a date and cancel if needed

---

## Business Rules Implemented

- Working hours: 09:30–20:00
- 15-minute slot granularity enforced
- Appointment durations depend on type (30/60/120 min)
- No booking allowed in the past
- Lunch break: 13:00–14:00 (overlaps not allowed)
- Overlap prevention across existing booked appointments
- Cancel sets status to `cancelled` (removed from availability)

---

## API Endpoints (Local)

- GET `/appointments?date=YYYY-MM-DD` → list of booked appointments for the date
- GET `/allAvailableSlots?date=YYYY-MM-DD&type={appointmentType}` → available slots objects: `{ start_time, end_time, available }`
- POST `/appointments` → create booking
  - Body JSON:
    ```json
    {
      "patient_name": "John Doe",
      "contact_info": "john@example.com",
      "appointment_type": "Regular Check-up",
      "start_datetime": "2025-01-31T09:30:00"
    }
    ```
- DELETE `/appointments/{id}` → cancel a booking

---

## Notes

- The frontend uses a central `fetch`-based API service pointing to `http://localhost:8000` (see `frontend/src/api.js`). If you change the backend port, update that file accordingly.
- The SQLite DB file (`appointments.db`) is created in `backend/` at first run.
- Tailwind CSS is already configured via PostCSS; the `@tailwind` directives in `src/index.css` are resolved by the build step.

---

## Troubleshooting

- If you cannot import packages in the backend, ensure your virtual environment is activated before installing.
- If CORS errors appear in the browser, confirm the backend is running and that you are using `http://localhost:5173` for the frontend.
- If no slots appear:
  - Ensure the selected date is today or later.
  - Ensure backend is running and reachable.
  - Remember lunch break (13:00–14:00) blocks slots, and the day ends at 20:00.

---

## Optional Enhancements

- Add a simple dentist login for the Dentist View page.
- Hook an email service for confirmation emails (a stub can be added where the booking is created).
- Improve the UI with more components and state management as needed.

Screenshots:
<img width="1918" height="863" alt="1" src="https://github.com/user-attachments/assets/1f4e58fc-2310-42e0-911c-367bff70b569" />
<img width="1916" height="862" alt="2" src="https://github.com/user-attachments/assets/89265df9-1c7e-4b59-abe9-9b13fb19f830" />
<img width="1917" height="868" alt="3" src="https://github.com/user-attachments/assets/0d4929b9-d811-4b92-8e13-eb330c90a93b" />
<img width="1918" height="862" alt="4" src="https://github.com/user-attachments/assets/b4b9122b-5f7a-4a80-b8c3-d78618a07316" />
<img width="1918" height="866" alt="5" src="https://github.com/user-attachments/assets/53dc9e1e-7155-41d5-8a82-4886453a644a" />
<img width="1918" height="867" alt="6" src="https://github.com/user-attachments/assets/15bd548b-78e3-4fb3-bc42-fe61803943b1" />





