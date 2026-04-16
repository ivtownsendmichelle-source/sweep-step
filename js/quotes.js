/* quotes.js — Daily quotes, reflections, traditions, concepts */
const Quotes = {
  /* 60 quotes. Rotates by calendar day. No repeats within 60 days.
     Meeting voice. Plain language. Short sentences. No em dashes. */
  pool: [
    "You didn't get sick overnight. You don't get well overnight either.",
    "The program works if you work it. It doesn't work if you don't.",
    "Feelings aren't facts.",
    "You can't think your way into right action. You act your way into right thinking.",
    "Pip says: sweep a little today.",
    "First drink, first drunk.",
    "Principles before personalities.",
    "One day at a time. Sometimes one hour.",
    "Meeting makers make it.",
    "If your best thinking got you here, try some of ours.",
    "Don't drink. Don't use. Go to meetings.",
    "This too shall pass. The good parts too. That's why we stay.",
    "Half measures availed us nothing.",
    "Keep coming back.",
    "You are exactly where you are supposed to be.",
    "Pip says: the broom doesn't care how bad the floor is. You just start.",
    "Contempt prior to investigation is what kept me out for years.",
    "I don't have to believe it. I just have to not drink today.",
    "The only thing you have to change is everything.",
    "Live and let live.",
    "Let go or be dragged.",
    "Your worst day sober is still better than your best day out there.",
    "Nobody ever got drunk at a meeting.",
    "I came. I came to. I came to believe.",
    "If I'm not the problem, there is no solution.",
    "It works. It really does.",
    "Pip says: you showed up. That's the whole game some days.",
    "Progress, not perfection. You heard that one already.",
    "I can't. We can. Will you?",
    "The gift of desperation got me in the door.",
    "Time takes time.",
    "Anger is the luxury of the normal person. We can't afford it.",
    "I'm not a bad person getting good. I'm a sick person getting well.",
    "We are not responsible for our disease. We are responsible for our recovery.",
    "Easy does it. But do it.",
    "Sometimes I just need to sit down and shut up.",
    "Pip says: small moves. Small moves again. That's how this works.",
    "The definition of insanity is doing the same thing and expecting different results.",
    "Hurt people hurt people. Healed people heal people.",
    "You spot it, you got it.",
    "Don't quit before the miracle.",
    "HALT. Hungry. Angry. Lonely. Tired. Any one of those and I'm not okay.",
    "There's no problem so bad that a drink won't make it worse.",
    "Stick with the winners.",
    "Call someone before you pick up. Call someone after too.",
    "Pip says: I've been around. You're doing better than you think.",
    "If nothing changes, nothing changes.",
    "Acceptance is the answer to all my problems today.",
    "I'd rather be the happiest drunk sober than the saddest drunk drunk. Or something like that.",
    "My sponsor told me to get out of the problem and into the solution. I'm still working on it.",
    "I can't afford a resentment. It's too expensive.",
    "Expectations are premeditated resentments.",
    "You can't save your face and your ass at the same time.",
    "I don't have a drinking problem. I have a thinking problem that drinking made worse.",
    "The steps are where the actual work is. The meetings are where you stay alive to do the work.",
    "My disease wants me dead. But it'll settle for drunk and miserable.",
    "Two alcoholics talking is a meeting. Three is a party.",
    "I came for my drinking. I stayed for my thinking.",
    "Before I got sober, I thought drinking was my problem. Turns out drinking was my solution. The problem was me.",
    "Don't compare your insides to somebody else's outsides."
  ],

  steps: [
    { number: 1, title: "Honesty", description: "We admitted we were powerless over our addiction. That our lives had become unmanageable.", reflection: "What am I still trying to run? What would it feel like to put the keys down?" },
    { number: 2, title: "Hope", description: "Came to believe that a power greater than ourselves could restore us to sanity.", reflection: "Where do I find something bigger than me today?" },
    { number: 3, title: "Faith", description: "Made a decision to turn our will and our lives over to the care of our Higher Power as we understood it.", reflection: "What am I white-knuckling that I could let go of?" },
    { number: 4, title: "Courage", description: "Made a searching and fearless moral inventory of ourselves.", reflection: "What keeps showing up? The same story wearing a different hat is still the same story." },
    { number: 5, title: "Integrity", description: "Admitted to our Higher Power, to ourselves, and to another human being the exact nature of our wrongs.", reflection: "Who can I tell the whole thing to? Not the edited version." },
    { number: 6, title: "Willingness", description: "Were entirely ready to have our Higher Power remove all these defects of character.", reflection: "Which defect am I still protecting? Why?" },
    { number: 7, title: "Humility", description: "Humbly asked our Higher Power to remove our shortcomings.", reflection: "What does asking for help actually look like today?" },
    { number: 8, title: "Compassion", description: "Made a list of all persons we had harmed, and became willing to make amends to them all.", reflection: "Who is on the list I'm not writing down?" },
    { number: 9, title: "Justice", description: "Made direct amends to such people wherever possible, except when to do so would injure them or others.", reflection: "What amends am I avoiding? What is the actual fear?" },
    { number: 10, title: "Perseverance", description: "Continued to take personal inventory and when we were wrong promptly admitted it.", reflection: "Where was I wrong today? Say it out loud." },
    { number: 11, title: "Spiritual Awareness", description: "Sought through prayer and meditation to improve our conscious contact with our Higher Power.", reflection: "Did I get quiet today, even for a minute?" },
    { number: 12, title: "Service", description: "Having had a spiritual awakening as the result of these steps, we tried to carry this message and to practice these principles in all our affairs.", reflection: "Who can I be useful to today? Nothing fancy." }
  ],

  traditions: [
    { number: 1, title: "Unity", text: "Our common welfare should come first. Personal recovery depends upon group unity.", reflection: "Am I putting the group before my preferences?" },
    { number: 2, title: "Trusted Servants", text: "Our leaders are but trusted servants. They do not govern.", reflection: "Do I trust the group conscience, or do I just want my way?" },
    { number: 3, title: "Membership", text: "The only requirement for membership is a desire to stop.", reflection: "Am I the welcoming committee, or am I the judge?" },
    { number: 4, title: "Autonomy", text: "Each group should be autonomous except in matters affecting other groups or the fellowship as a whole.", reflection: "Where am I trying to run other people's recovery?" },
    { number: 5, title: "Purpose", text: "Each group has but one primary purpose. To carry its message to those who still suffer.", reflection: "Am I carrying the message, or just carrying opinions?" },
    { number: 6, title: "Non-Endorsement", text: "A group ought never endorse, finance, or lend its name to any related facility or outside enterprise.", reflection: "Where am I getting distracted from the main thing?" },
    { number: 7, title: "Self-Supporting", text: "Every group ought to be fully self-supporting, declining outside contributions.", reflection: "Am I pulling my own weight? Or leaning where I shouldn't?" },
    { number: 8, title: "Non-Professional", text: "Our fellowship should remain forever non-professional. But our service centers may employ special workers.", reflection: "Am I trying to sponsor or therapize? There's a line." },
    { number: 9, title: "Structure", text: "Our groups, as such, ought never be organized. But we may create service boards or committees directly responsible to those they serve.", reflection: "Am I serving, or am I managing?" },
    { number: 10, title: "No Opinion", text: "Our fellowship has no opinion on outside issues. Hence the name of the group ought never be drawn into public controversy.", reflection: "Can I keep my mouth shut when it's not my business?" },
    { number: 11, title: "Attraction", text: "Our public relations policy is based on attraction rather than promotion.", reflection: "Am I an advertisement for this, or a warning?" },
    { number: 12, title: "Anonymity", text: "Anonymity is the spiritual foundation of all our traditions, ever reminding us to place principles before personalities.", reflection: "Where is my ego in the way today?" }
  ],

  concepts: [
    { number: 1, text: "Final responsibility and ultimate authority for world services should always reside in the collective conscience of our whole fellowship.", reflection: "Can I trust the group instead of just my own head?" },
    { number: 2, text: "The General Service Conference is the active voice and effective conscience of our whole fellowship.", reflection: "Do I trust the slow process, or do I need it fast and my way?" },
    { number: 3, text: "To ensure effective leadership, we endow each element of the service structure with a traditional Right of Decision.", reflection: "Can I let someone else decide and live with it?" },
    { number: 4, text: "At all responsible levels, we maintain a traditional Right of Participation.", reflection: "Am I making room for the quieter voices?" },
    { number: 5, text: "A traditional Right of Appeal ought to prevail so minority opinion will be heard.", reflection: "When I disagree, can I listen first?" },
    { number: 6, text: "Chief initiative in world service matters should be exercised by the trustees.", reflection: "Am I showing up for the parts nobody sees?" },
    { number: 7, text: "The Charter and Bylaws are legal instruments, empowering the trustees to manage and conduct world service affairs.", reflection: "Do I respect the structures that keep this thing alive?" },
    { number: 8, text: "The trustees are the principal planners and administrators of overall policy and finance.", reflection: "Am I willing to do the boring parts of service?" },
    { number: 9, text: "Good service leadership at all levels is indispensable.", reflection: "What does good leadership look like in my life?" },
    { number: 10, text: "Every service responsibility should be matched by an equal service authority.", reflection: "Am I taking on things I can't actually carry?" },
    { number: 11, text: "The trustees should always have the best possible committees and service staff.", reflection: "Do I ask capable people for help, or try to do it alone?" },
    { number: 12, text: "The Conference shall observe the spirit of the Traditions, taking great care that it never becomes the seat of perilous wealth or power.", reflection: "Am I watching my own motives around power and money?" }
  ],

  getDailyQuote() {
    const today = new Date();
    const epoch = new Date(2024, 0, 1);
    const days = Math.floor((today - epoch) / 86400000);
    return this.pool[days % this.pool.length];
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
