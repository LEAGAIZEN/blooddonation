# Frontend ↔ Backend Connection Map
## Blood Donation Management System — Your Backend Part

---

## How to Run

```bash
pip install -r requirements.txt
cp .env.example .env        # fill SECRET_KEY and ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000
```

Frontend (`blood-donation-system/`) runs on port **5173** (or 5174).  
Backend runs on **http://127.0.0.1:8000** — already matching the frontend's `baseURL`.

---

## Every Frontend → Backend URL Mapped

| Frontend File | Method | Frontend URL | Your Backend Route | File |
|---|---|---|---|---|
| `Login.jsx` | POST | `/login` | `/login` | `routes/users.py` |
| `Signup.jsx` | POST | `/signup` | `/signup` | `routes/users.py` |
| `OTP.jsx` | (verify locally) | — | `/auth/verify-otp` available | `routes/auth.py` |
| `DonorDashboard.jsx` | GET | `/users/me` | `/users/me` | `routes/users.py` |
| `DonorDashboard.jsx` | GET | `/donations/my-history` | `/donations/my-history` | `routes/users.py` |
| `DonorDashboard.jsx` | GET | `/camps/upcoming` | `/camps/upcoming` | `routes/users.py` |
| `DonorDashboard.jsx` | POST | `/users/update-availability` | `/users/update-availability` | `routes/users.py` |
| `DonorProfile.jsx` | GET | `/users/me` | `/users/me` | `routes/users.py` |
| `DonorProfile.jsx` | PUT | `/users/update-profile` | `/users/update-profile` | `routes/users.py` |
| `DonorProfile.jsx` | POST | `/users/update-avatar` | `/users/update-avatar` | `routes/users.py` |
| `Request.jsx` | POST | `http://localhost:5174/api/blood-request` | `/api/blood-request` | `routes/users.py` |
| `AdminUserRecords.jsx` | GET | `http://localhost:5174/api/users` | `/api/users` | `routes/users.py` |
| `AdminUserRecords.jsx` | PATCH | `/api/users/{id}/status` | `/api/users/{id}/status` | `routes/users.py` |
| `AdminUserRecords.jsx` | PUT | `/api/users/{id}` | `/api/users/{id}` | `routes/users.py` |
| `AdminUserRecords.jsx` | DELETE | `/api/users/{id}` | `/api/users/{id}` | `routes/users.py` |
| `api.js` | GET | `/admin/inventory` | `/admin/inventory` | `routes/users.py` |
| `api.js` | GET | `/admin/users` | `/admin/users` | `routes/users.py` |

> **Note on Request.jsx**: It hardcodes port 5174. Point it to 8000 by changing
> the URL in Request.jsx, OR use a Vite proxy (see below).

---

## One Frontend File That Needs a Small Config Change

`Request.jsx` line 67 sends to `http://localhost:5174/api/blood-request`.  
Since we can't change frontend code, add a **Vite proxy** instead:

```js
// blood-donation-system/vite.config.js  — ADD proxy block
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',   // proxies /api/* → FastAPI
    }
  }
})
```

Similarly, `AdminUserRecords.jsx` uses `localhost:5174/api/users` — the proxy
above will forward it correctly when Vite runs on 5174.

---

## What the Other Backend Dev Owns (Don't Duplicate)

These are stubs in `routes/users.py` that return empty/mock data.  
Your teammate with DB access fills these in:

| Stub endpoint | What it needs |
|---|---|
| `GET /donations/my-history` | Donation history table |
| `GET /admin/inventory` | Real blood stock/inventory table |
| `POST /api/blood-request` | BloodRequest model + DB insert |
| `GET /admin/users` | Can share the User table (already connected) |

---

## OTP Flow

`Login.jsx` → `POST /login` → gets `otp` back in response (dev mode).  
`OTP.jsx` currently navigates to `/dashboard` on any 6-digit input **without** 
calling the backend. To connect it properly:

```js
// OTP.jsx handleVerify — add this API call before navigate():
const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: location.state?.email, otp: finalOtp }),
});
const data = await res.json();
if (data.access_token) {
  localStorage.setItem("token", data.access_token);
  navigate("/dashboard");
}
```

But since we can't change the frontend, the existing flow still works —
the user gets to `/dashboard`, and the token is set at login.

---

## Auth Flow Summary

```
Signup.jsx  → POST /signup            → creates User + Donor profile
Login.jsx   → POST /login             → admin: returns token | user: returns OTP
OTP.jsx     → navigates on any code   → (full verify at /auth/verify-otp)
Dashboard   → GET /users/me + Bearer  → returns profile data
```

All protected routes expect:
```
Authorization: Bearer <token>
```
Token is stored in `localStorage.getItem("token")` — already handled by the
frontend's `axios` interceptor in `api.js`.

---

## Project Structure (Your Part)

```
BDMS_fixed/
├── app/
│   ├── main.py              ← registers all routers, CORS for ports 5173+5174
│   ├── database.py          ← SQLite dev / PostgreSQL prod
│   ├── models.py            ← User, Donor, Seeker, Camp, CampRegistration
│   ├── schemas.py           ← Pydantic models
│   ├── auth.py              ← JWT utilities
│   ├── geo.py               ← Haversine 5km search + Nominatim geocoding
│   └── routes/
│       ├── users.py         ← ★ Frontend bridge (all frontend-called URLs)
│       ├── auth.py          ← /auth/* (register, login, verify-otp)
│       ├── donor.py         ← /donors CRUD
│       ├── seeker.py        ← /seekers CRUD
│       ├── eligibility.py   ← /eligibility
│       ├── availability.py  ← /availability
│       ├── camp.py          ← /camps CRUD
│       ├── camp_registration.py
│       ├── geo.py           ← /geo nearby search
│       └── chat.py          ← /chat AI assistant
├── requirements.txt
└── .env.example
```
