# 🏥 Rural Healthcare Analytics & Patient Care Platform

> **Data Analytics with AI Internship Project**  
> *Addressing Accessibility and Quality of Public Healthcare Services in Rural and Underserved Areas in India using MoHFW & RHS Datasets.*

---

## 📌 Project Overview
This project presents a comprehensive **Data Analytics & AI Solution** for evaluating, modeling, and enhancing public healthcare delivery across Indian states and districts. Built using authentic datasets from the **Ministry of Health and Family Welfare (MoHFW)**, **Health Management Information System (HMIS)**, and **Rural Health Statistics (RHS)**, the platform features:

1. **Dual-Index RHADI Architecture**: Evaluates both **Accessibility Sub-Index** (facility density, doctor staffing) and **Quality Sub-Index** (WHO obstetric C-section adequacy score, public delivery share).
2. **Machine Learning Suite**:
   - **Random Forest Regressor**: Predicts annual facility delivery volume ($R^2 = 0.9302$, $\text{MAE} = 102.92$).
   - **K-Means Clustering**: Identifies district-level performance tiers evaluated via Silhouette score analysis.
3. **Interactive Patient-Centric Web Portal**:
   - Nearby Health Facility & Hospital Locator
   - Appointment Request Management with customizable date/time scheduling
   - Medicine & Care Reminder System
   - Patient Health Records Storage
   - Emergency SOS Contact Directory & Health Guidance Knowledge Hub

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, Tailwind CSS, JavaScript (ES6+ Fetch API), Chart.js |
| **Backend API** | Python 3.10+, Flask RESTful API |
| **Database** | SQLite3 (`rural_healthcare.db`) |
| **Machine Learning** | Scikit-Learn (Random Forest, K-Means Clustering), Joblib |
| **Data Analytics** | Pandas, NumPy, OpenPyXL, pdfplumber |
| **Data Visualization** | Matplotlib, Seaborn |
| **Platform** | IBM Bob IDE & Shell / VS Code |

---

## 📁 Repository Structure

```text
RuralHealthcare/
├── server.py                        # Flask Backend REST API & Server
├── train_ml_models.py               # Supervised & Unsupervised ML Training Script
├── extract_rhs_data.py              # MoHFW PDF RHS Data Extraction Script
├── rural_healthcare.db              # SQLite Database
├── requirements.txt                 # Project Dependencies
├── cleaned_facility_deliveries_2020_2025.csv  # Cleaned Dataset (36,356 records)
├── rhadi_state.csv                  # State Level Dual-Index RHADI Scores
├── rhadi_district.csv               # District Level RHADI Scores
├── eda_plots/                       # Exploratory Data Analysis Charts
├── ml_plots/                        # Machine Learning Evaluation Plots
├── saved_models/                    # Trained Model Artifacts (.joblib)
└── static/                          # Web Portal Frontend
    ├── index.html
    ├── app.js
    └── styles.css
```

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/RuralHealthcare-Analytics-AI.git
cd RuralHealthcare-Analytics-AI
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run ML Training Pipeline (Optional)
```bash
python train_ml_models.py
```

### 4. Launch the Web Application
```bash
python server.py
```
Open your browser at **`http://127.0.0.1:8000`**.

---

## 📜 Key Findings & Statistical Validations
- **WHO Obstetric Quality Index**: C-section delivery rates were transformed using the WHO ideal band (10–15%), benchmarking clinical emergency obstetric quality.
- **MMR Inverse Validation**: Inverse correlation observed between RHADI scores and Maternal Mortality Ratio ($r = -0.3836, p = 0.0209$).
- **Priority Target Regions**: Highlighted Bihar (RHADI: 9.8), Uttar Pradesh (18.2), and Jharkhand (24.5) as primary infrastructure allocation targets.

---

## 📄 License
This project is developed for educational and research purposes as part of the **Data Analytics with AI Internship Program**.
