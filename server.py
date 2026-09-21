import os
import re
import sqlite3
from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder='static')
folder = r"C:\Users\Kattunga Gowtami\Downloads\RuralHealthcare"
db_path = os.path.join(folder, "rural_healthcare.db")
plots_dir = os.path.join(folder, "eda_plots")

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            contact TEXT,
            facility_name TEXT,
            district TEXT,
            state TEXT,
            dept TEXT,
            appointment_date TEXT,
            time_slot TEXT,
            status TEXT DEFAULT 'Confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            title TEXT,
            reminder_type TEXT,
            time_str TEXT,
            frequency TEXT,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS patient_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            age INTEGER,
            gender TEXT,
            blood_group TEXT,
            condition TEXT,
            record_type TEXT,
            record_date TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return send_from_directory(os.path.join(folder, 'static'), 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(folder, 'static'), filename)

@app.route('/plots/<path:filename>')
def plot_files(filename):
    return send_from_directory(plots_dir, filename)

@app.route('/api/overview', methods=['GET'])
def get_overview():
    conn = get_db_connection()
    c = conn.cursor()
    
    total_facilities = c.execute("SELECT COUNT(*) FROM facility_deliveries").fetchone()[0]
    total_deliveries = c.execute("SELECT SUM(Total_Deliveries) FROM facility_deliveries").fetchone()[0] or 0
    total_csections = c.execute("SELECT SUM(C_Section_Deliveries) FROM facility_deliveries").fetchone()[0] or 0
    public_facilities = c.execute("SELECT COUNT(*) FROM facility_deliveries WHERE Ownership='Public'").fetchone()[0]
    
    top_state_row = c.execute("SELECT State_UT, RHADI_State_Score FROM rhadi_state ORDER BY RHADI_State_Score DESC LIMIT 1").fetchone()
    top_state = dict(top_state_row) if top_state_row else {"State_UT": "N/A", "RHADI_State_Score": 0}
    
    overall_csec_rate = round((total_csections / total_deliveries * 100), 2) if total_deliveries > 0 else 0
    public_share_pct = round((public_facilities / total_facilities * 100), 2) if total_facilities > 0 else 0
    
    conn.close()
    
    return jsonify({
        "total_facilities": total_facilities,
        "total_deliveries": total_deliveries,
        "total_csections": total_csections,
        "overall_csec_rate": overall_csec_rate,
        "public_facilities": public_facilities,
        "public_share_pct": public_share_pct,
        "top_state": top_state["State_UT"],
        "top_state_score": top_state["RHADI_State_Score"]
    })

@app.route('/api/states', methods=['GET'])
def get_states():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM rhadi_state ORDER BY RHADI_State_Score DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/districts', methods=['GET'])
def get_districts():
    state_filter = request.args.get('state', '').strip()
    conn = get_db_connection()
    if state_filter:
        rows = conn.execute("SELECT * FROM rhadi_district WHERE State = ? ORDER BY RHADI_District_Score DESC", (state_filter,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM rhadi_district ORDER BY RHADI_District_Score DESC").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/facilities', methods=['GET'])
def get_facilities():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    search = request.args.get('search', '').strip()
    state_filter = request.args.get('state', '').strip()
    ownership_filter = request.args.get('ownership', '').strip()
    
    query = "SELECT * FROM facility_deliveries WHERE 1=1"
    params = []
    
    if search:
        query += " AND (Facility_Name LIKE ? OR District LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if state_filter:
        query += " AND State = ?"
        params.append(state_filter)
    if ownership_filter:
        query += " AND Ownership = ?"
        params.append(ownership_filter)
        
    conn = get_db_connection()
    count_query = f"SELECT COUNT(*) FROM ({query})"
    total_count = conn.execute(count_query, params).fetchone()[0]
    
    offset = (page - 1) * per_page
    query += " ORDER BY Total_Deliveries DESC LIMIT ? OFFSET ?"
    params.extend([per_page, offset])
    
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    return jsonify({
        "total_records": total_count,
        "page": page,
        "per_page": per_page,
        "total_pages": (total_count + per_page - 1) // per_page,
        "data": [dict(r) for r in rows]
    })

# --- NEW FEATURE 1: HOSPITAL / HEALTH CENTER LOCATOR ---
@app.route('/api/locator', methods=['GET'])
def get_locator():
    search = request.args.get('query', '').strip()
    state = request.args.get('state', '').strip()
    district = request.args.get('district', '').strip()
    
    query = "SELECT * FROM facility_deliveries WHERE 1=1"
    params = []
    
    if search:
        query += " AND (Facility_Name LIKE ? OR District LIKE ? OR State LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
    if state:
        query += " AND State = ?"
        params.append(state)
    if district:
        query += " AND District = ?"
        params.append(district)
        
    query += " ORDER BY Total_Deliveries DESC LIMIT 30"
    
    conn = get_db_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()
    
    return jsonify([dict(r) for r in rows])

# --- NEW FEATURE 2: APPOINTMENT MANAGEMENT ---
@app.route('/api/appointments', methods=['GET', 'POST'])
def manage_appointments():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json or {}
        pname = data.get('patient_name', 'Anonymous')
        contact = data.get('contact', '').strip()
        
        # Backend Phone Number Validation (Indian 10-digit mobile standard)
        clean_contact = re.sub(r'[\s\-\(\)\+]', '', contact)
        if clean_contact.startswith('91') and len(clean_contact) == 12:
            clean_contact = clean_contact[2:]
        elif clean_contact.startswith('0') and len(clean_contact) == 11:
            clean_contact = clean_contact[1:]

        if not (len(clean_contact) == 10 and clean_contact.isdigit() and clean_contact[0] in '6789'):
            return jsonify({
                "success": False, 
                "message": "Invalid phone number! Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9."
            }), 400

        fname = data.get('facility_name', 'Primary Health Centre')
        district = data.get('district', 'Alwar')
        state = data.get('state', 'Rajasthan')
        dept = data.get('dept', 'General Primary Care')
        adate = data.get('appointment_date', '2026-09-25')
        tslot = data.get('time_slot', '10:00 AM')
        
        conn.execute(
            "INSERT INTO appointments (patient_name, contact, facility_name, district, state, dept, appointment_date, time_slot, status) VALUES (?,?,?,?,?,?,?,?,?)",
            (pname, clean_contact, fname, district, state, dept, adate, tslot, 'Confirmed')
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Appointment booked successfully!"})
    else:
        rows = conn.execute("SELECT * FROM appointments ORDER BY id DESC").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])

# --- NEW FEATURE 3: MEDICINE & APPOINTMENT REMINDERS ---
@app.route('/api/reminders', methods=['GET', 'POST'])
def manage_reminders():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json or {}
        pname = data.get('patient_name', 'Gowtami K.')
        title = data.get('title', 'Medicine Reminder')
        rtype = data.get('reminder_type', 'Medicine')
        tstr = data.get('time_str', '09:00 AM')
        freq = data.get('frequency', 'Daily')
        
        conn.execute(
            "INSERT INTO reminders (patient_name, title, reminder_type, time_str, frequency, status) VALUES (?,?,?,?,?,?)",
            (pname, title, rtype, tstr, freq, 'Active')
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Reminder created successfully!"})
    else:
        rows = conn.execute("SELECT * FROM reminders WHERE status='Active' ORDER BY id DESC").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])

