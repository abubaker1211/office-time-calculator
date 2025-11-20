// script.js

// DOM elements ko get karein
const shiftDurationInput = document.getElementById('shiftDuration');
const confirmShiftBtn = document.getElementById('confirmShiftBtn'); // New button
const manualInTimeInput = document.getElementById('manualInTime');
const resetManualInTimeBtn = document.getElementById('resetManualInTimeBtn');
const inBtn = document.getElementById('inBtn');
const outBtn = document.getElementById('outBtn');
const breakToggleBtn = document.getElementById('breakToggleBtn');
const breakTimerDisplay = document.getElementById('breakTimer');
const statusDisplay = document.getElementById('statusDisplay');
const leavingTimeDisplay = document.getElementById('leavingTimeDisplay');
const totalBreakTimeDisplay = document.getElementById('totalBreakTimeDisplay');
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const darkModeIcon = document.getElementById('darkModeIcon'); // Dark Mode Icon element

// Reports ke liye naye elements
const viewReportsBtn = document.getElementById('viewReportsBtn');
const reportsSection = document.getElementById('reportsSection');
const reportsList = document.getElementById('reportsList');
const noReportsMessage = document.getElementById('noReportsMessage');
const clearAllReportsBtn = document.getElementById('clearAllReportsBtn');
const exportReportsBtn = document.getElementById('exportReportsBtn'); // Export button

// Date display elements
const inDateDisplay = document.getElementById('inDateDisplay');
const outDateDisplay = document.getElementById('outDateDisplay');
const breakStatusText = document.getElementById('breakStatusText');
const breakSwitch = document.getElementById('breakSwitch');

// New timer element
const inTimerDisplay = document.getElementById('inTimerDisplay');

// Filter elements
const filterStartDateInput = document.getElementById('filterStartDate');
const filterEndDateInput = document.getElementById('filterEndDate');
const sortReportsSelect = document.getElementById('sortReports');


// Notification elements (New)
const enableNotificationsCheckbox = document.getElementById('enableNotificationsCheckbox');
const reminderMinutesInput = document.getElementById('reminderMinutesInput');

// Tutorial elements (New)
const tutorialBtn = document.getElementById('tutorialBtn');
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialMessageBox = document.getElementById('tutorialMessageBox');
const tutorialMessageText = document.getElementById('tutorialMessageText');
const tutorialNextBtn = document.getElementById('tutorialNextBtn');
const tutorialSkipBtn = document.getElementById('tutorialSkipBtn');


// App state store karne ke liye variables
let inTime = null;
let totalWorkDurationMs = 0; // New variable to track total work time
let inInterval = null; // New interval for IN Timer
let currentShiftDuration = 9; // NEW: A state variable for confirmed shift duration

let breakStartTime = null;
let totalBreakDurationMinutes = 0;
let breakInterval = null;
let isBreakOn = false;
let currentShiftOutTime = null; // Yeh estimated leaving time hai
let isDarkMode = false;
let dailyReports = []; // Daily reports store karne ke liye array
let enableNotifications = false; // New: Notification preference
let reminderMinutesBeforeOut = 15; // New: Reminder minutes
let notificationSentForCurrentShift = false; // New: Track if notification has been sent

// Tutorial state variables (New)
let tutorialStep = 0;
const tutorialSteps = [{
    element: inBtn,
    message: "Welcome to the Office Time Calculator! 👋\n\nTo start, click the 'IN' button to begin your workday. We'll start tracking your time immediately."
}, {
    element: outBtn,
    message: "At the end of your shift, click the 'OUT' button. This will record your work for the day and give you a summary."
}, {
    element: manualInTimeInput,
    message: "Forgot to clock in? No problem! You can manually enter your start time here and then click 'IN'."
}, {
    element: breakToggleBtn,
    message: "Need a break? Use this button or the toggle switch to pause your work timer. The app will automatically adjust your estimated leave time."
}, {
    element: shiftDurationInput,
    message: "You can change your shift duration here. Just enter the new hours and click 'OK' to update your estimated leave time."
}, {
    element: leavingTimeDisplay,
    message: "This is your estimated leave time. It automatically updates based on your shift duration and breaks."
},

{
    element: viewReportsBtn,
    message: "Want to see your work history? Click 'View Reports' to see, sort, and export all your past workdays."
}];


// --- Utility Functions ---

