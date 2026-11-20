/* ============================================================
   Personal Dashboard — Application Logic
   Vanilla JavaScript (no frameworks)

   Features:
     1. Greeting (time, date, greeting by time of day)
     2. Focus Timer (25 min · start / stop / reset)
     3. To-Do List (add / edit / toggle / delete · LocalStorage)
     4. Quick Links (add / open / delete · LocalStorage)

   Challenges implemented:
     1. Light / Dark mode
     2. Custom name in greeting
     3. Sort tasks
   ============================================================ */

(function () {
    'use strict';

    /* ========================================================
       Constants & Helpers
       ======================================================== */

    var STORAGE = {
        tasks:  'dashboard_tasks',
        links:  'dashboard_links',
        name:   'dashboard_name',
        theme:  'dashboard_theme'
    };

    /* Shorthand DOM selector */
    function $(id) { return document.getElementById(id); }

    /* Unique ID generator */
    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    /* Load & save JSON in localStorage */
    function loadJSON(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }
    function saveJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* storage full or unavailable */ }
    }

    /* Escape HTML to prevent injection via task/link text */
    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ========================================================
       State
       ======================================================== */

    var tasks      = loadJSON(STORAGE.tasks, []);
    var links      = loadJSON(STORAGE.links, []);
    var userName   = localStorage.getItem(STORAGE.name) || '';
    var editingId  = null;            /* id of the task currently being edited */

    /* Timer state */
    var timerDuration = 25 * 60;       /* seconds (default 25 min) */
    var timeLeft      = timerDuration;
    var timerInterval = null;

    /* ========================================================
       DOM References
       ======================================================== */

    var greetingText  = $('greetingText');
    var nameDisplay   = $('nameDisplay');
    var datetimeEl    = $('datetime');
    var themeToggle    = $('themeToggle');
    var themeIcon      = document.querySelector('.theme-icon');

    var timerDisplay   = $('timerDisplay');
    var startBtn       = $('startBtn');
    var stopBtn        = $('stopBtn');
    var resetBtn       = $('resetBtn');
    var timerStatus    = $('timerStatus');

    var taskForm       = $('taskForm');
    var taskInput      = $('taskInput');
    var sortSelect     = $('sortSelect');
    var taskList       = $('taskList');
    var emptyTasks     = $('emptyTasks');
    var taskCount      = $('taskCount');

    var linkForm       = $('linkForm');
    var linkName       = $('linkName');
    var linkUrl        = $('linkUrl');
    var linkList       = $('linkList');
    var emptyLinks     = $('emptyLinks');

    /* ========================================================
       1. Greeting & Date/Time
       ======================================================== */

    function getGreeting(hour) {
        if (hour >= 5  && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    }

    function updateGreeting() {
        var now   = new Date();
        var hour  = now.getHours();
        var time  = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        var date  = now.toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });

        greetingText.textContent = getGreeting(hour);
        datetimeEl.textContent  = time + ' · ' + date;
    }

    function renderName() {
        nameDisplay.textContent = userName || 'Friend';
    }

    /* ========================================================
       2. Theme Toggle (Challenge: Light/Dark mode)
       ======================================================== */

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem(STORAGE.theme, theme);
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    function initTheme() {
        var saved = localStorage.getItem(STORAGE.theme);
        if (saved) {
            applyTheme(saved);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    }

    /* ========================================================
       3. Custom Name (Challenge: Custom name in greeting)
       ======================================================== */

    function saveName(name) {
        userName = name.trim();
        if (userName) {
            localStorage.setItem(STORAGE.name, userName);
        } else {
            userName = '';
            localStorage.removeItem(STORAGE.name);
        }
        renderName();
    }

    function makeNameEditable() {
        nameDisplay.contentEditable = 'true';
        nameDisplay.focus();

        /* select all text inside */
        var range = document.createRange();
        range.selectNodeContents(nameDisplay);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function finishNameEdit() {
        nameDisplay.contentEditable = 'false';
        var value = nameDisplay.textContent.trim();
        if (value && value !== 'Friend') {
            saveName(value);
        } else {
            renderName();
        }
    }

    /* ========================================================
       4. Focus Timer
       ======================================================== */

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }

    function startTimer() {
        if (timerInterval) return;            /* already running */
        if (timeLeft <= 0) return;            /* nothing to run */

        timerStatus.textContent = 'Focusing… stay on task! 💪';
        timerInterval = setInterval(function () {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                timerStatus.textContent = '🎉 Time\'s up! Great work.';
                playBeep();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (timeLeft > 0 && timeLeft < timerDuration) {
            timerStatus.textContent = 'Paused.';
        }
    }

    function resetTimer() {
        stopTimer();
        timeLeft = timerDuration;
        updateTimerDisplay();
        timerStatus.textContent = '';
    }

    /* Short beep using the Web Audio API (no external file needed) */
    function playBeep() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) { /* audio not available */ }
    }

    /* ========================================================
       5. To-Do List  (add / edit / toggle / delete + sort)
       ======================================================== */

    function saveTasks() { saveJSON(STORAGE.tasks, tasks); }

    function addTask(text) {
        text = text.trim();
        if (!text) return;

        tasks.unshift({
            id:        uid(),
            text:      text,
            done:      false,
            createdAt: Date.now()
        });
        saveTasks();
        renderTasks();
    }

    function toggleTask(id) {
        var task = tasks.find(function (t) { return t.id === id; });
        if (task) {
            task.done = !task.done;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(id) {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        if (editingId === id) editingId = null;
        saveTasks();
        renderTasks();
    }

    function saveEditedTask(id, newText) {
        newText = newText.trim();
        var task = tasks.find(function (t) { return t.id === id; });
        if (task && newText) {
            task.text = newText;
            saveTasks();
        }
        editingId = null;
        renderTasks();
    }

    function cancelEdit() {
        editingId = null;
        renderTasks();
    }

    /* Sort tasks based on the selected option (Challenge: Sort tasks) */
    function getSortedTasks() {
        var mode = sortSelect.value;
        var copy = tasks.slice();

        switch (mode) {
            case 'az':
                copy.sort(function (a, b) { return a.text.localeCompare(b.text); });
                break;
            case 'za':
                copy.sort(function (a, b) { return b.text.localeCompare(a.text); });
                break;
            case 'pending':
                copy.sort(function (a, b) { return a.done - b.done; });
                break;
            case 'completed':
                copy.sort(function (a, b) { return b.done - a.done; });
                break;
            default:
                /* newest first — array already stored newest-first via unshift */
                break;
        }
        return copy;
    }

    function updateTaskCount() {
        var total = tasks.length;
        var done  = tasks.filter(function (t) { return t.done; }).length;
        taskCount.textContent = total ? (done + ' / ' + total + ' done') : '';
    }

    function renderTasks() {
        var sorted = getSortedTasks();
        taskList.innerHTML = '';

        if (sorted.length === 0) {
            emptyTasks.style.display = 'block';
            taskList.style.display   = 'none';
        } else {
            emptyTasks.style.display = 'none';
            taskList.style.display   = 'block';

            sorted.forEach(function (task) {
                var li = document.createElement('li');
                li.className = 'task-item' + (task.done ? ' done' : '');
                li.dataset.id = task.id;

                /* Checkbox */
                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.checked = task.done;
                checkbox.addEventListener('change', function () { toggleTask(task.id); });
                li.appendChild(checkbox);

                if (editingId === task.id) {
                    /* --- Edit mode --- */
                    var editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.className = 'task-edit-input';
                    editInput.value = task.text;
                    editInput.maxLength = 120;
                    editInput.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter') { e.preventDefault(); saveEditedTask(task.id, editInput.value); }
                        if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                    });
                    /* save on blur */
                    editInput.addEventListener('blur', function () { saveEditedTask(task.id, editInput.value); });
                    li.appendChild(editInput);

                    var actions = document.createElement('div');
                    actions.className = 'task-actions';
                    var saveBtn = document.createElement('button');
                    saveBtn.className = 'btn-icon';
                    saveBtn.innerHTML = '💾';
                    saveBtn.title = 'Save';
                    saveBtn.addEventListener('mousedown', function (e) { e.preventDefault(); saveEditedTask(task.id, editInput.value); });
                    actions.appendChild(saveBtn);
                    li.appendChild(actions);

                    /* focus after render */
                    setTimeout(function () { editInput.focus(); editInput.select(); }, 0);
                } else {
                    /* --- Display mode --- */
                    var span = document.createElement('span');
                    span.className = 'task-text';
                    span.textContent = task.text;
                    li.appendChild(span);

                    var actions = document.createElement('div');
                    actions.className = 'task-actions';

                    var editBtn = document.createElement('button');
                    editBtn.className = 'btn-icon';
                    editBtn.innerHTML = '✏️';
                    editBtn.title = 'Edit';
                    editBtn.addEventListener('click', function () {
                        editingId = task.id;
                        renderTasks();
                    });
                    actions.appendChild(editBtn);

                    var delBtn = document.createElement('button');
                    delBtn.className = 'btn-icon btn-delete';
                    delBtn.innerHTML = '🗑️';
                    delBtn.title = 'Delete';
                    delBtn.addEventListener('click', function () { deleteTask(task.id); });
                    actions.appendChild(delBtn);

                    li.appendChild(actions);
                }

                taskList.appendChild(li);
            });
        }

        updateTaskCount();
    }

    /* ========================================================
       6. Quick Links  (add / open / delete + LocalStorage)
       ======================================================== */

    var DEFAULT_LINKS = [
        { id: 'd1', name: 'Google',   url: 'https://google.com' },
        { id: 'd2', name: 'GitHub',    url: 'https://github.com' },
        { id: 'd3', name: 'YouTube',   url: 'https://youtube.com' }
    ];

    function saveLinks() { saveJSON(STORAGE.links, links); }

    /* Ensure a URL has a protocol so links open correctly */
    function normalizeURL(url) {
        url = url.trim();
        if (!url) return '';
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        return url;
    }

    function addLink(name, url) {
        name = name.trim();
        url  = url.trim();
        if (!name || !url) return;

        links.push({ id: uid(), name: name, url: normalizeURL(url) });
        saveLinks();
        renderLinks();
    }

    function deleteLink(id) {
        links = links.filter(function (l) { return l.id !== id; });
        saveLinks();
        renderLinks();
    }

    function renderLinks() {
        linkList.innerHTML = '';

        if (links.length === 0) {
            emptyLinks.style.display = 'block';
            linkList.style.display   = 'none';
        } else {
            emptyLinks.style.display = 'none';
            linkList.style.display   = 'flex';

            links.forEach(function (link) {
                var item = document.createElement('div');
                item.className = 'link-item';

                var a = document.createElement('a');
                a.className = 'link-button';
                a.href = link.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = link.name;
                item.appendChild(a);

                var del = document.createElement('button');
                del.className = 'btn-icon link-delete';
                del.innerHTML = '✕';
                del.title = 'Remove';
                del.addEventListener('click', function () { deleteLink(link.id); });
                item.appendChild(del);

                linkList.appendChild(item);
            });
        }
    }

    /* ========================================================
       Event Listeners
       ======================================================== */

    function bindEvents() {

        /* Theme */
        themeToggle.addEventListener('click', toggleTheme);

        /* Custom name — click to edit */
        nameDisplay.addEventListener('click', makeNameEditable);
        nameDisplay.addEventListener('blur', finishNameEdit);
        nameDisplay.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); nameDisplay.blur(); }
            if (e.key === 'Escape') { e.preventDefault(); renderName(); nameDisplay.contentEditable = 'false'; nameDisplay.blur(); }
        });

        /* Timer */
        startBtn.addEventListener('click', startTimer);
        stopBtn.addEventListener('click', stopTimer);
        resetBtn.addEventListener('click', resetTimer);

        /* To-Do */
        taskForm.addEventListener('submit', function (e) {
            e.preventDefault();
            addTask(taskInput.value);
            taskInput.value = '';
            taskInput.focus();
        });

        sortSelect.addEventListener('change', renderTasks);

        /* Quick Links */
        linkForm.addEventListener('submit', function (e) {
            e.preventDefault();
            addLink(linkName.value, linkUrl.value);
            linkName.value = '';
            linkUrl.value = '';
            linkName.focus();
        });
    }

    /* ========================================================
       Init
       ======================================================== */

    function init() {
        initTheme();

        /* Seed default links on first visit */
        if (links.length === 0 && !localStorage.getItem(STORAGE.links)) {
            links = DEFAULT_LINKS.slice();
            saveLinks();
        }

        renderName();
        updateGreeting();
        updateTimerDisplay();
        renderTasks();
        renderLinks();
        bindEvents();

        /* Update the clock every second */
        setInterval(updateGreeting, 1000);
    }

    /* Run after DOM is ready */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
