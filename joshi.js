// --- Data Structure and Constants ---

const localStorageKey = 'meraSaathiData';
const addictionTypes = ['cigarettes', 'guthka', 'alcohol', 'cannabis'];
const circumferenceCigarettes = 2 * Math.PI * 40;
const circumferenceGuthka = 2 * Math.PI * 37;
const circumferenceAlcohol = 2 * Math.PI * 34;
const circumferenceCannabis = 2 * Math.PI * 31;

const circumferences = {
    cigarettes: circumferenceCigarettes,
    guthka: circumferenceGuthka,
    alcohol: circumferenceAlcohol,
    cannabis: circumferenceCannabis,
};

let userData = null;

// --- Utility Functions ---

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function calculateDaysClean() {
    if (!userData || !userData.startDate) return 0;
    const start = new Date(userData.startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// --- Plan Generation Logic ---

function generateRecoverySchedule(initialUsage) {
    const schedule = {};
    const totalDays = 90;
    addictionTypes.forEach(type => {
        schedule[type] = [];
        const initial = initialUsage[type] || 0;
        let currentTarget = initial;
        for (let day = 1; day <= totalDays; day++) {
            if (day % 10 === 1 && day > 1) {
                const reduction = Math.ceil(initial / (totalDays / 10));
                currentTarget = Math.max(0, currentTarget - reduction);
                if (day > 80) currentTarget = 0;
            }
            schedule[type].push(Math.round(currentTarget));
        }
    });
    return schedule;
}

// --- UI Update and Rendering ---

function updateCleanDays() {
    const days = calculateDaysClean();
    document.getElementById('cleanDays').textContent = days + " days";
    if (days > 0 && [7, 14, 30, 60, 90].includes(days)) {
        document.getElementById('cleanDays').classList.add('celebration');
        setTimeout(() => {
            document.getElementById('cleanDays').classList.remove('celebration');
        }, 600);
    }
}

function renderPlan() {
    if (!userData) return;
    const daysClean = calculateDaysClean();
    const planDay = Math.min(daysClean, 90);
    
    const todaySchedule = {
        cigarettes: userData.schedule.cigarettes[planDay - 1] || 0,
        guthka: userData.schedule.guthka[planDay - 1] || 0,
        alcohol: userData.schedule.alcohol[planDay - 1] || 0,
        cannabis: userData.schedule.cannabis[planDay - 1] || 0,
    };

    const todayScheduleEl = document.getElementById('todaySchedule');
    todayScheduleEl.innerHTML = `
        <p>Current Plan Day: ${planDay} of 90</p>
        <p>🚬 Target: ${todaySchedule.cigarettes}</p>
        <p>🟤 Target: ${todaySchedule.guthka}</p>
        <p>🍺 Weekly Target: ${todaySchedule.alcohol}</p>
        <p>🌿 Target: ${todaySchedule.cannabis}</p>
    `;

    const userSummaryEl = document.getElementById('userSummary');
    userSummaryEl.innerHTML = `
        <p>Goal: Complete freedom in 90 days. Start Date: ${new Date(userData.startDate).toLocaleDateString()}</p>
        <p>Reason: <strong>${userData.quitReason.charAt(0).toUpperCase() + userData.quitReason.slice(1)}</strong></p>
        <p>Initial Usage (Cig/Guthka/Alc/Can): ${userData.initialUsage.cigarettes}/${userData.initialUsage.guthka}/${userData.initialUsage.alcohol}/${userData.initialUsage.cannabis}</p>
    `;

    updateProgressVisuals();
    showPhase(1);
}

function showPhase(phaseNum) {
    const phaseContentEl = document.getElementById('phaseContent');
    
    for (let i = 1; i <= 3; i++) {
        const btn = document.getElementById(`phase${i}Btn`);
        if (i === phaseNum) {
            btn.classList.replace('bg-gray-200', 'bg-blue-500');
            btn.classList.replace('text-gray-700', 'text-white');
        } else {
            btn.classList.replace('bg-blue-500', 'bg-gray-200');
            btn.classList.replace('text-white', 'text-gray-700');
        }
    }

    let phaseHtml = '<table class="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">';
    phaseHtml += '<thead class="bg-gray-50">';
    phaseHtml += '<tr class="text-xs font-medium text-gray-500 uppercase tracking-wider">';
    phaseHtml += '<th class="px-3 py-3 text-left">Day</th>';
    phaseHtml += '<th class="px-3 py-3 text-center">🚬 Cig.</th>';
    phaseHtml += '<th class="px-3 py-3 text-center">🟤 Guthka</th>';
    phaseHtml += '<th class="px-3 py-3 text-center">🍺 Alc. (Wk)</th>';
    phaseHtml += '<th class="px-3 py-3 text-center">🌿 Cann.</th>';
    phaseHtml += '</tr>';
    phaseHtml += '</thead>';
    phaseHtml += '<tbody class="bg-white divide-y divide-gray-200">';

    const startDay = (phaseNum - 1) * 30 + 1;
    const endDay = phaseNum * 30;

    for (let day = startDay; day <= endDay; day++) {
        const dayLabel = `Day ${day}`;
        const cigarettesTarget = userData.schedule.cigarettes[day - 1] || 0;
        const guthkaTarget = userData.schedule.guthka[day - 1] || 0;
        const alcoholTarget = userData.schedule.alcohol[day - 1] || 0;
        const cannabisTarget = userData.schedule.cannabis[day - 1] || 0;

        phaseHtml += '<tr class="hover:bg-gray-50 transition">';
        phaseHtml += `<td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${dayLabel}</td>`;
        phaseHtml += `<td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700">${cigarettesTarget}</td>`;
        phaseHtml += `<td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700">${guthkaTarget}</td>`;
        phaseHtml += `<td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700">${alcoholTarget}</td>`;
        phaseHtml += `<td class="px-3 py-2 whitespace-nowrap text-sm text-center text-gray-700">${cannabisTarget}</td>`;
        phaseHtml += '</tr>';
    }

    phaseHtml += '</tbody>';
    phaseHtml += '</table>';
    phaseContentEl.innerHTML = phaseHtml;
}

function updateProgressVisuals() {
    if (!userData) return;
    
    const todayData = userData.dailyLog[getTodayString()] || {
        cigarettes: 0, guthka: 0, alcohol: 0, cannabis: 0
    };

    addictionTypes.forEach(type => {
        const consumed = todayData[type] || 0;
        const target = userData.schedule[type][calculateDaysClean() - 1] || 1;
        const percentage = Math.min((consumed / target) * 100, 100);
        
        const barEl = document.getElementById(`${type}Bar`);
        const countEl = document.getElementById(`${type}Count`);
        
        if (barEl) barEl.style.width = `${percentage}%`;
        if (countEl) countEl.textContent = consumed;
        
        const circumference = circumferences[type];
        const offset = circumference - (percentage / 100) * circumference;
        const circleEl = document.getElementById(`${type}Circle`);
        if (circleEl) circleEl.style.strokeDashoffset = offset;
    });
}

function logIntake(type) {
    if (!userData) return;
    
    const todayKey = getTodayString();
    if (!userData.dailyLog[todayKey]) {
        userData.dailyLog[todayKey] = { cigarettes: 0, guthka: 0, alcohol: 0, cannabis: 0 };
    }
    
    userData.dailyLog[todayKey][type]++;
    saveData();
    updateProgressVisuals();
    
    const countEl = document.getElementById(`${type}Count`);
    if (countEl) {
        countEl.classList.add('celebration');
        setTimeout(() => countEl.classList.remove('celebration'), 600);
    }
}

function saveData() {
    localStorage.setItem(localStorageKey, JSON.stringify(userData));
}

function loadData() {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
        userData = JSON.parse(stored);
        return true;
    }
    return false;
}

function startPlan(event) {
    event.preventDefault();
    
    const initialUsage = {
        cigarettes: parseInt(document.getElementById('cigarettes').value) || 0,
        guthka: parseInt(document.getElementById('guthka').value) || 0,
        alcohol: parseInt(document.getElementById('alcohol').value) || 0,
        cannabis: parseInt(document.getElementById('cannabis').value) || 0,
    };
    
    const quitReason = document.getElementById('quitReason').value;
    
    userData = {
        startDate: new Date().toISOString(),
        initialUsage: initialUsage,
        quitReason: quitReason,
        schedule: generateRecoverySchedule(initialUsage),
        dailyLog: {}
    };
    
    saveData();
    document.getElementById('userSetup').classList.add('hidden');
    document.getElementById('recoverySchedule').classList.remove('hidden');
    renderPlan();
    updateCleanDays();
}

function resetPlan() {
    if (confirm('Are you sure you want to reset your entire plan? All progress will be lost.')) {
        localStorage.removeItem(localStorageKey);
        location.reload();
    }
}

// --- Initialize on Page Load ---

document.addEventListener('DOMContentLoaded', () => {
    if (loadData()) {
        document.getElementById('userSetup').classList.add('hidden');
        document.getElementById('recoverySchedule').classList.remove('hidden');
        renderPlan();
        updateCleanDays();
    } else {
        document.getElementById('userSetup').classList.remove('hidden');
    }
});