// Sirf time ko HH:MM AM/PM format mein format karein
function formatTime(date) {
    if (!date) return '--:-- --';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

// Sirf date ko "MMM DD, YYYY" format mein format karein
function formatOnlyDate(date) {
    if (!date) return '-- -- --';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleString('en-US', options);
}

// Date aur time ko "MMM DD, YYYY, HH:MM AM/PM" format mein format karein (Reports ke liye)
function formatDateTime(date) {
    if (!date) return '--:-- --';
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

// Total seconds ko HH:MM:SS format mein format karein
function formatDuration(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const pad = (num) => num < 10 ? '0' + num : num;
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Total minutes ko HH:MM format mein format karein (Reports ke liye)
function formatMinutesToHHMM(minutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}


// --- Local Storage Functions ---

// App state ko Local Storage mein save karein
function saveState() {
    const state = {
        inTime: inTime ? inTime.toISOString() : null,
        totalWorkDurationMs: totalWorkDurationMs, // Save new variable
        totalBreakDurationMinutes: totalBreakDurationMinutes,
        isBreakOn: isBreakOn,
        breakStartTime: breakStartTime ? breakStartTime.toISOString() : null,
        currentShiftDuration: currentShiftDuration, // Save the new variable
        shiftDurationInput: shiftDurationInput ? parseFloat(shiftDurationInput.value) : 9,
        currentShiftOutTime: currentShiftOutTime ? currentShiftOutTime.toISOString() : null,
        manualInTimeValue: manualInTimeInput ? manualInTimeInput.value : '',
        isDarkMode: isDarkMode,
        enableNotifications: enableNotifications, // Save notification preference
        reminderMinutesBeforeOut: reminderMinutesInput ? reminderMinutesInput.value : 15, // Save reminder minutes
        notificationSentForCurrentShift: notificationSentForCurrentShift // Save notification sent status
    };
    localStorage.setItem('officeTimeCalculatorState', JSON.stringify(state));
    localStorage.setItem('officeTimeCalculatorDailyReports', JSON.stringify(dailyReports)); // Reports bhi save karein
}

// App state ko Local Storage se load karein
function loadState() {
    const savedState = localStorage.getItem('officeTimeCalculatorState');
    if (savedState) {
        const state = JSON.parse(savedState);
        inTime = state.inTime ? new Date(state.inTime) : null;
        totalWorkDurationMs = state.totalWorkDurationMs || 0; // Load new variable
        totalBreakDurationMinutes = state.totalBreakDurationMinutes || 0;
        isBreakOn = state.isBreakOn || false;
        breakStartTime = state.breakStartTime ? new Date(state.breakStartTime) : null;
        currentShiftDuration = state.currentShiftDuration || 9; // Load new variable
        if (shiftDurationInput) shiftDurationInput.value = state.shiftDurationInput || 9;
        currentShiftOutTime = state.currentShiftOutTime ? new Date(state.currentShiftOutTime) : null;
        if (manualInTimeInput) manualInTimeInput.value = state.manualInTimeValue || '';
        isDarkMode = state.isDarkMode || false;
        enableNotifications = state.enableNotifications || false; // Load notification preference
        if (reminderMinutesInput) reminderMinutesInput.value = state.reminderMinutesBeforeOut || 15; // Load reminder minutes
        notificationSentForCurrentShift = state.notificationSentForCurrentShift || false; // Load notification sent status


        // Reports load karein
        const savedReports = localStorage.getItem('officeTimeCalculatorDailyReports');
        dailyReports = savedReports ? JSON.parse(savedReports) : [];


        // Loaded state ke hisaab se UI update karein
        updateUI();
        if (inTime) {
            // Agar IN time hai, toh IN timer start karein
            startInTimer();
            if (isBreakOn) {
                // Agar break par bhi hai, toh IN timer ko pause kar dein aur break timer start karein
                pauseInTimer();
                startBreakTimer();
            }
        }
        // Load hone par dark mode apply karein
        if (isDarkMode) {
            body.classList.add('dark');
            if (darkModeIcon) darkModeIcon.textContent = '☀️'; // Sun icon for dark mode
        } else {
            body.classList.remove('dark');
            if (darkModeIcon) darkModeIcon.textContent = '🌙'; // Moon icon for light mode
        }

        // Update notification UI based on loaded state
        if (enableNotificationsCheckbox) enableNotificationsCheckbox.checked = enableNotifications;
        if (reminderMinutesInput) reminderMinutesInput.disabled = !enableNotifications;
    } else {
        // Agar koi saved state nahi hai, toh UI ko default state mein rakhein
        updateUI();
    }
    if (document.getElementById('todaySummary')) document.getElementById('todaySummary').style.display = 'none';

}

// --- Core Logic Functions ---

// UI ko current state ke hisaab se update karein
function updateUI() {
    if (inTime) {
        if (inDateDisplay) inDateDisplay.textContent = formatOnlyDate(inTime); // IN Date update karein
        if (statusDisplay) statusDisplay.textContent = `IN at: ${formatTime(inTime)}`; // Sirf IN Time update karein
        if (inBtn) {
            inBtn.disabled = true;
            inBtn.style.opacity = '0.5'; // Basic disabled styling
            inBtn.style.cursor = 'not-allowed';
        }
        if (outBtn) {
            outBtn.disabled = false;
            outBtn.style.opacity = '1';
            outBtn.style.cursor = 'pointer';
        }
        if (shiftDurationInput) {
            shiftDurationInput.disabled = false;
        }
        if (confirmShiftBtn) {
            confirmShiftBtn.disabled = (shiftDurationInput.value == currentShiftDuration);
        }
        if (breakToggleBtn) {
            breakToggleBtn.disabled = false;
            breakToggleBtn.style.opacity = '1';
            breakToggleBtn.style.cursor = 'pointer';
        }
        if (breakSwitch) {
            breakSwitch.classList.remove('disabled');
            breakSwitch.style.opacity = '1';
        }
        if (manualInTimeInput) manualInTimeInput.disabled = true;
        if (resetManualInTimeBtn && manualInTimeInput) {
            if (manualInTimeInput.value) {
                resetManualInTimeBtn.disabled = false;
                resetManualInTimeBtn.style.opacity = '1';
                resetManualInTimeBtn.style.cursor = 'pointer';
            } else {
                resetManualInTimeBtn.disabled = true;
                resetManualInTimeBtn.style.opacity = '0.5';
                resetManualInTimeBtn.style.cursor = 'not-allowed';
            }
        }
    } else {
        if (inDateDisplay) inDateDisplay.textContent = '-- -- --'; // IN Date reset karein
        if (statusDisplay) statusDisplay.textContent = 'Press IN to start';
        if (inBtn) {
            inBtn.disabled = false;
            inBtn.style.opacity = '1';
            inBtn.style.cursor = 'pointer';
        }
        if (outBtn) {
            outBtn.disabled = true;
            outBtn.style.opacity = '0.5';
            outBtn.style.cursor = 'not-allowed';
        }
        if (shiftDurationInput) {
            shiftDurationInput.disabled = false;
        }
        if (confirmShiftBtn) {
            confirmShiftBtn.disabled = true;
        }
        if (breakToggleBtn) {
            breakToggleBtn.disabled = true;
            breakToggleBtn.style.opacity = '0.5';
            breakToggleBtn.style.cursor = 'not-allowed';
        }
        if (breakSwitch) {
            breakSwitch.classList.add('disabled');
            breakSwitch.style.opacity = '0.5';
        }
        if (manualInTimeInput) manualInTimeInput.disabled = false;
        if (resetManualInTimeBtn && manualInTimeInput) {
            if (manualInTimeInput.value) {
                resetManualInTimeBtn.disabled = false;
                resetManualInTimeBtn.style.opacity = '1';
                resetManualInTimeBtn.style.cursor = 'pointer';
            } else {
                resetManualInTimeBtn.disabled = true;
                resetManualInTimeBtn.style.opacity = '0.5';
                resetManualInTimeBtn.style.cursor = 'not-allowed';
            }
        }
    }

    // Break button and switch styling aur text update karein
    if (breakToggleBtn && breakSwitch) {
        if (isBreakOn) {
            breakToggleBtn.classList.remove('off');
            breakToggleBtn.classList.add('on');
            breakToggleBtn.textContent = 'Break ON';
            breakSwitch.classList.remove('off');
            breakSwitch.classList.add('on');
            if (breakStatusText) breakStatusText.textContent = 'ON';
            if (breakTimerDisplay) breakTimerDisplay.style.display = 'block'; /* Timer dikhayein */
        } else {
            breakToggleBtn.classList.remove('on');
            breakToggleBtn.classList.add('off');
            breakToggleBtn.textContent = 'Break OFF';
            breakSwitch.classList.remove('on');
            breakSwitch.classList.add('off');
            if (breakStatusText) breakStatusText.textContent = 'OFF';
            if (breakTimerDisplay) breakTimerDisplay.style.display = 'none'; /* Timer chhupayein */
        }
    }
    
    // Timer visibility
    if (inTime) {
        if (inTimerDisplay) inTimerDisplay.style.display = 'block';
    } else {
        if (inTimerDisplay) inTimerDisplay.style.display = 'none';
        if (breakTimerDisplay) breakTimerDisplay.style.display = 'none';
    }

    // This is the correct place to call this function now
    if (inTime) {
        updateLeavingTime();
    } else {
        // If not in a shift, we don't need to calculate leaving time
        if (leavingTimeDisplay) leavingTimeDisplay.textContent = '--:-- --';
        if (outDateDisplay) outDateDisplay.textContent = '-- -- --';
        if (totalBreakTimeDisplay) totalBreakTimeDisplay.style.display = 'none';
    }
    
    saveState();
}

// Leaving time calculate aur update karein
function updateLeavingTime() {
    if (!inTime) {
        if (outDateDisplay) outDateDisplay.textContent = '-- -- --'; // OUT Date reset karein
        if (leavingTimeDisplay) leavingTimeDisplay.textContent = '--:-- --';
        if (totalBreakTimeDisplay) totalBreakTimeDisplay.style.display = 'none'; /* Chhupayein */
        currentShiftOutTime = null;
        saveState();
        return;
    }

    const shiftHours = currentShiftDuration; // Use the confirmed value here
    const requiredShiftMinutes = shiftHours * 60;

    let currentTotalBreak = totalBreakDurationMinutes;
    if (isBreakOn && breakStartTime) {
        const currentBreakElapsedMs = Date.now() - breakStartTime.getTime();
        currentTotalBreak += currentBreakElapsedMs / (1000 * 60);
    }

    const totalMinutesNeeded = requiredShiftMinutes + currentTotalBreak;
    const leavingDate = new Date(inTime.getTime() + totalMinutesNeeded * 60 * 1000);
    currentShiftOutTime = leavingDate; // Estimated leaving time update karein

    if (outDateDisplay) outDateDisplay.textContent = formatOnlyDate(leavingDate); // OUT Date update karein
    if (leavingTimeDisplay) leavingTimeDisplay.textContent = formatTime(leavingDate); // Sirf Leaving Time update karein
    if (totalBreakTimeDisplay) {
        totalBreakTimeDisplay.textContent = `Total Break: ${Math.round(currentTotalBreak)} minutes`;
        totalBreakTimeDisplay.style.display = 'block'; /* Dikhayein */
    }

    // Check for notifications (New)
    checkNotificationReminder();

    saveState();
}

// --- New timer logic for IN Timer ---
function startInTimer() {
    if (inInterval) {
        clearInterval(inInterval);
    }
    inInterval = setInterval(() => {
        if (inTime) {
            const currentTime = Date.now();
            if (!isBreakOn) {
                totalWorkDurationMs = currentTime - inTime.getTime() - (totalBreakDurationMinutes * 60 * 1000);
            }
            if (inTimerDisplay) inTimerDisplay.textContent = formatDuration(totalWorkDurationMs / 1000);
            updateLeavingTime();
        }
    }, 1000);
}

function pauseInTimer() {
    if (inInterval) {
        clearInterval(inInterval);
        inInterval = null;
    }
}

// Break timer ko update karein
function startBreakTimer() {
    if (breakInterval) {
        clearInterval(breakInterval);
    }
    breakInterval = setInterval(() => {
        if (breakStartTime) {
            const currentBreakElapsedSeconds = (Date.now() - breakStartTime.getTime()) / 1000;
            if (breakTimerDisplay) breakTimerDisplay.textContent = formatDuration(currentBreakElapsedSeconds);
            updateLeavingTime(); // Har second leaving time update karein
        }
    }, 1000);
}


// --- Notifications Functions ---
// Notification permission request karein
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        showMessage("This browser does not support desktop notification.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        showMessage("Notification permission was denied. Please enable it in your browser settings to receive reminders.");
        return false;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        showMessage("Notification permission granted!");
        return true;
    } else {
        showMessage("Notification permission denied.");
        return false;
    }
}

// Notification display karein
function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: body, icon: '/icons/icon-192x192.png' }); // PWA icon use karein
    }
}

