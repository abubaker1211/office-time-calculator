
        // DOM elements ko get karein
        const shiftDurationInput = document.getElementById('shiftDuration');
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

        // Scroll message element
        const scrollMessage = document.getElementById('scrollMessage');

        // Filter and Sort elements
        const sortReportsSelect = document.getElementById('sortReports'); // Sort dropdown
        const filterStartDateInput = document.getElementById('filterStartDate'); // Filter start date
        const filterEndDateInput = document.getElementById('filterEndDate'); // Filter end date
        const applyFilterSortBtn = document.getElementById('applyFilterSortBtn'); // Apply filter/sort button

        // Notification elements (New)
        const enableNotificationsCheckbox = document.getElementById('enableNotificationsCheckbox');
        const reminderMinutesInput = document.getElementById('reminderMinutesInput');


        // App state store karne ke liye variables
        let inTime = null;
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

        // --- Local Storage Functions ---

        // App state ko Local Storage mein save karein
        function saveState() {
            const state = {
                inTime: inTime ? inTime.toISOString() : null,
                totalBreakDurationMinutes: totalBreakDurationMinutes,
                isBreakOn: isBreakOn,
                breakStartTime: breakStartTime ? breakStartTime.toISOString() : null,
                shiftDuration: parseFloat(shiftDurationInput.value),
                currentShiftOutTime: currentShiftOutTime ? currentShiftOutTime.toISOString() : null,
                manualInTimeValue: manualInTimeInput.value,
                isDarkMode: isDarkMode,
                enableNotifications: enableNotifications, // Save notification preference
                reminderMinutesBeforeOut: reminderMinutesInput.value, // Save reminder minutes
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
                totalBreakDurationMinutes = state.totalBreakDurationMinutes || 0;
                isBreakOn = state.isBreakOn || false;
                breakStartTime = state.breakStartTime ? new Date(state.breakStartTime) : null;
                shiftDurationInput.value = state.shiftDuration || 9;
                currentShiftOutTime = state.currentShiftOutTime ? new Date(state.currentShiftOutTime) : null;
                manualInTimeInput.value = state.manualInTimeValue || '';
                isDarkMode = state.isDarkMode || false;
                enableNotifications = state.enableNotifications || false; // Load notification preference
                reminderMinutesInput.value = state.reminderMinutesBeforeOut || 15; // Load reminder minutes
                notificationSentForCurrentShift = state.notificationSentForCurrentShift || false; // Load notification sent status


                // Reports load karein
                const savedReports = localStorage.getItem('officeTimeCalculatorDailyReports');
                dailyReports = savedReports ? JSON.parse(savedReports) : [];


                // Loaded state ke hisaab se UI update karein
                updateUI();
                if (isBreakOn) {
                    startBreakTimer();
                }
                // Load hone par dark mode apply karein
                if (isDarkMode) {
                    body.classList.add('dark');
                    darkModeIcon.textContent = '☀️'; // Sun icon for dark mode
                } else {
                    body.classList.remove('dark');
                    darkModeIcon.textContent = '🌙'; // Moon icon for light mode
                }

                // Update notification UI based on loaded state
                enableNotificationsCheckbox.checked = enableNotifications;
                reminderMinutesInput.disabled = !enableNotifications;
            } else {
                // Agar koi saved state nahi hai, toh UI ko default state mein rakhein
                updateUI();
            }
            renderReports(); // Reports ko load hone par render karein
        }

        // --- Core Logic Functions ---

        // UI ko current state ke hisaab se update karein
        function updateUI() {
            console.log('updateUI called. isBreakOn:', isBreakOn); // Debugging log
            if (inTime) {
                inDateDisplay.textContent = formatOnlyDate(inTime); // IN Date update karein
                statusDisplay.textContent = `IN at: ${formatTime(inTime)}`; // Sirf IN Time update karein
                inBtn.disabled = true;
                inBtn.style.opacity = '0.5'; // Basic disabled styling
                inBtn.style.cursor = 'not-allowed';
                outBtn.disabled = false;
                outBtn.style.opacity = '1';
                outBtn.style.cursor = 'pointer';
                breakToggleBtn.disabled = false;
                breakToggleBtn.style.opacity = '1';
                breakToggleBtn.style.cursor = 'pointer';
                manualInTimeInput.disabled = true;
                resetManualInTimeBtn.disabled = true;
                resetManualInTimeBtn.style.opacity = '0.5';
                resetManualInTimeBtn.style.cursor = 'not-allowed';
            } else {
                inDateDisplay.textContent = '-- -- --'; // IN Date reset karein
                statusDisplay.textContent = 'Press IN to start';
                inBtn.disabled = false;
                inBtn.style.opacity = '1';
                inBtn.style.cursor = 'pointer';
                outBtn.disabled = true;
                outBtn.style.opacity = '0.5';
                outBtn.style.cursor = 'not-allowed';
                breakToggleBtn.disabled = true;
                breakToggleBtn.style.opacity = '0.5';
                breakToggleBtn.style.cursor = 'not-allowed';
                manualInTimeInput.disabled = false;
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

            // Break button styling aur text update karein
            if (isBreakOn) {
                breakToggleBtn.classList.remove('off');
                breakToggleBtn.classList.add('on');
                breakToggleBtn.textContent = 'Break ON';
                breakTimerDisplay.style.display = 'block'; /* Timer dikhayein */
            } else {
                breakToggleBtn.classList.remove('on');
                breakToggleBtn.classList.add('off');
                breakToggleBtn.textContent = 'Break OFF';
                breakTimerDisplay.style.display = 'none'; /* Timer chhupayein */
            }

            updateLeavingTime();
        }

        // Leaving time calculate aur update karein
        function updateLeavingTime() {
            console.log('updateLeavingTime called. totalBreakDurationMinutes:', totalBreakDurationMinutes); // Debugging log
            if (!inTime) {
                outDateDisplay.textContent = '-- -- --'; // OUT Date reset karein
                leavingTimeDisplay.textContent = '--:-- --';
                totalBreakTimeDisplay.style.display = 'none'; /* Chhupayein */
                currentShiftOutTime = null;
                saveState();
                return;
            }

            const shiftHours = parseFloat(shiftDurationInput.value) || 9;
            const requiredShiftMinutes = shiftHours * 60;

            let currentTotalBreak = totalBreakDurationMinutes;
            if (isBreakOn && breakStartTime) {
                const currentBreakElapsedMs = Date.now() - breakStartTime.getTime();
                currentTotalBreak += currentBreakElapsedMs / (1000 * 60);
            }

            const totalMinutesNeeded = requiredShiftMinutes + currentTotalBreak;
            const leavingDate = new Date(inTime.getTime() + totalMinutesNeeded * 60 * 1000);
            currentShiftOutTime = leavingDate; // Estimated leaving time update karein

            outDateDisplay.textContent = formatOnlyDate(leavingDate); // OUT Date update karein
            leavingTimeDisplay.textContent = formatTime(leavingDate); // Sirf Leaving Time update karein
            totalBreakTimeDisplay.textContent = `Total Break: ${Math.round(currentTotalBreak)} minutes`;
            totalBreakTimeDisplay.style.display = 'block'; /* Dikhayein */

            // Check for notifications (New)
            checkNotificationReminder();

            saveState();
        }

        // Break timer ko update karein
        function startBreakTimer() {
            console.log('startBreakTimer called.'); // Debugging log
            if (breakInterval) {
                clearInterval(breakInterval);
            }
            breakInterval = setInterval(() => {
                if (breakStartTime) {
                    const currentBreakElapsedSeconds = (Date.now() - breakStartTime.getTime()) / 1000;
                    breakTimerDisplay.textContent = formatDuration(currentBreakElapsedSeconds);
                    console.log('Break Timer Update:', formatDuration(currentBreakElapsedSeconds)); // Debugging log
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
            if (!inTime || !enableNotifications || notificationSentForCurrentShift || !currentShiftOutTime) {
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

        // Daily report add karein
        function addReport(actualOutTime) { // actualOutTime parameter add kiya
            if (!inTime) return; // Agar IN time nahi hai, toh report add na karen

            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format

            // Actual work duration calculate karein
            const inTimeMs = inTime.getTime();
            const outTimeMs = actualOutTime.getTime(); // Actual OUT time use karein
            const totalShiftMs = outTimeMs - inTimeMs; // Total time from IN to actual OUT
            const totalBreakMs = totalBreakDurationMinutes * 60 * 1000;
            
            let actualWorkMs = totalShiftMs - totalBreakMs;
            // Ensure actual work is not negative
            if (actualWorkMs < 0) {
                actualWorkMs = 0;
            }
            const actualWorkDurationMinutes = Math.round(actualWorkMs / (1000 * 60));


            const newReport = {
                date: formattedDate,
                inTime: formatDateTime(inTime), // formatDateTime use karein
                outTime: formatDateTime(actualOutTime), // formatDateTime use karein
                shiftDurationHours: parseFloat(shiftDurationInput.value),
                totalBreakMinutes: Math.round(totalBreakDurationMinutes),
                actualWorkDurationMinutes: actualWorkDurationMinutes, // Corrected actual work duration
            };

            // Check karein ki aaj ki report pehle se hai ya nahi, agar hai toh update karein
            const existingReportIndex = dailyReports.findIndex(report => report.date === formattedDate);
            if (existingReportIndex > -1) {
                dailyReports[existingReportIndex] = newReport; // Existing report update karein
            } else {
                dailyReports.push(newReport); // Nayi report add karein
            }
            saveState();
            renderReports();
        }

        // Reports list render karein
        function renderReports() {
            reportsList.innerHTML = ''; // Existing list clear karein

            let reportsToRender = [...dailyReports]; // Create a copy to filter/sort

            // Apply Date Filtering
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

            // Apply Sorting
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


            if (reportsToRender.length === 0) {
                noReportsMessage.style.display = 'block'; // "No reports yet." message dikhayein
                reportsList.appendChild(noReportsMessage); // List ke andar rakhein styling ke liye
                clearAllReportsBtn.disabled = true;
                clearAllReportsBtn.style.opacity = '0.5';
                clearAllReportsBtn.style.cursor = 'not-allowed';
                exportReportsBtn.disabled = true; // Disable export if no reports
                exportReportsBtn.style.opacity = '0.5';
                exportReportsBtn.style.cursor = 'not-allowed';
            } else {
                noReportsMessage.style.display = 'none'; // "No reports yet." message chhupayein
                clearAllReportsBtn.disabled = false;
                clearAllReportsBtn.style.opacity = '1';
                clearAllReportsBtn.style.cursor = 'pointer';
                exportReportsBtn.disabled = false; // Enable export
                exportReportsBtn.style.opacity = '1';
                exportReportsBtn.style.cursor = 'pointer';


                reportsToRender.forEach(report => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Date: ${report.date}</strong><br>
                        <span>IN: ${report.inTime}, OUT: ${report.outTime}</span><br>
                        <span>Shift: ${report.shiftDurationHours} hrs, Break: ${report.totalBreakMinutes} mins</span><br>
                        <span>Actual Work: ${report.actualWorkDurationMinutes} mins</span>
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
                saveState();
                renderReports();
                showMessage('All reports have been deleted.');
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
        function showConfirmation(message, onConfirm) {
            if (currentMessageBox) {
                // Agar pehle se koi message box hai, toh use hata dein
                document.body.removeChild(currentMessageBox);
                currentMessageBox = null;
            }

            const confirmationBox = document.createElement('div');
            confirmationBox.classList.add('custom-message-box'); // Add a class for styling
            confirmationBox.innerHTML = `
                <p>${message}</p>
                <div style="margin-top: 15px;">
                    <button id="confirmYes" style="background-color: #4CAF50;">Yes</button>
                    <button id="confirmNo" style="background-color: #f44336;">No</button>
                </div>
            `;
            document.body.appendChild(confirmationBox);
            currentMessageBox = confirmationBox; // Store reference

            confirmationBox.querySelector('#confirmYes').addEventListener('click', () => {
                document.body.removeChild(confirmationBox);
                currentMessageBox = null;
                onConfirm();
            });

            confirmationBox.querySelector('#confirmNo').addEventListener('click', () => {
                document.body.removeChild(confirmationBox);
                currentMessageBox = null;
            });
        }


        // --- Event Handlers ---

        // IN button click handler
        inBtn.addEventListener('click', () => {
            console.log('IN button clicked.'); // Debugging log
            let startTime = new Date();
            if (manualInTimeInput.value) {
                const [hours, minutes] = manualInTimeInput.value.split(':').map(Number);
                startTime.setHours(hours, minutes, 0, 0);
            }
            inTime = startTime;
            totalBreakDurationMinutes = 0;
            notificationSentForCurrentShift = false; // Reset notification status for new shift
            updateUI();
            saveState();
        });

        // OUT button click handler
        outBtn.addEventListener('click', () => {
            console.log('OUT button clicked.'); // Debugging log
            if (isBreakOn) {
                toggleBreak(); // Break ko end karein OUT karne se pehle
            }
            
            const actualOutTime = new Date(); // Actual OUT time capture karein
            addReport(actualOutTime); // Report add karein actual OUT time ke saath

            // Naye din ke liye state reset karein
            inTime = null;
            totalBreakDurationMinutes = 0;
            currentShiftOutTime = null;
            manualInTimeInput.value = '';
            notificationSentForCurrentShift = false; // Reset notification status
            updateUI();
            saveState();
        });

        // Break toggle handler
        function toggleBreak() {
            console.log('toggleBreak called. Current isBreakOn:', isBreakOn); // Debugging log
            if (isBreakOn) {
                // Break OFF ho raha hai
                const breakEndTime = new Date();
                const elapsedBreakMs = breakEndTime.getTime() - breakStartTime.getTime();
                totalBreakDurationMinutes += elapsedBreakMs / (1000 * 60);
                console.log('Break OFF. Elapsed break (minutes):', elapsedBreakMs / (1000 * 60)); // Debugging log
                console.log('New totalBreakDurationMinutes:', totalBreakDurationMinutes); // Debugging log

                clearInterval(breakInterval);
                breakInterval = null;
                breakStartTime = null;
                isBreakOn = false;
            } else {
                // Break ON ho raha hai
                breakStartTime = new Date();
                isBreakOn = true;
                startBreakTimer();
                console.log('Break ON. Break start time:', breakStartTime); // Debugging log
            }
            updateUI();
            saveState();
        }
        breakToggleBtn.addEventListener('click', toggleBreak);

        // Shift duration change hone par leaving time update karein
        shiftDurationInput.addEventListener('input', () => {
            console.log('Shift duration changed.'); // Debugging log
            let value = parseFloat(shiftDurationInput.value);
            if (isNaN(value)) { // Handle empty input
                value = 0; // Or some default
            }

            if (value > 12) {
                shiftDurationInput.value = 12;
                showMessage('Shift duration cannot exceed 12 hours.');
            } else if (value < 1 && value !== 0) {
                shiftDurationInput.value = 1;
                showMessage('Shift duration cannot be less than 1 hour.');
            }
            updateLeavingTime();
            saveState();
        });

        // Manual IN time change hone par IN time update karein (agar IN nahi kiya hai)
        manualInTimeInput.addEventListener('change', () => {
            console.log('Manual IN time changed.'); // Debugging log
            if (!inTime) {
                updateUI();
            }
            saveState();
        });

        // Reset Manual IN Time button click handler
        resetManualInTimeBtn.addEventListener('click', () => {
            console.log('Reset Manual IN Time button clicked.'); // Debugging log
            manualInTimeInput.value = '';
            updateUI();
            saveState();
        });

        // Dark Mode Toggle handler
        darkModeToggle.addEventListener('click', () => {
            console.log('Dark Mode Toggle clicked.'); // Debugging log
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                body.classList.add('dark');
                darkModeIcon.textContent = '☀️'; // Sun icon for dark mode
            } else {
                body.classList.remove('dark');
                darkModeIcon.textContent = '🌙'; // Moon icon for light mode
            }
            saveState();
        });

        // View Reports Button handler
        viewReportsBtn.addEventListener('click', () => {
            console.log('View Reports button clicked.'); // Debugging log
            const wasHidden = reportsSection.classList.contains('hidden'); // Check state *before* toggling
            reportsSection.classList.toggle('hidden'); // Toggle visibility
            renderReports(); // Reports ko har baar dikhane par re-render karein

            if (wasHidden && !reportsSection.classList.contains('hidden')) { // Agar hidden se visible hua hai
                console.log('Reports section just became visible. Showing scroll message.');
                scrollMessage.classList.add('visible');
                // Remove the 'visible' class after 3 seconds
                setTimeout(() => {
                    scrollMessage.classList.remove('visible');
                    console.log('Scroll message hidden.');
                }, 3000);
            } else {
                // If the section was already visible or just hidden, hide the message
                console.log('Reports section was already visible or just hidden. Hiding scroll message.');
                scrollMessage.classList.remove('visible');
            }
        });

        // Apply Filter/Sort button handler
        applyFilterSortBtn.addEventListener('click', () => {
            console.log('Apply Filter/Sort button clicked.');
            renderReports(); // Re-render reports with current filter and sort options
        });

        // Clear All Reports button handler
        clearAllReportsBtn.addEventListener('click', clearAllReports);

        // Export Reports button handler
        exportReportsBtn.addEventListener('click', exportReportsToCSV);

        // Notification checkbox change handler
        enableNotificationsCheckbox.addEventListener('change', async () => {
            enableNotifications = enableNotificationsCheckbox.checked;
            reminderMinutesInput.disabled = !enableNotifications; // Enable/disable minutes input

            if (enableNotifications) {
                const granted = await requestNotificationPermission();
                if (!granted) {
                    enableNotificationsCheckbox.checked = false; // Uncheck if permission denied
                    enableNotifications = false;
                    reminderMinutesInput.disabled = true;
                }
            }
            saveState();
        });

        // Reminder minutes input change handler
        reminderMinutesInput.addEventListener('input', () => {
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
        });


        // Initial load: Local Storage se state load karein
        document.addEventListener('DOMContentLoaded', loadState);

        // Har second leaving time update karein
        setInterval(updateLeavingTime, 1000);
        
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
    