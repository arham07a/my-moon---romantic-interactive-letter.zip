
import { AppContent } from './types';

export const DEFAULT_CONTENT: AppContent = {
  senderName: "Your Earth",
  recipientName: "My Moon",
  accentColor: "#6366f1", // Default Indigo
  welcomeTitle: "For My Moonlight",
  welcomeSubtitle: "The world has billions of stars, but my sky only needs one Moon. You are the light that guides me home.",
  letterTitle: "To My Beautiful Moon",
  letterContent: "My Dearest Moon,\n\nThey say the moon has phases, changing every night, yet it remains the most constant thing in the sky. You are just like that to me. No matter what phase of life we are in—full of joy or a sliver of hope—you are always beautiful, always radiant.\n\nYou don't just reflect light; you are the source of mine. Even when I can't see you, I feel your gravity pulling me close, keeping my tides in rhythm. You are the silence in my noise and the glow in my darkness.\n\nKeep shining, my love.",
  playlistTitle: "Melodies for the Moon",
  songs: [
    {
      id: '1',
      title: "Talking to the Moon",
      artist: "Bruno Mars (Cover)",
      coverUrl: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?q=80&w=500&auto=format&fit=crop",
      duration: "3:30",
      // Soft romantic piano
      spotifyUrl: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3"
    }
  ],
  cardsTitle: "Why You Are My Moon",
  memoryCards: [
    {
      id: 'c1',
      frontText: "Your Light",
      backText: "Even on my darkest nights, your thought alone is enough to light up my world.",
      imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c2',
      frontText: "Your Phases",
      backText: "I love every side of you. The happy full moon, and the quiet crescent.",
      imageUrl: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c3',
      frontText: "My Gravity",
      backText: "You keep me grounded while teaching me how to fly.",
      imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c4',
      frontText: "Midnight Talks",
      backText: "Our conversations at 2 AM are better than any dream I could have.",
      imageUrl: "https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c5',
      frontText: "Rare Beauty",
      backText: "Like a blue moon, someone like you comes around only once in a lifetime.",
      imageUrl: "https://images.unsplash.com/photo-1514897542161-98e2dacce087?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c6',
      frontText: "Calmness",
      backText: "Looking at you gives me the same peace as looking at the night sky.",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c7',
      frontText: "My Satellite",
      backText: "No matter how far I orbit, I always return to you.",
      imageUrl: "https://images.unsplash.com/photo-1614730341194-75c60740a5d3?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c8',
      frontText: "Eclipse",
      backText: "You overshadow everything else in my life. You are all I see.",
      imageUrl: "https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=500&auto=format&fit=crop"
    },
    {
      id: 'c9',
      frontText: "Forever",
      backText: "To the moon and back, always.",
      imageUrl: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=500&auto=format&fit=crop"
    }
  ],
  finalTitle: "To Infinity",
  finalContent: "The moon might be 384,400 km away, but you feel like you are right here in my heart. Distance is just a number when the connection is cosmic. \n\nStay with me, orbit with me, and let's make this universe ours. You are, and always will be, my Moon.",
  closingNote: "Love you to the Moon & back 🌙",
  quizConfig: {
    title: "Moon Trivia (About Us)",
    successMessage: "You are truly my soulmate! 🌕",
    questions: [
        {
            id: 'q1',
            question: "When do I think of you the most?",
            options: ["In the morning", "When I see the Moon", "During work", "Never"],
            correctOptionIndex: 1
        },
        {
            id: 'q2',
            question: "What are you to me?",
            options: ["A Star", "The Sun", "My Moon", "A Planet"],
            correctOptionIndex: 2
        }
    ]
  }
};