// Check karein ki notification reminder send karna hai ya nahi
function checkNotificationReminder() {
    if (!inTime || !enableNotifications || notificationSentForCurrentShift || !currentShiftOutTime || !reminderMinutesInput) {
        return; // Agar IN time nahi hai, notifications disabled hain, ya already sent, toh kuch na karein
    }

    const now = new Date();
    const reminderTimeMs = currentShiftOutTime.getTime() - (reminderMinutesInput.value * 60 * 1000);

    // Check if current time is past the reminder time, but before the actual estimated leaving time
    if (now.getTime() >= reminderTimeMs && now.getTime() < currentShiftOutTime.getTime()) {
        sendNotification(
            "Office Time Reminder!",
            `Your estimated leaving time is ${formatTime(currentShiftOutTime)}. Only ${reminderMinutesInput.value} minutes left!`
        );
        notificationSentForCurrentShift = true; // Mark as sent for this shift
        saveState(); // Save the updated status
    }
}


// --- Reports Functions ---
// Load reports from localStorage
function loadReports() {
    try {
        const savedReports = localStorage.getItem('officeTimeCalculatorDailyReports');
        if (savedReports) {
            dailyReports = JSON.parse(savedReports);
        } else {
            dailyReports = [];
        }
    } catch (error) {
        dailyReports = [];
    }
}

