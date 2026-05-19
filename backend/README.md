# Blood Donation Management System (BDMS) — Backend

## Setup

```bash
pip install -r requirements.txt
cp .env.example .env          # fill in SECRET_KEY and ANTHROPIC_API_KEY
uvicorn app.main:app --reload
```

API docs available at **http://localhost:8000/docs**

---

## Bug Fixes Applied

### `app/main.py`
| # | Bug | Fix |
|---|-----|-----|
| 1 | `from app.routes import camp` appeared **after** a return statement — dead code, router never registered | Moved all imports and `include_router` calls to a clean block before any handler |
| 2 | `from app.routes import camp_registration` imported a misspelled module (`camp_registeration`) | Fixed import name and renamed file |

### `app/auth.py`
| # | Bug | Fix |
|---|-----|-----|
| 3 | Router/endpoint code (`from fastapi import APIRouter...`) pasted **in the middle** of the utility module after `create_token` — the file had two completely different programs merged | Split into `auth.py` (utilities only) and `routes/auth.py` (endpoints) |

### `app/models.py` & `BDMS/models.py`
| # | Bug | Fix |
|---|-----|-----|
| 4 | `User`, `Seeker`, `Donor` classes **defined twice** — once in `BDMS/models.py` (importing from `database`) and again in `BDMS/app/models.py` (importing from `app.database`) | Consolidated into one `app/models.py` with correct import |
| 5 | Duplicate `from sqlalchemy import Column, Integer, String, ForeignKey` lines (3 copies) | Cleaned to single import |
| 6 | `Donor` model missing `available` column — used in `availability.py` routes but not defined | Added `available = Column(Boolean, default=True)` |
| 7 | No `Camp` model in `app/models.py` — `routes/camp.py` tried to import it and would crash | Added `Camp` model with all fields |
| 8 | `otp` / `otp_expiry` columns defined in `BDMS/models.py` User but not in `app/models.py` User | Unified — `User` now has `otp` and `otp_expiry` |

### `app/schemas.py`
| # | Bug | Fix |
|---|-----|-----|
| 9 | Triple duplicate imports (`from pydantic import BaseModel` × 3, `from datetime import date` × 2) | Deduplicated |
| 10 | `SeekerCreate` was **accidentally indented inside `EligibilityCheck`** (4-space indent) — never importable at module level | Fixed indentation |
| 11 | `OTPVerify` schema was **imported in auth routes but never defined** — would raise `ImportError` at startup | Added `OTPVerify` schema |
| 12 | `UserCreate` had no `role` field, but `routes/auth.py` read `user.role` | Added `role: str = "user"` |

### `routes/camp.py`
| # | Bug | Fix |
|---|-----|-----|
| 13 | `return new_camp` at the end of `create_camp` was at **wrong indentation** — all code below it (`get_all_camps`, `update_camp`, `delete_camp`) was unreachable dead code in the same function body | Fixed indentation; each endpoint is a properly separate function |
| 14 | `@router.put` and `@router.delete` decorators were **indented inside** `create_camp`'s body | Moved decorators to module level |
| 15 | `update_camp` / `delete_camp` returned plain `{"message": "Camp not found"}` with HTTP 200 on missing camp | Changed to `raise HTTPException(404, ...)` |

### `donor.py`, `seeker.py`
| # | Bug | Fix |
|---|-----|-----|
| 16 | `user_id=1` **hardcoded** in create donor/seeker — any user's request would be attributed to user #1 | Replaced with `user_id: int = Depends(get_current_user_id)` from JWT |

### `availability.py`
| # | Bug | Fix |
|---|-----|-----|
| 17 | Returned `{"message": "Donor not found"}` with HTTP **200 OK** when donor missing | Changed to `raise HTTPException(404)` |

---

## New Features

### 📍 Geolocation Service (`/geo`)

Uses the **Haversine formula** for great-circle distance — accurate to ±0.5% up to 1000 km.

| Endpoint | Description |
|----------|-------------|
| `POST /geo/nearby-donors` | Available donors within radius (default **5 km**), filter by blood group |
| `POST /geo/nearby-seekers` | Pending blood requests within radius |
| `POST /geo/nearby-camps` | Upcoming camps within radius |
| `GET /geo/geocode?address=` | Address → lat/lon (Nominatim/OpenStreetMap, free) |
| `GET /geo/reverse?latitude=&longitude=` | lat/lon → address |

To enable geolocation on a donor/seeker record, pass `latitude` and `longitude` when creating or updating it.

**Example request:**
```json
POST /geo/nearby-donors
{
  "latitude": 27.7172,
  "longitude": 85.3240,
  "radius_km": 5,
  "blood_group": "O+"
}
```

### 🤖 AI Chat Assistant (`/chat`)

Powered by **Claude (claude-sonnet-4-20250514)**. Answers blood-donation-related questions:
- Eligibility (medications, conditions, waiting periods)
- Blood group compatibility
- Camp participation guidance
- General donation FAQs

Requires `ANTHROPIC_API_KEY` in `.env`.

**Example:**
```json
POST /chat/message
{
  "message": "Can I donate blood if I took ibuprofen yesterday?",
  "history": []
}
```

---

## Project Structure

```
BDMS_fixed/
├── app/
│   ├── main.py            # FastAPI app + router registration
│   ├── database.py        # SQLAlchemy engine + session
│   ├── models.py          # All ORM models (single source of truth)
│   ├── schemas.py         # All Pydantic schemas
│   ├── auth.py            # JWT + password utilities
│   ├── geo.py             # Haversine + Nominatim geocoding
│   └── routes/
│       ├── auth.py        # /auth/register, /auth/login, /auth/verify-otp
│       ├── donor.py       # /donors CRUD
│       ├── seeker.py      # /seekers CRUD
│       ├── eligibility.py # /eligibility check
│       ├── availability.py# /availability toggle
│       ├── camp.py        # /camps CRUD (admin only: create/update/delete)
│       ├── camp_registration.py  # /camp-registration
│       ├── geo.py         # /geo nearby search + geocoding
│       └── chat.py        # /chat AI assistant
├── requirements.txt
└── .env.example
```
