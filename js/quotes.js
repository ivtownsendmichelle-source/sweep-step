/* quotes.js — Daily quotes, reflections, traditions, concepts */
const Quotes = {
  pool: [
    "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.",
    "The only requirement for membership is a desire to stop. That's it. You belong here.",
    "Vulnerability is not weakness; it is the birthplace of connection and healing.",
    "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
    "One day at a time isn't just a slogan — it's a survival strategy.",
    "Your story is not over yet. The best chapters might be the ones you haven't written.",
    "Progress, not perfection. Every step forward counts, no matter how small.",
    "You don't have to see the whole staircase. Just take the first step.",
    "Courage is not the absence of fear; it's the willingness to act in spite of it.",
    "No one can go back and start a new beginning, but anyone can start today and make a new ending.",
    "The opposite of addiction is not sobriety. The opposite of addiction is connection.",
    "We are only as sick as our secrets. Sharing them sets us free.",
    "Recovery gave me back the person I was always meant to be.",
    "Be patient with yourself. Nothing in nature blooms all year.",
    "Your worth is not determined by your worst day.",
    "Showing up is the hardest part. You showed up today. That matters.",
    "Surrender is not giving up. It is letting go of the illusion of control.",
    "The wound is the place where the light enters you.",
    "You are not your addiction. You are not your past. You are the possibility of your future.",
    "What other people think of me is none of my business.",
    "Just because no one else can heal or do your inner work for you doesn't mean you have to do it alone.",
    "Recovery is about progression, not perfection. Keep moving forward.",
    "You have survived 100% of your worst days. You're doing better than you think.",
    "This too shall pass — the good and the bad. Stay present.",
    "We don't have to do it perfectly. We just have to do it honestly.",
    "There is no wrong way to be in recovery. Your path is yours.",
    "Authenticity is the daily practice of letting go of who we think we should be and embracing who we are.",
    "In recovery, we learn that it's okay to ask for help. It's not a sign of weakness — it's a sign of courage.",
    "Freedom is what you do with what's been done to you.",
    "Community is not just a place. It is a practice of showing up for each other.",
    "The only person you need to be better than is the person you were yesterday.",
    "Recovery is an act of radical self-love.",
    "You are worthy of the love you keep trying to give everyone else.",
    "Some days the bravest thing you can do is just keep going."
  ],

  steps: [
    { number: 1, title: "Honesty", description: "We admitted we were powerless over our addiction — that our lives had become unmanageable.", reflection: "Where in my life am I still trying to control the uncontrollable? What would it feel like to let go?" },
    { number: 2, title: "Hope", description: "Came to believe that a power greater than ourselves could restore us to sanity.", reflection: "What does sanity look like for me today? Where do I find hope outside of myself?" },
    { number: 3, title: "Faith", description: "Made a decision to turn our will and our lives over to the care of our Higher Power as we understood it.", reflection: "What does trust look like in my life right now? What am I holding onto that I could surrender?" },
    { number: 4, title: "Courage", description: "Made a searching and fearless moral inventory of ourselves.", reflection: "What am I afraid to look at honestly? What patterns keep showing up in my life?" },
    { number: 5, title: "Integrity", description: "Admitted to our Higher Power, to ourselves, and to another human being the exact nature of our wrongs.", reflection: "Who do I trust enough to be fully honest with? What have I been keeping inside?" },
    { number: 6, title: "Willingness", description: "Were entirely ready to have our Higher Power remove all these defects of character.", reflection: "Which of my character defects am I still holding onto? What am I afraid of becoming without them?" },
    { number: 7, title: "Humility", description: "Humbly asked our Higher Power to remove our shortcomings.", reflection: "What does humility look like in my daily life? How do I ask for help?" },
    { number: 8, title: "Compassion", description: "Made a list of all persons we had harmed, and became willing to make amends to them all.", reflection: "Who have I hurt that I haven't acknowledged? What is blocking my willingness?" },
    { number: 9, title: "Justice", description: "Made direct amends to such people wherever possible, except when to do so would injure them or others.", reflection: "What amends am I avoiding? How do I make things right without causing more harm?" },
    { number: 10, title: "Perseverance", description: "Continued to take personal inventory and when we were wrong promptly admitted it.", reflection: "What happened today that I need to look at honestly? Where was I wrong?" },
    { number: 11, title: "Spiritual Awareness", description: "Sought through prayer and meditation to improve our conscious contact with our Higher Power, seeking only for knowledge of its will for us and the power to carry that out.", reflection: "How did I connect with something greater than myself today? What guidance am I seeking?" },
    { number: 12, title: "Service", description: "Having had a spiritual awakening as the result of these steps, we tried to carry this message and to practice these principles in all our affairs.", reflection: "How can I be of service today? Who might need to hear that they are not alone?" }
  ],

  traditions: [
    { number: 1, title: "Unity", text: "Our common welfare should come first; personal recovery depends upon group unity.", reflection: "How am I contributing to the unity of my group? Am I putting common welfare before my own preferences?" },
    { number: 2, title: "Trusted Servants", text: "For our group purpose there is but one ultimate authority — a loving Higher Power as expressed in our group conscience. Our leaders are but trusted servants; they do not govern.", reflection: "How do I practice servant leadership? Do I trust the group conscience?" },
    { number: 3, title: "Membership", text: "The only requirement for membership is a desire to stop.", reflection: "Am I welcoming to everyone who walks through the door? Do I judge who belongs?" },
    { number: 4, title: "Autonomy", text: "Each group should be autonomous except in matters affecting other groups or the fellowship as a whole.", reflection: "How do I respect the autonomy of others while maintaining healthy boundaries?" },
    { number: 5, title: "Purpose", text: "Each group has but one primary purpose — to carry its message to those who still suffer.", reflection: "Am I focused on the primary purpose? How do I carry the message in my daily life?" },
    { number: 6, title: "Non-Endorsement", text: "A group ought never endorse, finance, or lend its name to any related facility or outside enterprise.", reflection: "Where in my life am I over-extending or over-committing in ways that distract from recovery?" },
    { number: 7, title: "Self-Supporting", text: "Every group ought to be fully self-supporting, declining outside contributions.", reflection: "Am I self-supporting in my recovery? Where am I overly dependent or overly independent?" },
    { number: 8, title: "Non-Professional", text: "Our fellowship should remain forever non-professional, but our service centers may employ special workers.", reflection: "How do I balance being helpful without overstepping into professional territory?" },
    { number: 9, title: "Structure", text: "Our groups, as such, ought never be organized; but we may create service boards or committees directly responsible to those they serve.", reflection: "How do I serve without seeking to control? Am I responsible to those I serve?" },
    { number: 10, title: "No Opinion", text: "Our fellowship has no opinion on outside issues; hence the name of the group ought never be drawn into public controversy.", reflection: "Can I hold my opinions without imposing them? Where do I need to practice restraint?" },
    { number: 11, title: "Attraction", text: "Our public relations policy is based on attraction rather than promotion.", reflection: "Am I attracting others through my example? Or am I trying to convince and promote?" },
    { number: 12, title: "Anonymity", text: "Anonymity is the spiritual foundation of all our traditions, ever reminding us to place principles before personalities.", reflection: "Am I putting principles before personalities today? Where does my ego get in the way?" }
  ],

  concepts: [
    { number: 1, text: "Final responsibility and ultimate authority for world services should always reside in the collective conscience of our whole fellowship.", reflection: "How do I honor the collective voice over my individual opinion?" },
    { number: 2, text: "The General Service Conference has become the active voice and effective conscience of our whole fellowship.", reflection: "Do I trust the process of group decision-making, even when it's slow?" },
    { number: 3, text: "To ensure effective leadership, we should endow each element of the service structure with a traditional Right of Decision.", reflection: "Can I delegate and trust others to make good decisions?" },
    { number: 4, text: "At all responsible levels, we ought to maintain a traditional Right of Participation.", reflection: "Am I making space for everyone's voice, especially those who are quieter?" },
    { number: 5, text: "Throughout our structure, a traditional Right of Appeal ought to prevail, so that minority opinion will be heard.", reflection: "Do I listen to dissenting views with an open mind?" },
    { number: 6, text: "The chief initiative and active responsibility in most world service matters should be exercised by the trustee members.", reflection: "How do I balance initiative with accountability in my own life?" },
    { number: 7, text: "The Charter and Bylaws are legal instruments, empowering the trustees to manage and conduct world service affairs.", reflection: "Do I respect the structures that support my recovery community?" },
    { number: 8, text: "The trustees are the principal planners and administrators of overall policy and finance.", reflection: "Am I willing to do the unglamorous work of planning and administration in service?" },
    { number: 9, text: "Good service leadership at all levels is indispensable for our future functioning and safety.", reflection: "What does good leadership look like in my recovery?" },
    { number: 10, text: "Every service responsibility should be matched by an equal service authority.", reflection: "Am I taking on responsibility without the resources to follow through?" },
    { number: 11, text: "The trustees should always have the best possible committees and service staff.", reflection: "Do I seek out capable people for collaborative work, or try to do everything alone?" },
    { number: 12, text: "The Conference shall observe the spirit of the Traditions, taking great care that it never becomes the seat of perilous wealth or power.", reflection: "Am I vigilant about the misuse of power and resources in my life?" }
  ],

  getDailyQuote() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    return this.pool[dayOfYear % this.pool.length];
  },

  getDailyReflection() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const cycle = dayOfYear % 36;
    if (cycle < 12) {
      const s = this.steps[cycle];
      return { type: 'Step', number: s.number, title: s.title, text: s.description, reflection: s.reflection, principle: s.title };
    } else if (cycle < 24) {
      const t = this.traditions[cycle - 12];
      return { type: 'Tradition', number: t.number, title: t.title, text: t.text, reflection: t.reflection, principle: t.title };
    } else {
      const c = this.concepts[cycle - 24];
      return { type: 'Concept', number: c.number, title: '', text: c.text, reflection: c.reflection, principle: '' };
    }
  }
};
