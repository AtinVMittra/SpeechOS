export const patients = [
  {
    id: 'p1',
    name: 'Emma Rodriguez',
    age: 7,
    condition: 'Articulation Disorder (S/Z)',
    nextSession: '2026-04-28',
    compliance: 87,
    streak: 5,
    voiceSamples: 12,
    xp: 420,
    level: 4,
    badges: ['First Session', '5-Day Streak', 'Star Practitioner'],
    flaggedExercises: ['S-blend word practice', 'Final consonant deletion'],
    evaluationOutcome: {
      summary:
        'Emma presents with a moderate articulation disorder characterized by consistent substitution and distortion of /s/ and /z/ in all word positions and connected speech. Formal assessment (GFTA-3) places her performance at the 12th percentile for her age, with intelligibility estimated at approximately 75% to unfamiliar listeners.',
      keyAreas: [
        '/s/ and /z/ production accuracy across word positions',
        'Consonant blend sequencing (s-blends in initial position)',
        'Final consonant deletion in connected speech',
        'Carryover from structured drills to spontaneous speech',
      ],
      overarchingGoal:
        'Emma will produce /s/ and /z/ sounds with ≥80% accuracy in structured sentences and spontaneous conversation across 3 consecutive therapy sessions by July 2026.',
    },
    exercises: [
      {
        id: 'e1',
        title: 'S-Blend Word Practice',
        instruction:
          'Say each word slowly and clearly 3 times: "snow, slide, smile, spoon, star." Focus on keeping the /s/ sound before the next consonant.',
        type: 'quiz',
        targetWord: 'snow',
      },
      {
        id: 'e2',
        title: 'Final Sound Hold',
        instruction:
          'Practice ending sounds by saying "cat, dog, cup" slowly. Hold the last sound for 2 full seconds before moving on.',
        type: 'exercise',
      },
      {
        id: 'e3',
        title: 'Mirror Mouth Movement',
        instruction:
          'Watch yourself in a mirror. Make the /s/ sound 10 times, checking that your tongue tip is behind your top teeth. Then try it in the word "sun."',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
    ],
    sessionNotes:
      'Emma demonstrated improved /s/ production in isolation but continues to struggle with consonant blends in connected speech. She responds well to visual feedback using the mirror. Caregiver reports she practices most evenings but skips on school days. Recommend maintaining current exercise frequency. Flagging S-blend practice as it remains inconsistent.',
    history: [
      { week: 'Mar 17', compliance: 72 },
      { week: 'Mar 24', compliance: 80 },
      { week: 'Mar 31', compliance: 87 },
    ],
    lastCheckIn: {
      date: '2026-04-24',
      rating: 4,
      hardExercises: ['S-Blend Word Practice'],
      questions: ['Why does my tongue go forward when I make the S sound?'],
      topicsToExplore: 'Mirror exercises to do independently at home',
    },
    patientQuestions: ['Why does my tongue go forward when I make the S sound?'],
    sessionPlan: null,
    soapNotes: [],
  },
  {
    id: 'p2',
    name: 'Liam Thompson',
    age: 9,
    condition: 'Childhood Apraxia of Speech (CAS)',
    nextSession: '2026-04-29',
    compliance: 71,
    streak: 3,
    voiceSamples: 9,
    xp: 280,
    level: 3,
    badges: ['First Session', '3-Day Streak'],
    flaggedExercises: ['Multisyllabic word sequencing', 'Smooth sound transitions'],
    evaluationOutcome: {
      summary:
        'Liam presents with moderate-to-severe CAS characterized by inconsistent speech sound errors, significant difficulty with multisyllabic words, and reduced prosody. Standardized assessment (DIVA, GFTA-3) confirmed marked errors across all word positions with greater difficulty as utterance length increases.',
      keyAreas: [
        'Multisyllabic word sequencing and syllable stress',
        'Smooth motor transitions between sounds',
        'Consonant accuracy in word-final position',
        'Prosody and natural speech rhythm',
      ],
      overarchingGoal:
        'Liam will produce 2–3 syllable words with correct syllable stress and ≥80% consonant accuracy in structured conversation across 3 consecutive therapy sessions by June 2026.',
    },
    exercises: [
      {
        id: 'e4',
        title: 'Syllable Tapping',
        instruction:
          'Tap your knee once for each syllable as you say the words: "butterfly, dinosaur, umbrella, elephant." Repeat each word 5 times.',
        type: 'quiz',
        targetWord: 'butterfly',
      },
      {
        id: 'e5',
        title: 'Slow-Motion Word Practice',
        instruction:
          'Say each word as slowly as possible, feeling each sound move: "spaghetti, telephone, remember." Repeat each word 5 times, then gradually speed up.',
        type: 'exercise',
      },
      {
        id: 'e6',
        title: 'Sound Placement Video',
        instruction:
          'Watch the video showing where to place your tongue and lips for tricky sounds. Pause and copy each movement before moving on.',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
    ],
    sessionNotes:
      'Liam demonstrated improved consistency on CV and CVC syllable shapes in isolation but continues to show marked difficulty with multisyllabic targets in connected speech. Motor sequencing errors are most prominent in word-final position. He is motivated and responds well to tactile cueing and reduced speech rate. Parent attends all sessions and implements home program consistently.',
    history: [
      { week: 'Mar 17', compliance: 60 },
      { week: 'Mar 24', compliance: 66 },
      { week: 'Mar 31', compliance: 71 },
    ],
    lastCheckIn: {
      date: '2026-04-24',
      rating: 4,
      hardExercises: ['Multisyllabic word sequencing'],
      questions: ['Should he practice slowly or at normal speed?'],
      topicsToExplore: 'Strategies to make home practice more fun',
    },
    patientQuestions: ['Should he practice slowly or at normal speed?'],
    sessionPlan: null,
    soapNotes: [],
  },
  {
    id: 'p3',
    name: 'Sofia Williams',
    age: 5,
    condition: 'Childhood-Onset Fluency Disorder',
    nextSession: '2026-04-30',
    compliance: 34,
    streak: 0,
    voiceSamples: 3,
    xp: 80,
    level: 1,
    badges: ['First Session'],
    flaggedExercises: ['Slow speech practice', 'Easy onset vowels'],
    evaluationOutcome: {
      summary:
        'Sofia presents with a moderate fluency disorder featuring repetitions of sounds and syllables, prolongations, and occasional blocks occurring in approximately 8–12% of spoken words. The Stuttering Severity Instrument-4 (SSI-4) yielded a score in the moderate range, with increased disfluency observed during narrative and conversational speech.',
      keyAreas: [
        'Easy onset techniques for word-initial vowels',
        'Slow speech rate and reduced tension during disfluent moments',
        'Final consonant deletion and cluster reduction (phonological)',
        'Expressive vocabulary in narrative retell tasks',
      ],
      overarchingGoal:
        'Sofia will use easy-onset and slow-speech strategies to achieve ≤5% stuttered syllables in structured conversation with ≥70% accuracy across 3 consecutive therapy sessions by August 2026.',
    },
    exercises: [
      {
        id: 'e7',
        title: 'Turtle Talk',
        instruction:
          "Pretend you're a slow turtle! Tell a caregiver one thing about your day using your slowest, smoothest voice. There's no rush — turtles take their time.",
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      {
        id: 'e8',
        title: 'Easy Onset Vowels',
        instruction:
          'Start these words with a very soft, gentle voice, like whispering at first: "apple, elephant, orange, umbrella." Let the sound flow out slowly.',
        type: 'quiz',
        targetWord: 'apple',
      },
      {
        id: 'e9',
        title: 'Smooth Talking Book',
        instruction:
          'Read 3 pages of any picture book aloud with your caregiver. Use your smoothest voice. If you get stuck on a word, take a breath and try again slowly.',
        type: 'exercise',
      },
    ],
    sessionNotes:
      "Sofia shows significant fluency breaks, especially on word-initial vowels and during high-excitement situations. Her stuttering has increased over the past month, possibly stress-related (new school term). Caregiver engagement is lower than ideal — they report difficulty making time for daily practice. Both slow speech and easy onset exercises have been flagged as hard. Recommend a caregiver coaching call before next session.",
    history: [
      { week: 'Mar 17', compliance: 45 },
      { week: 'Mar 24', compliance: 38 },
      { week: 'Mar 31', compliance: 34 },
    ],
    lastCheckIn: null,
    patientQuestions: [],
    sessionPlan: null,
    soapNotes: [],
  },
  {
    id: 'p4',
    name: 'Mia Patel',
    age: 4,
    condition: 'Expressive/Receptive Language Delay',
    nextSession: '2026-05-01',
    compliance: 58,
    streak: 2,
    voiceSamples: 5,
    xp: 140,
    level: 2,
    badges: ['First Session', 'Getting Started'],
    flaggedExercises: ['Wh-question practice', 'Category sorting'],
    evaluationOutcome: {
      summary:
        'Mia presents with a moderate expressive and receptive language delay, with language age estimated at approximately 2 years 6 months based on the PLS-5. She demonstrates limited vocabulary (approximately 80 words), absent two-word combinations, and difficulty following 2-step directions in context.',
      keyAreas: [
        'Expressive vocabulary expansion (target: nouns, verbs, descriptors)',
        'Two-word and early three-word utterance production',
        'Following two-step directions',
        'Wh-question comprehension (what, where, who)',
      ],
      overarchingGoal:
        'Mia will produce spontaneous 2-word combinations to request and comment with ≥80% accuracy across structured play activities in 3 consecutive therapy sessions by September 2026.',
    },
    exercises: [
      {
        id: 'e10',
        title: 'Wh-Question Picture Cards',
        instruction:
          'Show Mia a picture book or cards. Ask "What is this?" and "Where is the dog?" Point to the picture and wait 5 seconds for her to respond before giving the answer.',
        type: 'exercise',
      },
      {
        id: 'e11',
        title: 'Category Sorting Game',
        instruction:
          'Put toys into two groups (animals and food). Name each item as you sort it: "This is a cow — cow goes with animals." Ask Mia to copy or help sort.',
        type: 'quiz',
        targetWord: 'animal',
      },
      {
        id: 'e12',
        title: 'Two-Word Requesting',
        instruction:
          'During snack or play time, hold out an item and wait. Model "more juice" or "big ball" and encourage Mia to imitate. Celebrate any attempt!',
        type: 'video',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
    ],
    sessionNotes:
      "Mia's expressive output has increased slightly over the past month with consistent parent-implemented naturalistic teaching. She is initiating more joint attention bids and occasionally attempts word approximations when highly motivated. Receptive vocabulary is growing but wh-questions remain difficult, particularly 'where' and 'who.' Parent coaching on following the child's lead has been well received.",
    history: [
      { week: 'Mar 17', compliance: 48 },
      { week: 'Mar 24', compliance: 52 },
      { week: 'Mar 31', compliance: 58 },
    ],
    lastCheckIn: {
      date: '2026-04-22',
      rating: 3,
      hardExercises: ['Wh-Question Picture Cards'],
      questions: ['How do we know if she understands or is just guessing?'],
      topicsToExplore: 'Ways to build vocabulary during daily routines',
    },
    patientQuestions: ['How do we know if she understands or is just guessing?'],
    sessionPlan: null,
    soapNotes: [],
  },
]

export function getPatientById(id) {
  return patients.find(p => p.id === id) || null
}
