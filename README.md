# Caelora

> A modern student schedule planner and focus workspace.

Caelora is a student-focused productivity web app that combines **calendar planning, assignments, daily scheduling, music, and focus mode** into one comfortable workspace.

The goal is not to build another generic calendar or todo list. Caelora should help answer one question:

> **What should I be doing right now?**

---

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
```

React + TypeScript + Vite, no backend. Everything lives in `localStorage`,
so the app works offline and resets from **Settings → Reset all data**.

---

## Core Workflow

```text
Calendar
   ↓
Assignments & Tasks
   ↓
Build Your Day
   ↓
Daily Schedule
   ↓
Focus Mode
   ↓
Complete the Work
```

- **Calendar** — shows classes, events, deadlines, and commitments.
- **Tasks** — stores work that needs to be completed.
- **Build Your Day** — turns today's commitments and tasks into a realistic schedule.
- **Focus Mode** — provides a distraction-minimized environment for completing the scheduled work.

---

## Design Direction

Caelora uses an **iOS-inspired design language** without directly copying Apple's interface.

### Visual principles

- Clean, minimal interface
- Large typography
- Rounded cards and controls
- Generous whitespace
- Subtle borders and shadows
- Smooth transitions and animations
- Calm, comfortable backgrounds
- Light and dark modes
- Fixed navigation
- Responsive layouts
- Contextual floating controls

The application should feel like a **personal workspace**, not an enterprise project-management dashboard.

---

# Layout

Desktop uses three main UI regions:

```text
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│   SIDEBAR    │              SCROLLABLE CONTENT              │
│              │                                              │
│   Home       │                                              │
│   Calendar   │                                              │
│   Tasks      │                                              │
│   Focus      │                                              │
│   Settings   │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│                         DOWNBAR                             │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar

The sidebar remains fixed while the main content scrolls.

Primary navigation:

- Home
- Calendar
- Tasks
- Focus
- Settings

The sidebar should be collapsible into a compact icon-only version.

### Downbar

The downbar is **persistent and fixed to the bottom of the application**.

It provides quick access to contextual tools such as:

- Currently playing music
- Timer
- Quick-add task
- Focus Mode
- External shortcuts

External shortcuts can redirect to services such as Spotify, YouTube, X, Discord, or other user-defined destinations.

The downbar should remain accessible while scrolling.

---

# Pages & Features

## 1. Home

The Home page is the main dashboard.

```text
Hello, {username}
Tuesday, September 15

[ Continue ]    [ Build Your Day ]

┌─────────────────────────────────────┐
│ ♪ Currently Playing                 │
│   Song Name                 ──●──   │
└─────────────────────────────────────┘

Assignments

┌─────────────────────────────────────┐
│ ○ Machine Learning       Tomorrow   │
│ ○ Linear Algebra         Sep 18     │
│ ○ Database Project       Sep 20     │
└─────────────────────────────────────┘
```

The Home page should prioritize what matters **today**.

### Opening experience

When the application opens, greet the user with:

```text
Hello, {username}

[ Proceed ]    [ Build Your Day ]
```

`Proceed` takes the user into their existing workspace, while `Build Your Day` starts the daily scheduling flow.

---

## 2. Build Your Day

**Build Your Day is the central feature of Caelora.**

It uses information such as:

- Classes
- Calendar events
- Assignments
- Tasks
- Estimated task durations
- Available time

and creates a practical schedule for the current day.

Example:

```text
YOUR DAY

08:00  Breakfast

09:00  Linear Algebra
10:30  Break

11:00  AI Lecture
12:30  Lunch

13:30  ML Assignment
15:00  Break

15:30  Project Work
17:30  Free Time

19:00  Reading
20:00  Done
```

The scheduler should avoid overlapping existing commitments and should not unrealistically pack the entire day with work.

Users should be able to edit the generated schedule afterward.

---

## 3. Calendar

The Calendar page provides a full calendar view.

Initial version:

- Monthly calendar
- Current-day indicator
- Event indicators
- Assignment indicators
- Clickable days

Example:

```text
          September 2026

 Mon   Tue   Wed   Thu   Fri   Sat   Sun
──────────────────────────────────────────
       1     2     3     4     5     6
 7     8     9    10    11    12    13
14    [15]  16    17    18    19    20
21    22    23    24    25    26    27
28    29    30
```

Clicking a day should reveal what happens that day:

```text
September 15

09:00  Linear Algebra
11:00  AI Lecture

Assignments
────────────
ML Assignment
Due 23:59
```

Future versions may add:

- Week view
- Day view
- Drag-and-drop events
- Recurring events
- Time blocking

---

## 4. Tasks & Assignments

Tasks represent work that needs to be completed.

A task can contain:

- Title
- Description
- Due date
- Estimated duration
- Priority
- Completion status
- Course/category
- Optional scheduled time

Example:

```text
○ Machine Learning Assignment
  Due: Tomorrow
  Estimated: 90 min
  Priority: High
```

Tasks should work independently but also feed into **Build Your Day**.

---

## 5. Focus Mode

Focus Mode transforms Caelora into a distraction-minimized workspace.

It can be switched **On / Off** from the application.

When enabled, the interface emphasizes the current task while still allowing useful information such as music, lyrics, assignments, and the timer to remain accessible.

```text
                    FOCUS MODE

                       45:32

                  ML Assignment

              ─────────────────

                   [ Pause ]
                   [ End ]

             ♪ Currently Playing

                       Lyrics
```

Focus Mode can display:

- Current task
- Countdown timer
- Assignment information
- Task checklist
- Music
- Lyrics
- Session controls
- Comfortable/ambient background

Unnecessary navigation should be minimized while Focus Mode is active.

---

## 6. Focus Timer

