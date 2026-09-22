// Rural Healthcare Portal JavaScript Application Logic

let rhadiChartInstance = null;
let doughnutChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize saved theme (Light / Dark)
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  // Initialize appointment date picker to today's date
  const dateInput = document.getElementById('appt-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  loadOverview();
  loadStateRHADI();
  loadDistrictTable();
  loadLocator();
  loadAppointments();
  loadReminders();
  loadRecords();
  loadHealthInfo();
});

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  if (theme === 'light') {
    html.classList.remove('dark');
    if (themeIcon) themeIcon.className = 'fa-solid fa-moon text-indigo-600 mr-2 text-sm';
    if (themeText) themeText.innerText = 'Dark Mode';
  } else {
    html.classList.add('dark');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun text-amber-400 mr-2 text-sm';
    if (themeText) themeText.innerText = 'Light Mode';
  }

  // Refresh active charts with dynamic text colors
  if (typeof loadOverview === 'function') loadOverview();
  if (typeof loadStateRHADI === 'function') loadStateRHADI();
}

function getChartTextColor() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#f8fafc' : '#0f172a';
}

function getChartSubtextColor() {
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#94a3b8' : '#334155';
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const target = document.getElementById(tabId);
  const btn = document.getElementById(`nav-${tabId}`);
  if (target) target.classList.remove('hidden');
  if (btn) btn.classList.add('active');
}

async function loadOverview() {
  try {
    const res = await fetch('/api/overview');
    const data = await res.json();

    document.getElementById('kpi-facilities').innerText = Number(data.total_facilities).toLocaleString();
    document.getElementById('kpi-deliveries').innerText = Number(data.total_deliveries).toLocaleString();
    document.getElementById('kpi-csec-rate').innerText = `${data.overall_csec_rate}%`;
    document.getElementById('kpi-top-state').innerText = data.top_state;
    document.getElementById('kpi-top-score').innerText = `Score: ${data.top_state_score}`;

    renderOwnershipDoughnut(data.public_facilities, data.total_facilities - data.public_facilities);
  } catch (err) {
    console.error("Error loading overview:", err);
  }
}