// Daily report add karein
function addReport(actualOutTime) { // actualOutTime parameter add kiya
    if (!inTime) return;

    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    const inTimeMs = inTime.getTime();
    const outTimeMs = actualOutTime.getTime();
    const totalShiftMs = outTimeMs - inTimeMs;
    const totalBreakMs = totalBreakDurationMinutes * 60 * 1000;
    
    let actualWorkMs = totalShiftMs - totalBreakMs;
    if (actualWorkMs < 0) actualWorkMs = 0;

    const actualWorkDurationMinutes = Math.round(actualWorkMs / (1000 * 60));
    const newReport = {
        date: formattedDate,
        inTime: formatDateTime(inTime),
        outTime: formatDateTime(actualOutTime),
        shiftDurationHours: currentShiftDuration, // Use the new variable here
        totalBreakMinutes: Math.round(totalBreakDurationMinutes),
        actualWorkDurationMinutes: actualWorkDurationMinutes,
    };

    const existingReportIndex = dailyReports.findIndex(report => report.date === formattedDate);
    if (existingReportIndex > -1) {
        dailyReports[existingReportIndex] = newReport;
    } else {
        dailyReports.push(newReport);
    }
    
    saveState();
    window.dispatchEvent(new CustomEvent('reportsUpdated'));
}