The timer is integrated into Focus Mode and the persistent downbar.

Initial functionality:

- Countdown
- Start
- Pause
- Resume
- Reset
- End session
- Custom duration

Possible future presets:

- 25 / 5
- 50 / 10
- Custom

The timer should not be restricted to the Pomodoro technique.

---

## 7. Music

Caelora includes a compact music player.

```text
♪ Artist
  Song Name

───────●────────

◀     ▶     ▶
```

Potential functionality:

- Current track
- Playback progress
- Play/pause
- Previous/next
- External music service integration

Spotify integration can be added later. The initial prototype can use mock data.

---

## 8. Lyrics Sidebar

Focus Mode can optionally expose a lyrics sidebar/panel.

```text
┌─────────────────────────┐
│         Lyrics          │
│                         │
│       Current line      │
│                         │
│       Next line         │
│                         │
│       Next line         │
└─────────────────────────┘
```

The panel should be collapsible so it does not interfere with the current task.

Lyrics functionality may require third-party APIs and appropriate licensing.

---

## 9. Persistent Downbar

The downbar is a core part of the interface rather than a decorative element.

Example:

```text
┌──────────────────────────────────────────────────────────────┐
│ ♪ Song Name   ━━━━━●━━━━   42:17   + Task   Focus ON   X    │
└──────────────────────────────────────────────────────────────┘
```

It should provide persistent access to the most useful actions without taking too much screen space.

Possible shortcuts:

```text
[ Music ] [ Timer ] [ + Task ] [ Focus ] [ Spotify ] [ X ]
```

External shortcuts should open their destination without disrupting the Caelora workspace.

---

# Navigation Model

The application has two navigation layers with different purposes.

### Sidebar — application navigation

```text
Home
Calendar
Tasks
Focus
Settings
```

### Downbar — quick tools and shortcuts

```text
Music
Timer
Quick Add
Focus
External Links
```

The two should not simply duplicate each other.

---

# Responsive Design

### Desktop

```text
Fixed Sidebar
      +
Scrollable Content
      +
Fixed Downbar
```

### Mobile

The sidebar can become a navigation drawer or compact mobile navigation.

```text
┌─────────────────────────────┐
│                             │
│        Main Content         │
│                             │
│                             │
├─────────────────────────────┤
│ Home Calendar Tasks Focus   │
└─────────────────────────────┘
```

The downbar should adapt to the smaller screen rather than creating multiple competing navigation bars.

---

# Suggested Project Structure

```text
src/
├── components/
│   ├── Sidebar
│   ├── Downbar
│   ├── TaskCard
│   ├── AssignmentCard
│   ├── Calendar
│   ├── MusicPlayer
│   ├── LyricsPanel
│   ├── FocusTimer
│   └── ScheduleBlock
│
├── pages/
│   ├── Home
│   ├── Calendar
│   ├── Tasks
│   ├── Focus
│   └── Settings
│
├── features/
│   ├── scheduling
│   ├── tasks
│   ├── calendar
│   ├── focus
│   └── music
│
├── data/
│   └── ...
│
├── styles/
│   └── ...
│
└── App
```

The exact framework and architecture can be decided during implementation.

---

# Development Roadmap

## Phase 1 — UI Prototype

Build the visual experience first.

- [ ] Fixed sidebar
- [ ] Collapsible sidebar
- [ ] Persistent downbar
- [ ] Home page
- [ ] Calendar page
- [ ] Tasks page
- [ ] Focus Mode
- [ ] Timer UI
- [ ] Music player UI
- [ ] Lyrics panel
- [ ] Responsive design
- [ ] Light/dark mode
- [ ] Animations

No backend is required for this phase.

## Phase 2 — Core Functionality

- [ ] Create tasks
- [ ] Edit tasks
- [ ] Complete tasks
- [ ] Delete tasks
- [ ] Create calendar events
- [ ] Assignment due dates
- [ ] Estimated task duration
- [ ] Task priorities
- [ ] Daily schedule
- [ ] Local persistence
- [ ] Functional focus timer

## Phase 3 — Build Your Day

- [ ] Detect today's events
- [ ] Detect unfinished tasks
- [ ] Ask for available time
- [ ] Generate time blocks
- [ ] Avoid overlapping commitments
- [ ] Add reasonable breaks
- [ ] Allow schedule editing
- [ ] Send generated schedule to Focus Mode

## Phase 4 — Integrations

- [ ] Spotify integration
- [ ] Lyrics integration
- [ ] Notifications
- [ ] Authentication
- [ ] Cloud synchronization
- [ ] External shortcuts
- [ ] Calendar synchronization

---

# Design Principles

### Comfortable

The app should be comfortable enough to remain open for several hours.

### Minimal

Only show information relevant to the current context.

### Fast

Common actions should require very few interactions.

### Contextual

The interface should change depending on whether the user is planning or focusing.

### Persistent

Important controls remain accessible through the fixed sidebar and downbar.

### Personal

The application should feel like the user's own workspace rather than an enterprise project-management tool.

---

# Product Identity

Caelora can be summarized as:

> **Plan your day. Focus on the work.**

It combines:

```text
Calendar
   +
Tasks
   +
Daily Scheduling
   +
Music
   +
Lyrics
   +
Focus Timer
   +
Comfortable Workspace
```

into one student-oriented application.

---

# MVP

The first usable version should contain:

1. Home
2. Tasks
3. Calendar
4. Build Your Day
5. Focus Mode
6. Timer
7. Persistent sidebar
8. Persistent downbar
9. Responsive iOS-inspired UI

Music, lyrics, authentication, synchronization, and external integrations can initially be mocked or postponed.

The MVP should prove one thing:

> **Can Caelora take everything I need to do today and turn it into a schedule that I can actually follow?**