async function loadStateRHADI() {
  try {
    const res = await fetch('/api/states');
    const states = await res.json();

    const tbody = document.getElementById('table-rhadi-state-body');
    tbody.innerHTML = '';
    states.forEach((st, idx) => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/40 transition";
      tr.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-400">#${idx + 1}</td>
        <td class="py-3 px-4 font-semibold text-white">${st.State_UT}</td>
        <td class="py-3 px-4 font-bold ${st.RHADI_State_Score >= 60 ? 'text-emerald-400' : (st.RHADI_State_Score >= 40 ? 'text-amber-400' : 'text-rose-400')}">${st.RHADI_State_Score}</td>
        <td class="py-3 px-4 font-semibold text-blue-400">${st.Accessibility_Sub_Index || 0}</td>
        <td class="py-3 px-4 font-semibold text-indigo-400">${st.Quality_Sub_Index || 0}</td>
        <td class="py-3 px-4">${st.PHCs_per_100k_Rural_Pop}</td>
        <td class="py-3 px-4">${st.Doctor_Staffing_Adequacy_Pct}%</td>
      `;
      tbody.appendChild(tr);
    });

    renderStateRHADIChart(states.slice(0, 15));
  } catch (err) {
    console.error("Error loading state RHADI:", err);
  }
}

function renderStateRHADIChart(topStates) {
  const ctx = document.getElementById('chart-rhadi-state').getContext('2d');
  
  if (rhadiChartInstance) {
    rhadiChartInstance.destroy();
  }

  const labels = topStates.map(s => s.State_UT).reverse();
  const scores = topStates.map(s => s.RHADI_State_Score).reverse();
  const textColor = getChartTextColor();
  const subtextColor = getChartSubtextColor();

  rhadiChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'RHADI Score (0 to 100)',
        data: scores,
        backgroundColor: scores.map(s => s >= 60 ? '#10b981' : (s >= 40 ? '#f59e0b' : '#ef4444')),
        borderRadius: 6,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` RHADI Index Score: ${ctx.raw} / 100`
          }
        }
      },
      scales: {
        x: {
          max: 100,
          grid: { color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)' },
          ticks: { color: subtextColor, font: { size: 11, weight: 'bold' } }
        },
        y: {
          grid: { display: false },
          ticks: { color: textColor, font: { size: 12, weight: 'bold' } }
        }
      }
    }
  });
}

function renderOwnershipDoughnut(publicCount, privateCount) {
  const ctx = document.getElementById('chart-ownership-doughnut').getContext('2d');
  
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
  }

  const subtextColor = getChartSubtextColor();

  doughnutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Public / Govt', 'Private Hospitals'],
      datasets: [{
        data: [publicCount, privateCount],
        backgroundColor: ['#3b82f6', '#f59e0b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: subtextColor, font: { size: 12, weight: 'bold' } } }
      }
    }
  });
}

async function loadDistrictTable() {
  const stateFilter = document.getElementById('filter-district-state').value;
  try {
    const res = await fetch(`/api/districts?state=${encodeURIComponent(stateFilter)}`);
    const districts = await res.json();

    const tbody = document.getElementById('table-rhadi-district-body');
    tbody.innerHTML = '';
    districts.forEach(d => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-800/40 transition";
      tr.innerHTML = `
        <td class="py-3 px-4 font-mono text-xs text-slate-400">${d.Financial_Year}</td>
        <td class="py-3 px-4">${d.State}</td>
        <td class="py-3 px-4 font-semibold text-white">${d.District}</td>
        <td class="py-3 px-4 font-bold ${d.RHADI_District_Score >= 50 ? 'text-emerald-400' : 'text-amber-400'}">${d.RHADI_District_Score}</td>
        <td class="py-3 px-4 font-semibold text-indigo-400">${d.Quality_Sub_Index || 0}</td>
        <td class="py-3 px-4">${d.Public_Facility_Share_Pct}%</td>
        <td class="py-3 px-4">${d.District_C_Section_Rate_Pct}%</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading district table:", err);
  }
}

async function loadLocator(query = '') {
  try {
    const res = await fetch(`/api/locator?query=${encodeURIComponent(query)}`);
    const facilities = await res.json();

    const container = document.getElementById('locator-results');
    container.innerHTML = '';

    if (facilities.length === 0) {
      container.innerHTML = `<div class="col-span-3 text-center py-8 text-slate-400">No health centers found matching your query.</div>`;
      return;
    }

    facilities.forEach(f => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-blue-500/50 transition";
      card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-2">
            <span class="px-2.5 py-1 text-xs font-semibold rounded-md ${f.Ownership === 'Public' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">${f.Ownership} Facility</span>
            <span class="text-xs text-slate-400 font-mono">${f.Financial_Year}</span>
          </div>
          <h3 class="text-base font-bold text-white mb-1"><i class="fa-solid fa-hospital text-blue-400 mr-2"></i>${f.Facility_Name}</h3>
          <p class="text-xs text-slate-400 mb-3"><i class="fa-solid fa-location-dot text-rose-400 mr-1.5"></i>${f.District}, ${f.State}</p>
          
          <div class="grid grid-cols-2 gap-2 text-xs bg-slate-800/60 p-3 rounded-xl mb-4 border border-slate-700/50">
            <div>
              <span class="text-slate-400 block">Reported Deliveries</span>
              <span class="font-bold text-white text-sm">${Number(f.Total_Deliveries).toLocaleString()}</span>
            </div>
            <div>
              <span class="text-slate-400 block">C-Section Rate</span>
              <span class="font-bold text-amber-400 text-sm">${f.C_Section_Rate_Pct}%</span>
            </div>
          </div>
        </div>

        <div class="flex space-x-2">
          <button onclick="presetAppointment('${f.Facility_Name.replace(/'/g, "\\'")}', '${f.District}', '${f.State}')" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg transition text-center">
            <i class="fa-solid fa-calendar-check mr-1.5"></i>Book Visit
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading locator:", err);
  }
}

let locatorTimer;
function searchLocator() {
  clearTimeout(locatorTimer);
  locatorTimer = setTimeout(() => {
    const q = document.getElementById('locator-query').value.trim();
    loadLocator(q);
  }, 300);
}

function presetAppointment(facility, district, state) {
  switchTab('tab-appointments');
  document.getElementById('appt-facility').value = facility;
}

// --- APPOINTMENT MANAGEMENT WITH FIXED DATE HANDLING ---
async function loadAppointments() {
  try {
    const res = await fetch('/api/appointments');
    const appts = await res.json();

    const list = document.getElementById('appointments-list');
    list.innerHTML = '';

    if (appts.length === 0) {
      list.innerHTML = `<p class="text-xs text-slate-400">No scheduled appointments found.</p>`;
      return;
    }

    appts.forEach(a => {
      const item = document.createElement('div');
      item.className = "bg-slate-900/60 border border-slate-700 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3";
      item.innerHTML = `
        <div>
          <div class="flex items-center space-x-2 mb-1">
            <h4 class="text-sm font-bold text-white">${a.patient_name}</h4>
            <span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">${a.status}</span>
          </div>
          <p class="text-xs text-slate-300 font-medium"><i class="fa-solid fa-building-circle-check text-blue-400 mr-1.5"></i>${a.facility_name} (${a.dept})</p>
          <p class="text-[11px] text-slate-400 mt-1"><i class="fa-solid fa-location-dot mr-1"></i>${a.district}, ${a.state} &bull; Contact: ${a.contact}</p>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold block"><i class="fa-solid fa-calendar-day mr-1"></i>${a.appointment_date} @ ${a.time_slot}</span>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    console.error("Error loading appointments:", err);
  }
}

async function submitAppointment(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('btn-submit-appt');
  const statusMsg = document.getElementById('appt-status-msg');

  const rawContact = document.getElementById('appt-contact').value.trim();
  // Strip spaces, dashes, parentheses, +91 prefix, leading 0
  let cleanedPhone = rawContact.replace(/[\s\-\(\)\+]/g, '');
  if (cleanedPhone.startsWith('91') && cleanedPhone.length === 12) {
    cleanedPhone = cleanedPhone.substring(2);
  } else if (cleanedPhone.startsWith('0') && cleanedPhone.length === 11) {
    cleanedPhone = cleanedPhone.substring(1);
  }

  // Validate 10-digit mobile number starting with 6, 7, 8, or 9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    if (statusMsg) {
      statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 block";
      statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-rose-400"></i> Please enter a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210).`;
    }
    return;
  }

  const dateVal = document.getElementById('appt-date').value || new Date().toISOString().split('T')[0];
  const slotVal = document.getElementById('appt-slot') ? document.getElementById('appt-slot').value : '10:00 AM';

  const payload = {
    patient_name: document.getElementById('appt-name').value,
    contact: cleanedPhone,
    facility_name: document.getElementById('appt-facility').value,
    dept: document.getElementById('appt-dept').value,
    appointment_date: dateVal,
    time_slot: slotVal
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2 text-base"></i>Submitting Request...`;
  }

  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resp = await res.json();

    if (resp.success) {
      if (statusMsg) {
        statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 block";
        statusMsg.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Appointment booked successfully for <strong>${dateVal}</strong> at <strong>${slotVal}</strong>!`;
      }
      document.getElementById('appt-name').value = '';
      document.getElementById('appt-contact').value = '';
      loadAppointments();

      setTimeout(() => {
        if (statusMsg) statusMsg.className = "hidden";
      }, 5000);
    } else {
      if (statusMsg) {
        statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 block";
        statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> ${resp.message || 'Error submitting request.'}`;
      }
    }
  } catch (err) {
    console.error("Error submitting appointment:", err);
    if (statusMsg) {
      statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 block";
      statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Failed to submit. Please ensure the backend server is running.`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane mr-2 text-base"></i>Submit Appointment Request`;
    }
  }
}

// --- REMINDERS ---
async function loadReminders() {
  try {
    const res = await fetch('/api/reminders');
    const rems = await res.json();

    const list = document.getElementById('reminders-list');
    list.innerHTML = '';

    rems.forEach(r => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/60 border border-slate-700 p-4 rounded-xl flex items-center justify-between";
      card.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="p-3 ${r.reminder_type === 'Medicine' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'} rounded-xl">
            <i class="fa-solid ${r.reminder_type === 'Medicine' ? 'fa-pills' : 'fa-calendar-day'} text-xl"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">${r.title}</h4>
            <p class="text-xs text-slate-400">${r.patient_name} &bull; ${r.frequency}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-sm font-extrabold text-amber-400"><i class="fa-solid fa-clock mr-1"></i>${r.time_str}</span>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading reminders:", err);
  }
}

async function submitReminder(event) {
  event.preventDefault();
  const payload = {
    title: document.getElementById('rem-title').value,
    reminder_type: document.getElementById('rem-type').value,
    time_str: document.getElementById('rem-time').value
  };

  try {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resp = await res.json();
    if (resp.success) {
      alert("Reminder saved successfully!");
      document.getElementById('rem-title').value = '';
      loadReminders();
    }
  } catch (err) {
    console.error("Error submitting reminder:", err);
  }
}

// --- PATIENT HEALTH RECORDS WITH PHONE VALIDATION & DUPLICATE CHECK ---
async function loadRecords() {
  try {
    const res = await fetch('/api/records');
    const recs = await res.json();

    const list = document.getElementById('records-list');
    list.innerHTML = '';

    if (recs.length === 0) {
      list.innerHTML = `<p class="text-xs text-slate-400">No stored patient health records found.</p>`;
      return;
    }

    recs.forEach(r => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/60 border border-slate-700 p-5 rounded-2xl shadow-md";
      card.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2">
          <div>
            <h4 class="text-base font-bold text-white">${r.patient_name} <span class="text-xs font-normal text-slate-400">(${r.age} yrs, ${r.gender || 'General'})</span></h4>
            <p class="text-xs text-blue-400 font-semibold mt-0.5"><i class="fa-solid fa-phone text-indigo-400 mr-1"></i>Contact: ${r.contact || 'N/A'} &bull; <i class="fa-solid fa-notes-medical mr-1"></i>${r.condition}</p>
          </div>
          <span class="px-2.5 py-1 text-xs font-bold bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30">Blood Group: ${r.blood_group}</span>
        </div>
        <p class="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 mt-3">${r.notes || 'No extra observations recorded.'}</p>
        <div class="text-right mt-2">
          <span class="text-[10px] text-slate-400">Recorded on: ${r.record_date || 'Recent'}</span>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading records:", err);
  }
}

async function submitRecord(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById('btn-submit-rec');
  const statusMsg = document.getElementById('rec-status-msg');

  const rawContact = document.getElementById('rec-contact').value.trim();
  let cleanedPhone = rawContact.replace(/[\s\-\(\)\+]/g, '');
  if (cleanedPhone.startsWith('91') && cleanedPhone.length === 12) {
    cleanedPhone = cleanedPhone.substring(2);
  } else if (cleanedPhone.startsWith('0') && cleanedPhone.length === 11) {
    cleanedPhone = cleanedPhone.substring(1);
  }

  // Regex validation for 10-digit mobile number
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanedPhone)) {
    if (statusMsg) {
      statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 block";
      statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-rose-400"></i> Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.`;
    }
    return;
  }

  const payload = {
    patient_name: document.getElementById('rec-name').value,
    contact: cleanedPhone,
    age: document.getElementById('rec-age').value,
    blood_group: document.getElementById('rec-blood').value,
    condition: document.getElementById('rec-cond').value,
    notes: document.getElementById('rec-notes').value
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Saving Patient Record...`;
  }

  try {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const resp = await res.json();

    if (resp.success) {
      if (statusMsg) {
        statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40 block";
        statusMsg.innerHTML = `<i class="fa-solid fa-circle-check mr-1.5 text-emerald-400"></i> Patient details and health record saved successfully!`;
      }
      document.getElementById('rec-name').value = '';
      document.getElementById('rec-contact').value = '';
      document.getElementById('rec-cond').value = '';
      document.getElementById('rec-notes').value = '';
      loadRecords();

      setTimeout(() => {
        if (statusMsg) statusMsg.className = "hidden";
      }, 5000);
    } else {
      if (statusMsg) {
        statusMsg.className = `p-3.5 mb-3 rounded-xl text-xs font-bold border ${resp.warning ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'} block`;
        statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5 text-amber-400"></i> ${resp.message}`;
      }
    }
  } catch (err) {
    console.error("Error submitting record:", err);
    if (statusMsg) {
      statusMsg.className = "p-3.5 mb-3 rounded-xl text-xs font-bold border bg-rose-500/20 text-rose-300 border-rose-500/40 block";
      statusMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1.5"></i> Failed to save record. Please check server connection.`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-floppy-disk mr-2"></i>Save Patient Health Record`;
    }
  }
}

// --- BASIC HEALTH GUIDANCE KNOWLEDGE HUB ---
async function loadHealthInfo() {
  try {
    const res = await fetch('/api/healthinfo');
    const articles = await res.json();

    const container = document.getElementById('healthinfo-articles');
    container.innerHTML = '';

    articles.forEach(a => {
      const card = document.createElement('div');
      card.className = "bg-slate-900/60 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 rounded-md border border-teal-500/30 mb-3 inline-block">${a.category}</span>
          <h3 class="text-base font-bold text-white mb-2">${a.title}</h3>
          <p class="text-xs text-slate-300 leading-relaxed">${a.summary}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-800 text-right">
          <span class="text-xs text-teal-400 font-semibold flex items-center justify-end"><i class="fa-solid fa-shield-halved mr-1"></i>Official MoHFW Guideline</span>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading health info:", err);
  }
}
