# My Dashboard 🏠

A clean, minimal personal dashboard built with **HTML, CSS, and Vanilla JavaScript**. No frameworks, no backend — all data is stored in your browser via Local Storage.

## ✨ Features (MVP)

| Feature | Description |
|---|---|
| **Greeting** | Shows the current time, date, and a greeting that changes by time of day (morning / afternoon / evening / night) |
| **Focus Timer** | A 25-minute Pomodoro timer with **Start**, **Stop**, and **Reset** buttons. Plays a beep when finished |
| **To-Do List** | Add, edit, mark as done, and delete tasks. All tasks are saved in Local Storage |
| **Quick Links** | Add buttons that open your favourite websites in a new tab. Links are saved in Local Storage |

## 🏆 Challenges (3 of 5)

1. **Light / Dark mode** — Toggle the theme with the button in the header. Your choice is remembered across visits and respects your system preference on first load.
2. **Custom name in greeting** — Click the name in the greeting to edit it. Your name is saved locally and shown in the greeting.
3. **Sort tasks** — Sort your to-do list by newest first, alphabetical (A→Z / Z→A), pending first, or completed first.

## 🛠️ Tech Stack

- **HTML** — structure
- **CSS** — styling (single file in `css/`)
- **Vanilla JavaScript** — logic (single file in `js/`)
- **Local Storage API** — client-side data persistence
- No backend server required

## 📁 Project Structure

```
CodingCamp-16nov26-sitioktaryane/
├── index.html          # Main HTML structure
├── css/
│   └── style.css       # All styling (1 file)
├── js/
│   └── app.js          # All application logic (1 file)
├── README.md
└── .gitattributes
```

## 🚀 How to Run

Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari). That's it — no build step or dependencies required.

## 🌐 Deployment with GitHub Pages

1. Push this repository to GitHub using GitHub Desktop
2. Go to your repository on GitHub → **Settings** → **Pages**
3. Under **Source**, select your branch (e.g. `main`) and the `/root` folder
4. Click **Save** — your site will be live at `https://<username>.github.io/<repo-name>/`

---

Built for CodingCamp (16 Nov 2026) · Data stays in your browser, never sent anywhere
