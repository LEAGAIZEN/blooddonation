import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'backend', 'bdms.db')
print(f"Connecting to database at {db_path}...")

conn = sqlite3.connect(db_path)
c = conn.cursor()
try:
    c.execute('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0')
    conn.commit()
    print("SUCCESS: Column 'is_verified' added successfully to 'users' table.")
except sqlite3.OperationalError as e:
    print("INFO: Column 'is_verified' already exists or other error occurred:", e)

conn.close()
