// LocalStorage state initialization
let tasks = [];
let currentTaskIndex = null;
let breaksTaken = 0;
let completedCount = 0;
let userScore = 0;

// DOM Elements on Index Page
const taskForm = document.getElementById('task-form');
const taskChecklist = document.getElementById('task-checklist');
const startTaskBtn = document.getElementById('start-task-btn');

// DOM Elements on Page 2
const activeTaskTitle = document.getElementById('active-task-title');
const stopwatchDisplay = document.getElementById('stopwatch');
const breakBtn = document.getElementById('break-btn');
const continueBtn = document.getElementById('continue-btn');

// DOM Elements on Page 3
const summaryBreaks = document.getElementById('summary-breaks');
const summaryCompletedTasks = document.getElementById('summary-completed-tasks');
const summaryScore = document.getElementById('summary-score');

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // If we are on index.html (detected by taskChecklist), clear memory on load/refresh
    if (taskChecklist) {
        localStorage.clear(); // Clears all saved memory when index.html is opened or refreshed
        tasks = [];
        currentTaskIndex = null;
        breaksTaken = 0;
        completedCount = 0;
        userScore = 0;

        renderChecklist();
        
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('task-name').value;
            const time = parseInt(document.getElementById('task-time').value);

            tasks.push({
                name: name,
                time: time * 60, // convert minutes to seconds
                status: 'incomplete' // incomplete, in_progress, completed
            });

            saveAndReload();
            taskForm.reset();
        });

        startTaskBtn.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="selected-task"]:checked');
            if (selectedRadio) {
                currentTaskIndex = parseInt(selectedRadio.value);
                tasks[currentTaskIndex].status = 'in_progress';
                breaksTaken = 0; // Reset breaks for new session
                saveState();
                window.location.href = 'page2.html';
            }
        });
    }

    // Page 2 logic (Timer)
    if (stopwatchDisplay) {
        // Load state for Page 2
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        currentTaskIndex = localStorage.getItem('currentTaskIndex') !== null ? parseInt(localStorage.getItem('currentTaskIndex')) : null;
        breaksTaken = parseInt(localStorage.getItem('breaksTaken')) || 0;
        completedCount = parseInt(localStorage.getItem('completedCount')) || 0;
        userScore = parseInt(localStorage.getItem('userScore')) || 0;

        if (currentTaskIndex === null || !tasks[currentTaskIndex]) {
            window.location.href = 'index.html';
            return;
        }

        const task = tasks[currentTaskIndex];
        activeTaskTitle.textContent = `Working on: ${task.name}`;
        
        let timeLeft = task.time;
        updateTimerDisplay(timeLeft);

        let timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay(timeLeft);
            } else {
                clearInterval(timerInterval);
                tasks[currentTaskIndex].status = 'completed';
                completedCount++;
                userScore += 5;
                saveState();
                window.location.href = 'page3.html';
            }
        }, 1000);

        breakBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            breaksTaken++;
            saveState();
            breakBtn.style.display = 'none';
            continueBtn.style.display = 'block';
        });

        continueBtn.addEventListener('click', () => {
            continueBtn.style.display = 'none';
            breakBtn.style.display = 'block';

            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay(timeLeft);
                } else {
                    clearInterval(timerInterval);
                    tasks[currentTaskIndex].status = 'completed';
                    completedCount++;
                    userScore += 5;
                    saveState();
                    window.location.href = 'page3.html';
                }
            }, 1000);
        });
    }

    // Page 3 logic (Summary)
    if (summaryBreaks) {
        breaksTaken = parseInt(localStorage.getItem('breaksTaken')) || 0;
        completedCount = parseInt(localStorage.getItem('completedCount')) || 0;
        userScore = parseInt(localStorage.getItem('userScore')) || 0;

        summaryBreaks.textContent = breaksTaken;
        summaryCompletedTasks.textContent = completedCount;
        summaryScore.textContent = `${userScore} pts`;
    }
});

// Helper Functions
function renderChecklist() {
    if (tasks.length === 0) {
        taskChecklist.innerHTML = `<p class="empty-state">No tasks added yet. Add one above!</p>`;
        startTaskBtn.disabled = true;
        return;
    }

    taskChecklist.innerHTML = '';
    tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';

        let statusClass = 'status-incomplete';
        let statusText = 'Incomplete';
        if (task.status === 'in_progress') {
            statusClass = 'status-in-progress';
            statusText = 'In Progress';
        } else if (task.status === 'completed') {
            statusClass = 'status-completed';
            statusText = 'Completed';
        }

        item.innerHTML = `
            <input type="radio" name="selected-task" value="${index}" id="task-${index}">
            <label for="task-${index}">${task.name} (${Math.ceil(task.time / 60)} mins)</label>
            <span class="${statusClass}">${statusText}</span>
        `;
        taskChecklist.appendChild(item);
    });

    const radios = document.querySelectorAll('input[name="selected-task"]');
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            startTaskBtn.disabled = false;
        });
    });
}

function updateTimerDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    stopwatchDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function saveState() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('currentTaskIndex', currentTaskIndex);
    localStorage.setItem('breaksTaken', breaksTaken);
    localStorage.setItem('completedCount', completedCount);
    localStorage.setItem('userScore', userScore);
}

function saveAndReload() {
    saveState();
    renderChecklist();
}