// Reports list render karein
function renderReports() {
    const reportsList = document.getElementById('reportsList');
    const noReportsMessage = document.getElementById('noReportsMessage');
    const clearAllReportsBtn = document.getElementById('clearAllReportsBtn');
    const exportReportsBtn = document.getElementById('exportReportsBtn');

    if (!reportsList) return; // Exit if not on the reports page

    reportsList.innerHTML = ''; // Existing list clear karein

    let reportsToRender = [...dailyReports]; // Create a copy to filter/sort

    // Apply Date Filtering
    const filterStartDateInput = document.getElementById('filterStartDate');
    const filterEndDateInput = document.getElementById('filterEndDate');
    if (filterStartDateInput && filterEndDateInput) {
        const startDate = filterStartDateInput.value ? new Date(filterStartDateInput.value) : null;
        const endDate = filterEndDateInput.value ? new Date(filterEndDateInput.value) : null;

        if (startDate || endDate) {
            reportsToRender = reportsToRender.filter(report => {
                const reportDate = new Date(report.date);
                reportDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison
                if (startDate && reportDate < startDate) return false;
                if (endDate && reportDate > endDate) return false;
                return true;
            });
        }
    }


    // Apply Sorting
    const sortReportsSelect = document.getElementById('sortReports');
    if (sortReportsSelect) {
        const sortOption = sortReportsSelect.value;
        reportsToRender.sort((a, b) => {
            if (sortOption === 'dateDesc') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortOption === 'dateAsc') {
                return new Date(a.date) - new Date(b.date);
            } else if (sortOption === 'workDurationDesc') {
                return b.actualWorkDurationMinutes - a.actualWorkDurationMinutes;
            } else if (sortOption === 'workDurationAsc') {
                return a.actualWorkDurationMinutes - b.actualWorkDurationMinutes;
            }
            return 0; // Default no sort
        });
    }


    if (reportsToRender.length === 0) {
        if (noReportsMessage) {
            noReportsMessage.style.display = 'block'; // "No reports yet." message dikhayein
            reportsList.appendChild(noReportsMessage); // List ke andar rakhein styling ke liye
        }
        if (clearAllReportsBtn) {
            clearAllReportsBtn.disabled = true;
            clearAllReportsBtn.style.opacity = '0.5';
            clearAllReportsBtn.style.cursor = 'not-allowed';
        }
        if (exportReportsBtn) {
            exportReportsBtn.disabled = true; // Disable export if no reports
            exportReportsBtn.style.opacity = '0.5';
            exportReportsBtn.style.cursor = 'not-allowed';
        }
    } else {
        if (noReportsMessage) noReportsMessage.style.display = 'none'; // "No reports yet." message chhupayein
        if (clearAllReportsBtn) {
            clearAllReportsBtn.disabled = false;
            clearAllReportsBtn.style.opacity = '1';
            clearAllReportsBtn.style.cursor = 'pointer';
        }
        if (exportReportsBtn) {
            exportReportsBtn.disabled = false; // Enable export
            exportReportsBtn.style.opacity = '1';
            exportReportsBtn.style.cursor = 'pointer';
        }

        reportsToRender.forEach(report => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Date: ${report.date}</strong><br>
                <span>IN: ${report.inTime}, OUT: ${report.outTime}</span><br>
                <span>Shift: ${report.shiftDurationHours} hrs, Break: ${report.totalBreakMinutes} mins</span><br>
                <span>Actual Work: ${formatMinutesToHHMM(report.actualWorkDurationMinutes)} hrs</span>
            `;
            reportsList.appendChild(listItem);
        });
    }
}

// Saare reports clear karein
function clearAllReports() {
    // Custom confirmation box use karein
    showConfirmation('Are you sure you want to delete ALL daily work reports? This action cannot be undone.', () => {
        dailyReports = [];
        localStorage.removeItem('officeTimeCalculatorDailyReports');
        renderReports();
        showMessage('All reports have been deleted.');
        window.dispatchEvent(new CustomEvent('reportsUpdated'));
    });
}

// Reports ko CSV format mein export karein
function exportReportsToCSV() {
    if (dailyReports.length === 0) {
        showMessage('No reports to export.');
        return;
    }

    const headers = ["Date", "IN Time", "OUT Time", "Shift Duration (hours)", "Total Break (minutes)", "Actual Work (minutes)"];
    const rows = dailyReports.map(report => [
        report.date,
        report.inTime,
        report.outTime,
        report.shiftDurationHours,
        report.totalBreakMinutes,
        report.actualWorkDurationMinutes
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.map(e => `"${e}"`).join(",") + "\n"; // Quote values to handle commas in data
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection for download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "office_time_reports.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showMessage('Your browser does not support downloading files directly. Please copy the data manually.');
    }
}


// --- Custom Message Box Functions (Replacing alert/confirm) ---
let currentMessageBox = null; // Track the currently displayed message box

// Custom message box dikhane ke liye
function showMessage(message) {
    if (currentMessageBox) {
        // Agar pehle se koi message box hai, toh uska content update karein
        currentMessageBox.querySelector('p').textContent = message;
        currentMessageBox.style.display = 'block'; // Ensure it's visible
        return;
    }

    const messageBox = document.createElement('div');
    messageBox.classList.add('custom-message-box'); // Add a class for styling
    messageBox.innerHTML = `
        <p>${message}</p>
        <button>OK</button>
    `;
    document.body.appendChild(messageBox);
    currentMessageBox = messageBox; // Store reference to the new message box

    messageBox.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(messageBox);
        currentMessageBox = null; // Clear the reference
    });
}

// Custom confirmation box dikhane ke liye
function showConfirmation(message, onConfirm, onCancel) {
    if (currentMessageBox) {
        document.body.removeChild(currentMessageBox);
        currentMessageBox = null;
    }

    const confirmationBox = document.createElement('div');
    confirmationBox.classList.add('custom-message-box');
    confirmationBox.innerHTML = `
        <p>${message}</p>
        <div style="margin-top: 15px;">
            <button id="confirmYes" style="background-color: #4CAF50;">Yes</button>
            <button id="confirmNo" style="background-color: #f44336;">No</button>
        </div>
    `;
    document.body.appendChild(confirmationBox);
    currentMessageBox = confirmationBox;

    confirmationBox.querySelector('#confirmYes').addEventListener('click', () => {
        document.body.removeChild(confirmationBox);
        currentMessageBox = null;
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });

    confirmationBox.querySelector('#confirmNo').addEventListener('click', () => {
        document.body.removeChild(confirmationBox);
        currentMessageBox = null;
        if (typeof onCancel === 'function') {
            onCancel(); // ✅ Now this will run when you click NO
        }
    });
}


// --- Event Handlers ---
// IN button click handler
function handleInButtonClick() {
    if (!inBtn) return;
    let startTime = new Date();
    if (manualInTimeInput && manualInTimeInput.value) {
        const [hours, minutes] = manualInTimeInput.value.split(':').map(Number);
        startTime.setHours(hours, minutes, 0, 0);
    }
    inTime = startTime;
    if (manualInTimeInput) manualInTimeInput.style.display = 'none'; // Hide manual input when IN is clicked

    totalBreakDurationMinutes = 0;
    notificationSentForCurrentShift = false; // Reset notification status for new shift
    updateUI();
    startInTimer(); // Start the new IN timer
    saveState();
}
if (inBtn) inBtn.addEventListener('click', handleInButtonClick);

// OUT button click handler
function handleOut(actualOutTime) {
    addReport(actualOutTime);

    // Stop all timers
    if (inInterval) clearInterval(inInterval);
    if (breakInterval) clearInterval(breakInterval);
    inInterval = null;
    breakInterval = null;
    totalWorkDurationMs = 0;

    const inTimeMs = inTime.getTime();
    const outTimeMs = actualOutTime.getTime();
    const totalShiftMs = outTimeMs - inTimeMs;
    const totalBreakMs = totalBreakDurationMinutes * 60 * 1000;

    let actualWorkMs = totalShiftMs - totalBreakMs;
    if (actualWorkMs < 0) actualWorkMs = 0;

    const actualWorkMinutes = Math.round(actualWorkMs / (1000 * 60));
    const breakMinutes = Math.round(totalBreakDurationMinutes);
    const hours = Math.floor(actualWorkMinutes / 60);
    const minutes = actualWorkMinutes % 60;
    const breakHrs = Math.floor(breakMinutes / 60);
    const breakMins = breakMinutes % 60;

    const summaryMessage = `✅ Today's Summary\n🕒 Worked: ${hours}h ${minutes}m • ☕ Break: ${breakHrs}h ${breakMins}m`;

    showMessage(summaryMessage);
    finalizeOut();
}
function handleOutButtonClick() {
    if (!outBtn) return;
    if (isBreakOn) {
        toggleBreak(); // End break if active
    }
    const actualOutTime = new Date();
    const today = new Date().toISOString().split("T")[0];
    const reportExists = dailyReports.some(report => report.date === today);

    if (reportExists) {
        showConfirmation("A report already exists for today. Do you want to override it?", () => {
            handleOut(actualOutTime);
        }, () => {
            finalizeOut();
        });
        return;
    }
    handleOut(actualOutTime);
}
if (outBtn) outBtn.addEventListener('click', handleOutButtonClick);

// Naye din ke liye state reset karein
function finalizeOut() {
    inTime = null;
    totalWorkDurationMs = 0;
    totalBreakDurationMinutes = 0;
    currentShiftOutTime = null;
    if (manualInTimeInput) manualInTimeInput.value = '';
    notificationSentForCurrentShift = false;
    if (manualInTimeInput) manualInTimeInput.style.display = 'inline-block';
    updateUI();
    saveState();
}


// Break toggle handler
function toggleBreak() {
    if (!breakToggleBtn && !breakSwitch) return;
    
    // If disabled, exit the function
    if (breakToggleBtn && breakToggleBtn.disabled) {
        return;
    }
    
    const newState = !isBreakOn;
    
    if (newState) {
        // Break ON ho raha hai
        pauseInTimer(); // Pause the IN timer
        breakStartTime = new Date();
        isBreakOn = true;
        startBreakTimer();
    } else {
        // Break OFF ho raha hai
        startInTimer(); // Resume the IN timer
        const breakEndTime = new Date();
        const elapsedBreakMs = breakEndTime.getTime() - breakStartTime.getTime();
        totalBreakDurationMinutes += elapsedBreakMs / (1000 * 60);
        clearInterval(breakInterval);
        breakInterval = null;
        breakStartTime = null;
        isBreakOn = false;
    }
    updateUI();
    saveState();
}
if (breakToggleBtn) breakToggleBtn.addEventListener('click', toggleBreak);
if (breakSwitch) breakSwitch.addEventListener('click', toggleBreak);


// Shift duration change hone par leaving time update karein
function handleShiftDurationInput() {
    if (!shiftDurationInput) return;
    // We do not want to update anything until OK is clicked
    if (inTime && confirmShiftBtn) {
        // Re-enable the confirm button
        confirmShiftBtn.disabled = false;
    } else if (!inTime) {
        updateLeavingTime();
    }
    saveState();
}
if (shiftDurationInput) shiftDurationInput.addEventListener('input', handleShiftDurationInput);

// Manual IN time change hone par IN time update karein (agar IN nahi kiya hai)
function handleManualInTimeChange() {
    if (!manualInTimeInput) return;
    if (!inTime) {
        updateUI();
    }
    saveState();
}
if (manualInTimeInput) manualInTimeInput.addEventListener('change', handleManualInTimeChange);

// Reset Manual IN Time button click handler
function handleResetManualInTime() {
    if (!resetManualInTimeBtn || !manualInTimeInput) return;
    manualInTimeInput.value = '';
    updateUI();
    saveState();
}
if (resetManualInTimeBtn) resetManualInTimeBtn.addEventListener('click', handleResetManualInTime);

// Dark Mode Toggle handler
function handleDarkModeToggle() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        body.classList.add('dark');
        if (darkModeIcon) darkModeIcon.textContent = '☀️'; // Sun icon for dark mode
    } else {
        body.classList.remove('dark');
        if (darkModeIcon) darkModeIcon.textContent = '🌙'; // Moon icon for light mode
    }
    saveState();
}
if (darkModeToggle) darkModeToggle.addEventListener('click', handleDarkModeToggle);


