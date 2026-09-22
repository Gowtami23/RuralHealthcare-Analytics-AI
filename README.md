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
│
├── README.md
├── requirements.txt
├── .gitignore
├── venv/
│   ├── Scripts/
│   ├── Lib/
│   └── ...
│
├── backend/
│   ├── server.py
│   └── extract_rhs_data.py
│
├── database/
│   └── rural_healthcare.db
│
├── datasets/
│   ├── cleaned_facility_deliveries_2020_2025.csv
│   ├── cleaned_state_demographic_targets_2025_2027.csv
│   ├── district_level_healthcare_summary.csv
│   ├── rhadi_state.csv
│   ├── rhadi_district.csv
│   ├── rural_urban_gap.csv
│   ├── ml_predictions_and_clusters.csv
│   ├── scaled_encoded_facility_features.csv
│   └── tmp_facility_deliveries.csv
│
├── analysis/
│   ├── eda_plots/
│   ├── extracted_tables/
│   └── ml_plots/
│
├── models/
│   └── saved_models/
│       ├── cluster_scaler.joblib
│       ├── kmeans_cluster_model.joblib
│       └── rf_regressor_model.joblib
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
│
├── docs/
│   ├── DATA_PREPROCESSING_COMPLETED.md
│   ├── EDA_ANALYSIS_REPORT.md
│   ├── ML_AI_MODELING_REPORT.md
│   └── RURAL_HEALTHCARE_PROBLEM_STATEMENT_GUIDE.md
│
└── source_documents/
    ├── Critical_Issues_Maternal_Child_Health_2015-16.pdf
    ├── Dynamics_of_Healthcare_Services_in_India_2020-21.pdf
    ├── Final_HMIS_Handbook.pdf
    ├── HDI_2022-23.pdf
    ├── Health_Dynamics_of_India_2023-24.pdf
    ├── Lok_Sabha_Unstarred_Q2388_Data_2026.xlsx
    ├── Rural_Health_Statistics_2016-17.pdf
    ├── Rural_Health_Statistics_2017-18.pdf
    ├── Rural_Health_Statistics_2018-19.pdf
    ├── Rural_Health_Statistics_2019-20.pdf
    ├── Rural_Health_Statistics_2020-21.pdf
    ├── Rural_Health_Statistics_2021-22.pdf
    └── Target_PWs_Live_Births_Infant_Estimates_2024-26.pdf
```

---

## 🚀 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Gowtami23/RuralHealthcare-Analytics-AI.git
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
