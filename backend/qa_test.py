import requests, sqlite3, subprocess

BASE = "http://127.0.0.1:8000"
results = []

def test(name, method, url, body=None, headers=None, expected=200):
    try:
        r = getattr(requests, method)(url, json=body, headers=headers or {})
        status = "✅ PASS" if r.status_code == expected else f"❌ FAIL ({r.status_code})"
        snippet = r.text[:90].replace("\n", " ")
        results.append(f"{status} | {name} | {snippet}")
    except Exception as e:
        results.append(f"❌ ERROR | {name} | {str(e)[:80]}")

# ── AUTH ──────────────────────────────────────────────────────────────
test("Signup new user",     "post", f"{BASE}/signup",
     {"fullName":"QA Test","email":"qaunique99@test.com","phone":"9999","bloodGroup":"O+","password":"Test1234"})
test("Signup duplicate",    "post", f"{BASE}/signup",
     {"fullName":"QA","email":"qaunique99@test.com","password":"Test1234"}, expected=400)
test("Login wrong password","post", f"{BASE}/login",
     {"username":"qaunique99@test.com","password":"WrongPass"}, expected=401)

# ── Get token for the test user ───────────────────────────────────────
conn = sqlite3.connect("bdms.db")
c = conn.cursor()
c.execute("SELECT id FROM users WHERE email='qaunique99@test.com'")
row = c.fetchone()
conn.close()

if not row:
    results.append("❌ SKIP | All protected tests | test user not found in DB")
else:
    uid = row[0]
    def make_token(role):
        res = subprocess.run(
            ["venv_win/Scripts/python.exe", "-c",
             f"from app.auth import create_token; print(create_token({{'user_id':{uid},'role':'{role}'}}))"],
            capture_output=True, text=True, cwd="."
        )
        return res.stdout.strip()

    H  = {"Authorization": f"Bearer {make_token('user')}"}
    AH = {"Authorization": f"Bearer {make_token('admin')}"}

    # ── PROTECTED USER ROUTES ─────────────────────────────────────────
    test("GET  /users/me",              "get",  f"{BASE}/users/me", headers=H)
    test("PUT  /users/update-profile",  "put",  f"{BASE}/users/update-profile",
         {"fullName":"QA Tester","bloodGroup":"O+","phone":"1234567890","age":"25","weight":"70"}, headers=H)
    test("GET  /users/me after update", "get",  f"{BASE}/users/me", headers=H)
    test("GET  /donations/my-history",  "get",  f"{BASE}/donations/my-history", headers=H)
    test("GET  /camps/upcoming",        "get",  f"{BASE}/camps/upcoming", headers=H)
    test("POST /resend-otp",            "post", f"{BASE}/resend-otp",
         {"email":"qaunique99@test.com"})

    # ── ADMIN ROUTES ──────────────────────────────────────────────────
    test("GET  /admin/users",           "get",  f"{BASE}/admin/users",  headers=AH)
    test("GET  /admin/inventory",       "get",  f"{BASE}/admin/inventory", headers=AH)
    test("PUT  /admin/users/{id} edit", "put",  f"{BASE}/admin/users/{uid}",
         {"name":"QA Edited","email":"qaunique99@test.com","role":"user","blood":"A-"}, headers=AH)

    # ── DB WRITE VERIFICATION ─────────────────────────────────────────
    conn2 = sqlite3.connect("bdms.db")
    c2 = conn2.cursor()
    c2.execute("SELECT full_name, phone FROM users WHERE email='qaunique99@test.com'")
    db_row = c2.fetchone()
    c2.execute("SELECT blood_group FROM donors WHERE user_id=?", (uid,))
    donor_row = c2.fetchone()
    conn2.close()

    if db_row and db_row[0] == "QA Tester":
        results.append(f"✅ PASS | DB: full_name saved correctly | {db_row}")
    else:
        results.append(f"❌ FAIL | DB: full_name NOT saved        | {db_row}")

    if donor_row and donor_row[0] == "A-":
        results.append(f"✅ PASS | DB: blood_group saved by admin  | {donor_row}")
    else:
        results.append(f"❌ FAIL | DB: blood_group NOT updated      | {donor_row}")

    # ── DELETE TEST USER (cleanup) ────────────────────────────────────
    test("DELETE /admin/users/{id}", "delete", f"{BASE}/admin/users/{uid}", headers=AH)

print("\n" + "="*70)
print("  BDMS FULL FUNCTIONALITY REPORT")
print("="*70)
for r in results:
    print(r)
print("="*70)
passed = sum(1 for r in results if r.startswith("✅"))
failed = sum(1 for r in results if r.startswith("❌"))
print(f"\n  TOTAL: {passed} PASSED  |  {failed} FAILED\n")