# --- NEW FEATURE 4: PATIENT HEALTH RECORDS ---
@app.route('/api/records', methods=['GET', 'POST'])
def manage_records():
    conn = get_db_connection()
    if request.method == 'POST':
        data = request.json or {}
        pname = data.get('patient_name', 'Gowtami K.')
        age = data.get('age', 26)
        gender = data.get('gender', 'Female')
        bgroup = data.get('blood_group', 'O+')
        cond = data.get('condition', 'General Checkup')
        rtype = data.get('record_type', 'Prescription')
        rdate = data.get('record_date', '2026-09-20')
        notes = data.get('notes', 'Routine checkup completed.')
        
        conn.execute(
            "INSERT INTO patient_records (patient_name, age, gender, blood_group, condition, record_type, record_date, notes) VALUES (?,?,?,?,?,?,?,?)",
            (pname, age, gender, bgroup, cond, rtype, rdate, notes)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Health record saved successfully!"})
    else:
        rows = conn.execute("SELECT * FROM patient_records ORDER BY id DESC").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])

# --- NEW FEATURE 5: BASIC HEALTH GUIDANCE ---
@app.route('/api/healthinfo', methods=['GET'])
def get_healthinfo():
    articles = [
        {
            "category": "Maternal & Prenatal Care",
            "title": "Essential Antenatal Care (ANC) Guidelines for Rural Mothers",
            "summary": "Every pregnant woman should register for ANC within 12 weeks of pregnancy and complete at least 4 checkups, including Tetanus Toxoid vaccination and Iron-Folic Acid supplementation."
        },
        {
            "category": "Child Immunization",
            "title": "National Immunization Schedule (Birth to 5 Years)",
            "summary": "Ensure BCG, OPV, and Hepatitis B at birth, followed by Pentavalent and Rotavirus vaccines at 6, 10, and 14 weeks at your local Primary Health Centre (PHC)."
        },
        {
            "category": "Emergency Obstetrics",
            "title": "Recognizing High-Risk Pregnancy Warning Signs",
            "summary": "Immediate emergency hospitalization (108 Ambulance) is required for severe bleeding, high blood pressure/headaches, persistent fever, or reduced fetal movement."
        },
        {
            "category": "Nutrition & Anemia Prevention",
            "title": "POSHAN Abhiyaan Rural Nutritional Support",
            "summary": "Take daily Iron Folic Acid (IFA) tablets provided free at Anganwadi centers and Sub-Centres to combat maternal anemia."
        }
    ]
    return jsonify(articles)

if __name__ == '__main__':
    print("Starting Rural Healthcare Dashboard Web Server on http://127.0.0.1:8000...")
    app.run(host='0.0.0.0', port=8000, debug=False)