// Notification checkbox change handler
function handleEnableNotificationsChange() {
    if (!enableNotificationsCheckbox || !reminderMinutesInput) return;
    enableNotifications = enableNotificationsCheckbox.checked;
    reminderMinutesInput.disabled = !enableNotifications; // Enable/disable minutes input
    if (enableNotifications) {
        requestNotificationPermission().then(granted => {
            if (!granted) {
                enableNotificationsCheckbox.checked = false; // Uncheck if permission denied
                enableNotifications = false;
                reminderMinutesInput.disabled = true;
            }
        });
    }
    saveState();
}
if (enableNotificationsCheckbox) enableNotificationsCheckbox.addEventListener('change', handleEnableNotificationsChange);

// Reminder minutes input change handler
function handleReminderMinutesInput() {
    if (!reminderMinutesInput) return;
    let value = parseInt(reminderMinutesInput.value);
    if (isNaN(value) || value < 1) {
        reminderMinutesInput.value = 1;
        showMessage('Reminder minutes cannot be less than 1.');
    } else if (value > 60) {
        reminderMinutesInput.value = 60;
        showMessage('Reminder minutes cannot exceed 60.');
    }
    reminderMinutesBeforeOut = parseInt(reminderMinutesInput.value);
    saveState();
}
if (reminderMinutesInput) reminderMinutesInput.addEventListener('input', handleReminderMinutesInput);


