export const patients = [
  {
    id: 'p1',
    name: 'Emma Rodriguez',
    age: 7,
    condition: 'Articulation Disorder (S/Z)',
    nextSession: '2026-04-04',
    compliance: 87,
    streak: 5,
    voiceSamples: 12,
    flaggedExercises: ['S-blend word practice', 'Final consonant deletion'],
    exercises: [
      {
        id: 'e1',
        title: 'S-Blend Word Practice',
        instruction: 'Say each word slowly and clearly 3 times: "snow, slide, smile, spoon, star." Focus on keeping the /s/ sound before the next consonant.',
      },
      {
        id: 'e2',
        title: 'Final Sound Hold',
        instruction: 'Practice ending sounds by saying "cat, dog, cup" slowly. Hold the last sound for 2 full seconds before moving on.',
      },
      {
        id: 'e3',
        title: 'Mirror Mouth Movement',
        instruction: 'Watch yourself in a mirror. Make the /s/ sound 10 times, checking that your tongue tip is behind your top teeth. Then try it in the word "sun."',
      },
    ],
    sessionNotes: 'Emma demonstrated improved /s/ production in isolation but continues to struggle with consonant blends in connected speech. She responds well to visual feedback using the mirror. Caregiver reports she practices most evenings but skips on school days. Recommend maintaining current exercise frequency. Flagging S-blend practice as it remains inconsistent.',
    history: [
      { week: 'Mar 17', compliance: 72 },
      { week: 'Mar 24', compliance: 80 },
      { week: 'Mar 31', compliance: 87 },
    ],
  },
  {
    id: 'p2',
    name: 'James Chen',
    age: 45,
    condition: 'Aphasia (Post-Stroke)',
    nextSession: '2026-04-05',
    compliance: 62,
    streak: 2,
    voiceSamples: 7,
    flaggedExercises: ['Word retrieval warm-up'],
    exercises: [
      {
        id: 'e4',
        title: 'Word Retrieval Warm-Up',
        instruction: 'Name 5 items you can see in the room right now. Take your time. If a word doesn\'t come, describe what it does or looks like instead.',
      },
      {
        id: 'e5',
        title: 'Sentence Completion',
        instruction: 'Complete these phrases out loud: "Every morning I..." / "My favorite food is..." / "I live in..." Speak at whatever pace feels comfortable.',
      },
      {
        id: 'e6',
        title: 'Conversation Practice',
        instruction: 'Have a 3-minute conversation with your caregiver about something that happened today. Focus on getting your message across — the exact words don\'t have to be perfect.',
      },
    ],
    sessionNotes: 'James continues to make steady progress with word retrieval. Noun recall has improved significantly; verbs remain challenging, particularly in past tense. He reports frustration when words don\'t come quickly and tends to disengage from exercises mid-week. Caregiver is supportive but needs coaching on how to prompt without finishing his sentences. Word retrieval warm-up flagged — performance is inconsistent across sessions.',
    history: [
      { week: 'Mar 17', compliance: 55 },
      { week: 'Mar 24', compliance: 60 },
      { week: 'Mar 31', compliance: 62 },
    ],
  },
  {
    id: 'p3',
    name: 'Sofia Williams',
    age: 5,
    condition: 'Childhood-Onset Fluency Disorder',
    nextSession: '2026-04-07',
    compliance: 34,
    streak: 0,
    voiceSamples: 3,
    flaggedExercises: ['Slow speech practice', 'Easy onset vowels'],
    exercises: [
      {
        id: 'e7',
        title: 'Turtle Talk',
        instruction: 'Pretend you\'re a slow turtle! Tell a caregiver one thing about your day using your slowest, smoothest voice. There\'s no rush — turtles take their time.',
      },
      {
        id: 'e8',
        title: 'Easy Onset Vowels',
        instruction: 'Start these words with a very soft, gentle voice, like whispering at first: "apple, elephant, orange, umbrella." Let the sound flow out slowly.',
      },
      {
        id: 'e9',
        title: 'Smooth Talking Book',
        instruction: 'Read 3 pages of any picture book aloud with your caregiver. Use your smoothest voice. If you get stuck on a word, take a breath and try again slowly.',
      },
    ],
    sessionNotes: 'Sofia shows significant fluency breaks, especially on word-initial vowels and during high-excitement situations. Her stuttering has increased over the past month, possibly stress-related (new school term). Caregiver engagement is lower than ideal — they report difficulty making time for daily practice. Both slow speech and easy onset exercises have been flagged as hard. Recommend a caregiver coaching call before next session.',
    history: [
      { week: 'Mar 17', compliance: 45 },
      { week: 'Mar 24', compliance: 38 },
      { week: 'Mar 31', compliance: 34 },
    ],
  },
]

export function getPatientById(id) {
  return patients.find(p => p.id === id) || null
}
