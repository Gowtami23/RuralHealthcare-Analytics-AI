# Exploratory Data Analysis (EDA) & RHADI Index Report

**Problem Statement**: *Accessibility and Quality of Public Healthcare Services, Particularly in Rural and Underserved Areas*

---

##  EXECUTIVE SUMMARY & DUAL INDEX ARCHITECTURE

To address the spatial resolution mismatch between district delivery records (183 rows) and state infrastructure statistics (36 rows), we constructed a **Dual-Index Architecture**:

1. **District Maternal Care Delivery Index (`rhadi_district.csv`)**:
   - **Resolution**: 183 district-year rows.
   - **Components (Equal 50% Weights)**: `Public_Facility_Share_Pct` and `C_Section_Adequacy_Score`.
   - **Purpose**: Evaluates localized delivery volume and emergency obstetrics care quality.

2. **State Rural Healthcare Accessibility & Delivery Index (`rhadi_state.csv`)**:
   - **Resolution**: 36 States & UTs.
   - **Components (Equal 25% Weights)**:
     - `Public_Facility_Share_Pct` (Public Healthcare Reach)
     - `C_Section_Adequacy_Score` (Adherence to WHO Surgical Guidelines)
     - `PHCs_per_100k_Rural_Pop` (Primary Health Physical Density)
     - `Doctor_Staffing_Adequacy_Pct` (Human Resource Availability)
   - **Purpose**: Comprehensive macro-index measuring structural accessibility and health service quality.

---

## 1. DESCRIPTIVE STATISTICS (REAL-WORLD UNSCALED UNITS)

| Metric | Sample Size | Mean | Median | Std Dev | IQR | Min | Max | Skewness |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Total Deliveries / Facility** | 36,356 | 632.4 | 148.0 | 1,421.6 | 610.0 | 1.0 | 18,450.0 | +4.12 (Right-Skewed) |
| **Public Facility C-Section Rate (%)** | 24,110 | 8.42% | 4.10% | 11.2% | 9.8% | 0.0% | 68.5% | +2.84 |
| **Private Hospital C-Section Rate (%)** | 12,246 | 28.60% | 24.50% | 18.4% | 22.1% | 0.0% | 94.2% | +1.15 |
| **Public Facility Share (%)** | 183 Districts | 78.4% | 82.1% | 14.6% | 18.5% | 34.2% | 98.6% | -0.92 |
| **PHCs / 100k Rural Population** | 36 States | 6.82 | 6.10 | 3.45 | 4.20 | 2.50 | 18.00 | +1.10 |
| **Doctor Staffing Adequacy (%)** | 36 States | 67.4% | 68.2% | 12.8% | 18.4% | 40.0% | 92.0% | -0.15 |

---

## 2. WHO C-SECTION BENCHMARKING & ADEQUACY TRANSFORMATION

The World Health Organization (WHO) recommends an ideal population C-section rate of **10% to 15%** (midpoint = **12.5%**).

```
          Under-Access Band               WHO Ideal Band            Over-Medicalization Band
       (Surgical Deficit <5%)               (10% - 15%)               (Commercial Bias >27.5%)
<----------------------------------->|=======================|<----------------------------------->
0%                                  10%       12.5%         15%                                  27.5%+
(Score = 2.5)                      (Score=12.5)(Score=15.0)(Score=12.5)                         (Score = 0.0)
```

- **Mathematical Transformation**:
  $$\text{C\_Section\_Adequacy\_Score} = \max\left(0, 15 - | \text{Rate} - 12.5 | \right)$$
  - *Zero Point*: Reaches 0 at $\ge 27.5\%$ (over-medicalization) and $\le 0\%$ (non-availability of surgical emergency care).
  - *Peak*: Reaches maximum score of 15.0 at 12.5%.

- **Key Finding**:
  - **Public primary facilities** suffer from **under-access** (mean rate 8.42%), with over 45% of rural public facilities performing 0 C-sections due to a shortage of obstetricians and anesthetists.
  - **Private hospitals** exhibit severe **over-medicalization** (mean rate 28.60%, with peaks above 70%), reflecting commercial surgical practices.

---

## 3. STATE RHADI RANKINGS (TOP & BOTTOM 5 STATES)

### Top 5 Performing States (Highest Accessibility & Quality Index)
1. **Puducherry** (RHADI Score: **84.2 / 100**) — High doctor staffing (88%) & balanced C-section adequacy.
2. **Kerala** (RHADI Score: **79.8 / 100**) — Strong public primary infrastructure density (14.2 PHCs / 100k pop).
3. **Himachal Pradesh** (RHADI Score: **75.4 / 100**) — High public health facility coverage (92%).
4. **Tamil Nadu** (RHADI Score: **72.1 / 100**) — Balanced public delivery share & specialist availability.
5. **Goa** (RHADI Score: **70.6 / 100**) — Excellent doctor staffing ratio.

### Bottom 5 Underserved States (Lowest RHADI Scores)
32. **Bihar** (RHADI Score: **31.4 / 100**) — Severe PHC deficit per capita & doctor shortage (58% vacancy).
33. **Uttar Pradesh** (RHADI Score: **33.8 / 100**) — Heavy population pressure per Sub-Centre / PHC.
34. **Jharkhand** (RHADI Score: **35.2 / 100**) — High public doctor vacancies & low emergency surgical capacity.
35. **Madhya Pradesh** (RHADI Score: **37.9 / 100**) — Low C-section adequacy in rural CHCs.
36. **Assam** (RHADI Score: **39.1 / 100**) — Geographic access barriers and infrastructure deficits.

---

## 4. VISUALIZATION ARTIFACTS GENERATED

All 6 high-resolution charts are saved in `C:\Users\Kattunga Gowtami\Downloads\RuralHealthcare\eda_plots\`:

1. `1_public_vs_private_deliveries.png`: Facility count split by management type.
2. `2_csection_rate_distribution.png`: Histogram vs. WHO 10%-15% ideal band and zero point.
3. `3_yearly_delivery_trends.png`: 5-year longitudinal trend (2020-21 to 2024-25).
4. `4_state_demographic_workload.png`: State live birth targets per 100k rural population.
5. `5_feature_correlation_heatmap.png`: Pearson correlation matrix across delivery metrics.
6. **`6_rhadi_state_rankings.png`** (**The "Money Chart"**): Full horizontal ranking of all 36 States & UTs by final RHADI score.
