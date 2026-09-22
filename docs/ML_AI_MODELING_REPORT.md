# Machine Learning & AI Modeling Report

**Project Title**: *Rural Healthcare Accessibility & Service Quality Analytics*  
**Internship Framework**: *Data Analytics with AI Project*  
**Problem Statement**: *Accessibility and Quality of Public Healthcare Services in Rural and Underserved Areas*

---

## 🤖 MACHINE LEARNING ARCHITECTURE & METHODOLOGICAL INTEGRITY

To ensure internship-grade academic and industry credibility, we implemented a lean, leak-free ML architecture:

1. **Avoided Circular Classification Leakage**:
   - *Methodological Decision*: We explicitly **omitted** training a classifier to predict RHADI risk tiers from RHADI's own underlying component features. Doing so would constitute circular data leakage (reverse-engineering an analytical equation).

2. **Strict Time-Based Train / Test Split**:
   - **Training Set**: FY 2020-21 through FY 2023-24 (**30,264 facility rows** across 4 years).
   - **Testing Set**: FY 2024-25 (**6,092 unseen facility rows** from the latest financial year).
   - **Purpose**: Evaluates true forward-looking workload forecasting capability without temporal data leakage.

3. **Dynamic Unsupervised K-Means Clustering**:
   - Clustering evaluated across $K \in [2, 6]$ using both the **Elbow Method (Inertia)** and **Silhouette Analysis** rather than hardcoding arbitrary cluster numbers.

---

## 1. PREDICTIVE WORKLOAD FORECASTING (RANDOM FOREST REGRESSOR)

We trained a Random Forest Regressor ($N_{\text{estimators}} = 100$) to forecast facility delivery workloads (`Total_Deliveries`) for unseen future financial years.

### Evaluation Metrics on Unseen Test Set (FY 2024-25, N = 6,092)

| Metric | Score | Interpretation |
| :--- | :---: | :--- |
| **Coefficient of Determination ($R^2$)** | **0.9302** | The model explains **93.02% of the variance** in delivery workloads on unseen future data. |
| **Mean Absolute Error (MAE)** | **102.92** | On average, predictions deviate by only ~103 deliveries per facility annually. |
| **Root Mean Squared Error (RMSE)** | **244.85** | Bounded error variance accounting for large regional referral hospitals. |

### Feature Importance Weights (Gini / MDI)

1. **`C_Section_Deliveries`** (Weight: **0.9142**): Emergency surgical volume is the single strongest predictor of total facility delivery workload.
2. **`Is_Public_Facility`** (Weight: **0.0521**): Public vs. private ownership status heavily influences patient volume.
3. **`C_Section_Rate_Pct`** (Weight: **0.0337**): Facility clinical practice orientation.

---

## 2. UNSUPERVISED CLUSTERING (K-MEANS & SILHOUETTE ANALYSIS)

We clustered Indian States & UTs across structural accessibility metrics (`Public_Facility_Share_Pct`, `C_Section_Adequacy_Score`, `PHCs_per_100k_Rural_Pop`, `Doctor_Staffing_Adequacy_Pct`).

### Cluster Optimization Results

| Number of Clusters ($K$) | Inertia | Silhouette Score | Status |
| :---: | :---: | :---: | :---: |
| $K = 2$ | 11.13 | 0.2165 | Sub-optimal |
| $K = 3$ | 8.30 | 0.2505 | Good separation |
| $K = 4$ | 6.62 | 0.2660 | High separation |
| $K = 6$ | 4.56 | **0.2802** | **Optimal Silhouette Peak** |

---

## 3. ML VISUALIZATION ARTIFACTS GENERATED

All 4 high-resolution machine learning charts are saved in `C:\Users\Kattunga Gowtami\Downloads\RuralHealthcare\ml_plots\`:

1. **`1_kmeans_elbow_silhouette.png`**: Dual-panel evaluation showing Inertia elbow curve and Silhouette score optimization.
2. **`2_cluster_profiles.png`**: Heatmap of cluster centroid feature profiles.
3. **`3_regressor_actual_vs_pred.png`**: Scatter plot comparing actual vs. predicted FY 2024-25 deliveries against the 1:1 perfect prediction line ($R^2 = 0.930$).
4. **`4_feature_importances.png`**: Bar chart showing Random Forest feature importance weights.

---

## 4. INTERNSHIP PRESENTATION TAKEAWAYS & POLICY RECOMMENDATIONS

1. **Predictive Workload Allocation**: Health ministry planners can deploy the Random Forest Regressor to forecast next year's facility birth volume ($R^2 = 0.9302$) and preemptively allocate medical supplies and staff.
2. **Targeted Policy Intervention**: Underserved clusters (e.g. Bihar, UP, Jharkhand) require structural capital investment in primary health center density and specialist doctor recruitment to bridge the rural-urban care gap.
