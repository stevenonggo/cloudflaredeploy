import type { AppState, CalendarEvent, Course, Task, Track } from '../types'
import { addDays, todayISO } from '../lib/date'
import { uid } from '../lib/id'

export const DEFAULT_COURSE_COLORS = [
  '#007aff', '#af52de', '#ff9500', '#34c759',
  '#ff375f', '#30b0c7', '#5856d6', '#ff2d55',
]

export const TRACKS: Track[] = [
  {
    id: 't1',
    title: 'Slow Current',
    artist: 'Kaimu',
    durationSec: 214,
    lyrics: [
      { t: 0, text: '(instrumental)' },
      { t: 14, text: 'Morning light on an open page' },
      { t: 22, text: 'Nothing here to rush' },
      { t: 30, text: 'One thing at a time' },
      { t: 38, text: 'And the hours make room' },
      { t: 50, text: 'Slow current, carry me' },
      { t: 58, text: 'Through the quiet of the afternoon' },
      { t: 70, text: 'I am not behind' },
      { t: 78, text: 'I am only here' },
      { t: 92, text: '(instrumental)' },
      { t: 120, text: 'Every small thing counts' },
      { t: 132, text: 'Every finished line' },
      { t: 146, text: 'Slow current, carry me home' },
    ],
  },
  {
    id: 't2',
    title: 'Paper Lanterns',
    artist: 'Mira Fen',
    durationSec: 187,
    lyrics: [
      { t: 0, text: '(instrumental)' },
      { t: 18, text: 'Paper lanterns down the hall' },
      { t: 28, text: 'Counting down the evening' },
      { t: 40, text: 'Work until the quiet comes' },
      { t: 52, text: 'Then let the whole thing go' },
      { t: 70, text: '(instrumental)' },
      { t: 100, text: 'Nothing left undone tonight' },
    ],
  },
  {
    id: 't3',
    title: 'Study Room 4B',
    artist: 'Halden',
    durationSec: 241,
    lyrics: [
      { t: 0, text: '(instrumental)' },
      { t: 24, text: 'Third floor, second door' },
      { t: 36, text: 'Same chair as yesterday' },
      { t: 48, text: 'The work is not the enemy' },
      { t: 60, text: 'The noise outside is' },
      { t: 84, text: '(instrumental)' },
    ],
  },
]

export function seedState(): AppState {
  const today = todayISO()

  const courses: Course[] = [
    { id: 'c_ml', name: 'Machine Learning', color: '#af52de' },
    { id: 'c_la', name: 'Linear Algebra', color: '#007aff' },
    { id: 'c_db', name: 'Databases', color: '#ff9500' },
    { id: 'c_ai', name: 'Artificial Intelligence', color: '#30b0c7' },
  ]

  const events: CalendarEvent[] = [
    {
      id: uid('ev'), title: 'Linear Algebra', kind: 'class', date: today,
      start: 9 * 60, end: 10 * 60 + 30, courseId: 'c_la',
      location: 'Hall B2', repeatDays: [1, 3],
    },
    {
      id: uid('ev'), title: 'AI Lecture', kind: 'class', date: today,
      start: 11 * 60, end: 12 * 60 + 30, courseId: 'c_ai',
      location: 'Room 401', repeatDays: [1, 4],
    },
    {
      id: uid('ev'), title: 'Databases Lab', kind: 'class', date: addDays(today, 1),
      start: 13 * 60, end: 15 * 60, courseId: 'c_db',
      location: 'Lab 2', repeatDays: [2, 5],
    },
    {
      id: uid('ev'), title: 'Study group', kind: 'event', date: addDays(today, 2),
      start: 16 * 60, end: 17 * 60 + 30, location: 'Library', repeatDays: [],
    },
  ]

  const tasks: Task[] = [
    {
      id: uid('tk'), title: 'Machine Learning assignment',
      notes: 'Gradient descent write-up + notebook.',
      due: addDays(today, 1), estimateMin: 90, priority: 'high', done: false,
      courseId: 'c_ml', isAssignment: true, createdAt: Date.now(),
    },
    {
      id: uid('tk'), title: 'Linear Algebra problem set 4',
      due: addDays(today, 3), estimateMin: 60, priority: 'medium', done: false,
      courseId: 'c_la', isAssignment: true, createdAt: Date.now(),
    },
    {
      id: uid('tk'), title: 'Database project — schema draft',
      due: addDays(today, 5), estimateMin: 120, priority: 'high', done: false,
      courseId: 'c_db', isAssignment: true, createdAt: Date.now(),
    },
    {
      id: uid('tk'), title: 'Read AI chapter 6',
      due: today, estimateMin: 45, priority: 'medium', done: false,
      courseId: 'c_ai', isAssignment: false, createdAt: Date.now(),
    },
    {
      id: uid('tk'), title: 'Email supervisor about thesis topic',
      due: today, estimateMin: 15, priority: 'low', done: false,
      isAssignment: false, createdAt: Date.now(),
    },
  ]

  return {
    settings: {
      username: 'there',
      theme: 'system',
      dayStart: 8 * 60,
      dayEnd: 21 * 60,
      maxBlockMin: 90,
      breakMin: 15,
      defaultFocusMin: 45,
      includeMeals: true,
      onboarded: false,
      shortcuts: [
        { id: 's1', label: 'Spotify', url: 'https://open.spotify.com', icon: '♫' },
        { id: 's2', label: 'YouTube', url: 'https://youtube.com', icon: '▶' },
        { id: 's3', label: 'Discord', url: 'https://discord.com/app', icon: '◎' },
      ],
    },
    courses,
    tasks,
    events,
    schedules: {},
    focusMode: false,
    session: null,
    music: { trackIndex: 0, playing: false, positionSec: 0 },
  }
}