// Initial load: Local Storage se state load karein
document.addEventListener('DOMContentLoaded', loadState);

// Defensive: ensure tutorial elements exist before using tutorial APIs
if (!tutorialBtn || !tutorialOverlay || !tutorialMessageBox || !tutorialNextBtn || !tutorialSkipBtn) {
    // If any tutorial element is missing, make startTutorial a no-op to avoid errors when other pages call it.
    window.startTutorial = function () {
        console.warn("Tutorial not available on this page (missing DOM elements).");
    };
}



// Service Worker Register karein
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
// share button click handler
if (document.getElementById("shareBtn")) {


    const shareBtn = document.getElementById("shareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
   
        const message = `✅ Check out this awesome 
            *Office Time Tracker web app!*
            Track your shift, breaks, and more in real-time.

            👉 Try it here: https://officetimecalculator.netlify.app`;
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/?text=${encodedMessage}`;
        window.open(url, "_blank");

    });
}

// Exporting the functions to the window object so other pages can use them
window.loadReports = loadReports;
window.renderReports = renderReports;
window.clearAllReports = clearAllReports;
window.exportReportsToCSV = exportReportsToCSV;
window.formatMinutesToHHMM = formatMinutesToHHMM;
window.formatDateTime = formatDateTime;
window.showMessage = showMessage;
window.showConfirmation = showConfirmation;


// Add event listener for the new Confirm Shift button
if (confirmShiftBtn) {
    confirmShiftBtn.addEventListener('click', () => {
        if (!inTime) {
            showMessage("Please clock in first to change your shift duration.");
            return;
        }
        let value = parseFloat(shiftDurationInput.value);
        if (isNaN(value) || value < 1 || value > 12) {
            showMessage('Please enter a valid shift duration between 1 and 12 hours.');
        } else {
            // Update the confirmed shift duration and save state
            currentShiftDuration = value;
            // Recalculate leaving time with new shift duration
            updateLeavingTime();
            // Disable input and button after confirming
            if (confirmShiftBtn) confirmShiftBtn.disabled = true;
        }
    });
}

// Enable shiftDurationInput and confirmShiftBtn when IN is clicked
if (inBtn) {
    inBtn.addEventListener('click', () => {
        if (shiftDurationInput) {
            shiftDurationInput.disabled = false;
        }
        if (confirmShiftBtn) {
            confirmShiftBtn.disabled = true; // Initially disabled until a change is made
        }
    });
}

// Disable shiftDurationInput and confirmShiftBtn when OUT is clicked
if (outBtn) {
    outBtn.addEventListener('click', () => {
        if (shiftDurationInput) {
            shiftDurationInput.disabled = true;
        }
        if (confirmShiftBtn) {
            confirmShiftBtn.disabled = true;
        }
    });
}

// Re-enable confirm button when shift duration input changes
if (shiftDurationInput) {
    shiftDurationInput.addEventListener('input', () => {
        if (inTime && confirmShiftBtn) {
            // Enable the confirm button only if the new value is different from the confirmed value
            confirmShiftBtn.disabled = (shiftDurationInput.value == currentShiftDuration);
        }
    });
}


// --- Tutorial Logic ---
// Functions to manage the tutorial state
function startTutorial() {
    if (!tutorialOverlay || !tutorialMessageBox) return;
    tutorialStep = 0;
    tutorialOverlay.style.display = 'block';
    tutorialMessageBox.style.display = 'block';
    showTutorialStep();
}

function endTutorial() {
    if (!tutorialOverlay || !tutorialMessageBox) return;
    tutorialOverlay.style.display = 'none';
    tutorialMessageBox.style.display = 'none';
    if (tutorialSteps[tutorialStep] && tutorialSteps[tutorialStep].element) {
        tutorialSteps[tutorialStep].element.classList.remove('tutorial-highlighted');
    }
    tutorialStep = 0;
}



function showTutorialStep() {
  // Remove highlight from previous element
    const prevHighlighted = document.querySelector('.tutorial-highlighted');
    if (prevHighlighted) {
        prevHighlighted.classList.remove('tutorial-highlighted');
    }

    if (tutorialStep >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    const currentStep = tutorialSteps[tutorialStep];
    if (currentStep && currentStep.element) {
        // Highlight the current element
        currentStep.element.classList.add('tutorial-highlighted');
        
        // Use a timeout to wait for the scroll animation to complete
        setTimeout(() => {
            const elementRect = currentStep.element.getBoundingClientRect();
            const messageBoxHeight = tutorialMessageBox.offsetHeight;
            const messageBoxWidth = tutorialMessageBox.offsetWidth;
            const margin = 20; // Margin between the element and the message box

            let newTop;
            let newLeft;
            
            const viewportTop = window.pageYOffset;
            const viewportBottom = window.pageYOffset + window.innerHeight;

            const spaceBelow = viewportBottom - elementRect.bottom;
            const spaceAbove = elementRect.top - viewportTop;

            if (spaceBelow > messageBoxHeight + margin) {
                // Position below the element if there is enough space
                newTop = viewportTop + elementRect.bottom + margin;
            } else if (spaceAbove > messageBoxHeight + margin) {
                // Position above the element if there isn't space below
                newTop = viewportTop + elementRect.top - messageBoxHeight - margin;
            } else {
                // Fallback: Position in the middle of the viewport if no clear space
                newTop = viewportTop + (window.innerHeight - messageBoxHeight) / 2;
            }

            // Horizontally center the message box
            newLeft = elementRect.left + (elementRect.width / 2) - (messageBoxWidth / 2);
            
            // Adjust if the box goes off the left or right side of the screen
            if (newLeft < margin) {
                newLeft = margin;
            } else if (newLeft + messageBoxWidth + margin > window.innerWidth) {
                newLeft = window.innerWidth - messageBoxWidth - margin;
            }
            
            tutorialMessageBox.style.top = `${newTop}px`;
            tutorialMessageBox.style.left = `${newLeft}px`;
            tutorialMessageBox.style.display = 'block';
            
            // Scroll to the message box if it's not visible
            const messageBoxRect = tutorialMessageBox.getBoundingClientRect();
            if (messageBoxRect.top < 0 || messageBoxRect.bottom > window.innerHeight) {
                 tutorialMessageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Update message text and button text
            tutorialMessageText.textContent = currentStep.message;
            if (tutorialStep === tutorialSteps.length - 1) {
                tutorialNextBtn.textContent = 'End Tutorial';
            } else {
                tutorialNextBtn.textContent = 'Next';
            }
        }, 300); // Wait for a short duration to allow scrolling to settle

    } else {
        // If an element is missing, skip the step
        tutorialStep++;
        showTutorialStep();
        return;
    }
}

// Event Listeners for the tutorial
if (tutorialBtn) {
    tutorialBtn.addEventListener('click', startTutorial);
}

if (tutorialNextBtn) {
    tutorialNextBtn.addEventListener('click', () => {
        // Check if this is the last step
        if (tutorialStep >= tutorialSteps.length - 1) {
            endTutorial(); // Call endTutorial directly
        } else {
            tutorialStep++; // Increment step
            showTutorialStep(); // Move to the next step
        }
    });
}

if (tutorialSkipBtn) {
    tutorialSkipBtn.addEventListener('click', endTutorial);
}

// Add startTutorial to the global scope
window.startTutorial = startTutorial;


