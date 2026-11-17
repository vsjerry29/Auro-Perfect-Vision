import { Offering, Therapist, RecurringScheduleDay, LeaveException, IntakeTemplate, Booking, BlogPost } from "../types";

export const INITIAL_OFFERINGS: Offering[] = [
  {
    id: "off-1",
    slug: "eye-yoga",
    title: "Eye Yoga for Children & Adults",
    category: "eye-yoga",
    shortDescription: "Gentle ocular muscular movement, conscious breathwork, and palming techniques designed to ease habitual strain and restore natural visual flexibility.",
    fullDescription: "Eye Yoga combines classical Bates relaxation principles with gentle yogic ocular exercises. Sessions focus on activating neglected eye muscle groups, releasing habitual tension patterns from prolonged close-up reading, and fostering effortless blinking habits. Suitable for both children adapting to screen-heavy schooling and adults seeking visual serenity.",
    durationMinutes: 60,
    format: "individual",
    delivery: "onsite",
    price: { inr: 2000, usd: 40, taxInclusive: true },
    assignedTherapistIds: ["therapist-1", "therapist-2"],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: true,
    suitableFor: [
      "Frequent smartphone & digital device users",
      "Children and students with early visual fatigue",
      "Anyone seeking mindful, non-invasive eye wellness",
      "Individuals experiencing end-of-day eye strain"
    ],
    whatToExpect: [
      "Initial assessment of current reading habits and ocular comfort",
      "Guided somatic eye movements (directional tracking, smooth convergence)",
      "Deep warmth palming and solarization relaxation practice",
      "Take-home daily mindfulness exercises for eye relief"
    ],
    imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "off-2",
    slug: "vision-stress-relief",
    title: "Vision Stress Relief Therapy",
    category: "stress-relief",
    shortDescription: "Integrative tension-release for the neck, temples, and ocular zone to dissolve computer vision fatigue and mental strain.",
    fullDescription: "In our screen-dominated lives, eye strain rarely stops at the eyeballs. It cascades into the suboccipital neck muscles, temples, and jaw. This specialized therapy combines acupressure, hot/cold hydrotherapy pads, and deep cranial calming routines to soothe the nervous system and refresh fatigued eyes.",
    durationMinutes: 75,
    format: "individual",
    delivery: "onsite",
    price: { inr: 2500, usd: 50, taxInclusive: true },
    assignedTherapistIds: ["therapist-1"],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: true,
    suitableFor: [
      "Professionals experiencing computer vision syndrome (CVS)",
      "Tension headaches and neck stiffness linked to intense screen time",
      "Mental overwhelm and visual exhaustion"
    ],
    whatToExpect: [
      "Gentle acupressure around orbital borders and temple trigger points",
      "Warm compress herbal relaxation",
      "Deep parasympathetic breathing guidance",
      "Refreshed mental clarity and visual lightness"
    ],
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "off-3",
    slug: "customized-vision-therapy",
    title: "Customized Vision Therapy (Online / On-site)",
    category: "specialized-therapy",
    shortDescription: "Personalized step-by-step guidance addressing specific visual patterns, binocular coordination, and accommodative ease.",
    fullDescription: "A bespoke 1-on-1 therapeutic consultation that designs a personalized regimen of eye exercises, shifting techniques, and environmental adjustments tailored to your lifestyle, visual demands, and personal wellness goals.",
    durationMinutes: 60,
    format: "individual",
    delivery: "hybrid",
    price: { inr: 3000, usd: 60, taxInclusive: true },
    assignedTherapistIds: ["therapist-1", "therapist-2"],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: true,
    suitableFor: [
      "Clients seeking a structured individualised roadmap",
      "Individuals wanting remote online guidance from anywhere in the world",
      "Those experiencing tracking difficulties or subtle depth fatigue"
    ],
    whatToExpect: [
      "Comprehensive review of daily visual ergonomics and history",
      "Targeted accommodation and vergence coordination routines",
      "Customised weekly exercise charts and digital wellness protocols"
    ],
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "off-4",
    slug: "visual-skill-enhancement",
    title: "Visual Skill Enhancement & Eye Relaxation",
    category: "vision-skills",
    shortDescription: "Fine-tune visual memory, peripheral awareness, rapid saccadic focus, and deep resting techniques.",
    fullDescription: "Explore the untapped agility of your visual system. Through interactive visual charts, Brock strings, peripheral awareness targets, and contrast stimulation, this therapy refines how swiftly and effortlessly your brain interprets visual data without muscular clenching.",
    durationMinutes: 60,
    format: "individual",
    delivery: "onsite",
    price: { inr: 2200, usd: 45, taxInclusive: true },
    assignedTherapistIds: ["therapist-2"],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: false,
    suitableFor: [
      "Artists, designers, and craftspeople requiring sustained visual sharpness",
      "Readers wanting to reduce eye fatigue while studying",
      "Anyone desiring improved depth perception and spatial comfort"
    ],
    whatToExpect: [
      "Peripheral expansion drills and dynamic gaze shifting",
      "Saccadic rhythm training with optical targets",
      "Integrated resting methods to prevent fatigue build-up"
    ],
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "off-5",
    slug: "dry-eye-red-light-therapy",
    title: "Dry Eye & Red Light Photobiomodulation",
    category: "specialized-therapy",
    shortDescription: "Non-invasive low-level red light exposure and eyelid thermal care to support ocular comfort and tear film quality.",
    fullDescription: "Integrates certified therapeutic red light (670nm photobiomodulation) with meibomian gland thermal therapy and gentle eyelid hygiene guidance. Designed to soothe dry, gritty, irritated eyes exacerbated by air-conditioned offices and continuous monitor glare.",
    durationMinutes: 45,
    format: "individual",
    delivery: "onsite",
    price: { inr: 2800, usd: 55, taxInclusive: true },
    assignedTherapistIds: ["therapist-1"],
    maxCapacity: 1,
    isFlagshipProgramme: false,
    featured: true,
    suitableFor: [
      "Chronic screen users with dry, gritty, or watering eyes",
      "Contact lens wearers experiencing end-of-day dryness",
      "People sensitive to dry air and screen glare"
    ],
    whatToExpect: [
      "Soothing thermal compress therapy for meibomian glands",
      "Safe, calibrated low-level red light session in relaxed posture",
      "Personalized natural tear conservation guidance"
    ],
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "off-6",
    slug: "retreat-holistic-vision-awakening",
    title: "Flagship 7-Day Holistic Vision Awakening Retreat",
    category: "programmes",
    shortDescription: "An immersive week in Auroville combining daily eye yoga, nature walks, nutritional guidance, and meditation.",
    fullDescription: "Our signature multi-session residential retreat held amidst the peaceful forests of Auroville. Over seven days, participants immerse themselves in daily eye yoga, mindful movement, suboccipital release, sunning routines, silent visual contemplation, and organic nutritional eye-care.",
    durationMinutes: 180,
    format: "group",
    delivery: "onsite",
    price: { inr: 18000, usd: 350, taxInclusive: true },
    assignedTherapistIds: ["therapist-1", "therapist-2"],
    maxCapacity: 12,
    isFlagshipProgramme: true,
    featured: true,
    suitableFor: [
      "Individuals wanting a deep, transformative visual reset away from screens",
      "Seekers of holistic wellness immersed in the Auroville environment",
      "Those looking to build sustainable lifelong eye-care rituals"
    ],
    whatToExpect: [
      "7 consecutive morning and evening guided group sessions",
      "One-on-one personal visual assessment & bespoke home regimen",
      "Dedicated eye nutrition workshops and organic herbal teas",
      "Access to tranquil Auroville nature walking paths"
    ],
    programmeSyllabus: [
      { stepNumber: 1, title: "Day 1-2: Awareness & De-Stressing", description: "Unlearning ocular tension habits, introduction to palming, and natural light adaptation." },
      { stepNumber: 2, title: "Day 3-4: Muscle Flexibility & Coordination", description: "Ocular motor drills, peripheral awareness expansion, and suboccipital body release." },
      { stepNumber: 3, title: "Day 5-6: Accommodation & Integration", description: "Dynamic shifting drills, eye-brain integration, and herbal nutritional guidance." },
      { stepNumber: 4, title: "Day 7: Lifelong Vision Rituals", description: "Personalised daily practice chart handover and closing circle." }
    ],
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  }
];

export const INITIAL_THERAPISTS: Therapist[] = [
  {
    id: "therapist-1",
    slug: "dr-ananya-sen",
    displayName: "Dr. Ananya Sen",
    roleTitle: "Senior Vision Wellness Practitioner",
    bio: "With over 14 years devoted to holistic eye health and natural vision therapy, Dr. Sen combines classical Bates methodology with modern ocular photobiomodulation. She has guided hundreds of residents and international guests toward eye comfort and mindful screen habits in Auroville.",
    specialties: ["Eye Yoga", "Vision Stress Relief", "Dry Eye Photobiomodulation", "Children's Vision"],
    qualifications: "B.Optom, Holistic Vision Therapy Specialist (Auroville)",
    photoUrl: "https://images.unsplash.com/photo-1594824813583-8a07f7b243b6?auto=format&fit=crop&w=800&q=80",
    assignedOfferingIds: ["off-1", "off-2", "off-3", "off-5", "off-6"],
    email: "ananya@auroperfectvision.demo",
    phone: "+91 98765 43210",
    isPublished: true,
  },
  {
    id: "therapist-2",
    slug: "rajesh-kannan",
    displayName: "Rajesh Kannan",
    roleTitle: "Visual Ergonomics & Eye Yoga Guide",
    bio: "Rajesh brings deep expertise in ocular motor integration, peripheral visual field training, and digital ergonomics. His calm, mindful approach helps clients release chronic cranial strain and cultivate relaxed, effortless clarity.",
    specialties: ["Visual Skill Enhancement", "Customized Vision Therapy", "Digital Ergonomics", "Eye Yoga"],
    qualifications: "Certified Natural Vision Educator, M.Sc Applied Psychology",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80",
    assignedOfferingIds: ["off-1", "off-3", "off-4", "off-6"],
    email: "rajesh@auroperfectvision.demo",
    phone: "+91 98765 43211",
    isPublished: true,
  }
];

export const DEFAULT_WEEKLY_SCHEDULE: RecurringScheduleDay[] = [
  {
    dayOfWeek: 1, // Monday
    dayName: "Monday",
    active: true,
    slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:30", endTime: "17:30" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 2, // Tuesday
    dayName: "Tuesday",
    active: true,
    slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:30", endTime: "17:30" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 3, // Wednesday
    dayName: "Wednesday",
    active: true,
    slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:30", endTime: "17:30" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 4, // Thursday
    dayName: "Thursday",
    active: true,
    slots: [{ startTime: "09:00", endTime: "13:00" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 5, // Friday
    dayName: "Friday",
    active: true,
    slots: [{ startTime: "09:00", endTime: "13:00" }, { startTime: "14:30", endTime: "17:30" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 6, // Saturday
    dayName: "Saturday",
    active: true,
    slots: [{ startTime: "09:30", endTime: "13:30" }],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  },
  {
    dayOfWeek: 0, // Sunday
    dayName: "Sunday",
    active: false,
    slots: [],
    slotDurationMinutes: 60,
    bufferMinutes: 15,
  }
];

export const INITIAL_LEAVE_EXCEPTIONS: LeaveException[] = [
  {
    id: "leave-1",
    therapistId: "therapist-1",
    date: "2026-11-25",
    reason: "Auroville Community Wellness Conference",
    allDay: true,
  },
  {
    id: "leave-2",
    therapistId: "therapist-2",
    date: "2026-12-04",
    reason: "Personal Leave",
    allDay: true,
  }
];

export const INITIAL_INTAKE_TEMPLATES: IntakeTemplate[] = [
  {
    id: "template-1",
    offeringId: "off-1",
    version: 1,
    isPublished: true,
    fields: [
      {
        id: "f-1",
        fieldKey: "client_age",
        label: "Age of Participant",
        fieldType: "number",
        placeholder: "e.g. 34",
        helpText: "Helps tailor the motor exercises for children vs adults",
        isRequired: true,
        displayOrder: 1,
      },
      {
        id: "f-2",
        fieldKey: "primary_eye_concern",
        label: "Primary Vision Concern or Reason for Session",
        fieldType: "select",
        options: [
          "Screen Strain & Heavy Ocular Fatigue",
          "Dry, Gritty or Burning Eyes",
          "Myopia / Distance Blur Habits",
          "Frequent Tension Headaches",
          "Preventative Ocular Wellness & Relaxation",
          "Other"
        ],
        isRequired: true,
        displayOrder: 2,
      },
      {
        id: "f-3",
        fieldKey: "daily_screen_hours",
        label: "Approximate Daily Screen Time (Hours)",
        fieldType: "select",
        options: ["Less than 3 hours", "3 to 6 hours", "7 to 10 hours", "10+ hours"],
        isRequired: true,
        displayOrder: 3,
      },
      {
        id: "f-4",
        fieldKey: "medical_history_notes",
        label: "Past Eye Surgeries, Conditions, or Important Notes",
        fieldType: "textarea",
        placeholder: "e.g. LASIK in 2021, wear soft contact lenses, slight astigmatism",
        helpText: "Shared confidentially with your assigned practitioner only",
        isRequired: false,
        displayOrder: 4,
        onlyVisibleToTherapist: true,
      },
      {
        id: "f-5",
        fieldKey: "referral_source",
        label: "How did you hear about Auro Perfect Vision?",
        fieldType: "radio",
        options: ["Auroville Directory / Community", "Friend or Family Recommendation", "Web Search", "Social Media"],
        isRequired: false,
        displayOrder: 5,
      }
    ]
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b-1",
    bookingReference: "APV-2026-N7K2P",
    offeringId: "off-1",
    offeringTitle: "Eye Yoga for Children & Adults",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    date: "2026-11-20",
    timeSlot: "10:00 AM - 11:00 AM",
    clientTimezone: "Asia/Kolkata",
    clientName: "Meera Krishnan",
    clientEmail: "meera.krishnan@example.com",
    clientPhone: "+91 94432 11223",
    seatsBooked: 1,
    currency: "INR",
    totalAmount: 2000,
    status: "confirmed",
    paymentMethod: "online_razorpay",
    paymentStatus: "captured",
    intakeAnswers: {
      client_age: "32",
      primary_eye_concern: "Screen Strain & Heavy Ocular Fatigue",
      daily_screen_hours: "7 to 10 hours",
      medical_history_notes: "Works as a software developer, severe evening dryness",
      referral_source: "Auroville Directory / Community"
    },
    invoiceIssued: true,
    invoiceNumber: "APV-2026-0001",
    createdAt: "2026-11-16T14:30:00Z"
  },
  {
    id: "b-2",
    bookingReference: "APV-2026-W3R9L",
    offeringId: "off-2",
    offeringTitle: "Vision Stress Relief Therapy",
    therapistId: "therapist-1",
    therapistName: "Dr. Ananya Sen",
    date: "2026-11-22",
    timeSlot: "11:30 AM - 12:45 PM",
    clientTimezone: "Asia/Kolkata",
    clientName: "David Moreau",
    clientEmail: "david.moreau@example.fr",
    clientPhone: "+33 6 12 34 56 78",
    seatsBooked: 1,
    currency: "USD",
    totalAmount: 50,
    status: "pending_offline_confirmation",
    paymentMethod: "offline_cash",
    paymentStatus: "pending",
    intakeAnswers: {
      client_age: "45",
      primary_eye_concern: "Frequent Tension Headaches",
      daily_screen_hours: "10+ hours",
      medical_history_notes: "Suboccipital neck tension following long flight",
      referral_source: "Friend or Family Recommendation"
    },
    invoiceIssued: false,
    createdAt: "2026-11-17T09:15:00Z"
  },
  {
    id: "b-3",
    bookingReference: "APV-2026-T5Y8M",
    offeringId: "off-3",
    offeringTitle: "Customized Vision Therapy (Online)",
    therapistId: "therapist-2",
    therapistName: "Rajesh Kannan",
    date: "2026-11-24",
    timeSlot: "03:00 PM - 04:00 PM",
    clientTimezone: "Europe/London",
    clientName: "Sophie Jenkins",
    clientEmail: "sophie.j@example.co.uk",
    clientPhone: "+44 7700 900123",
    seatsBooked: 1,
    currency: "USD",
    totalAmount: 60,
    status: "confirmed",
    paymentMethod: "online_paypal",
    paymentStatus: "captured",
    intakeAnswers: {
      client_age: "29",
      primary_eye_concern: "Preventative Ocular Wellness & Relaxation",
      daily_screen_hours: "7 to 10 hours",
      medical_history_notes: "None",
      referral_source: "Web Search"
    },
    invoiceIssued: true,
    invoiceNumber: "APV-2026-0002",
    createdAt: "2026-11-17T11:45:00Z"
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "understanding-digital-eye-strain-and-recovery",
    title: "Understanding Digital Eye Strain: Why Your Eyes Need More Than Blue Light Glasses",
    excerpt: "True visual relaxation comes not from passive filters, but from restoring natural blinking reflexes, dynamic distance shifting, and conscious palming.",
    content: `When we look at screens, our natural blink rate drops by more than 60%. The eye's ciliary muscle remains contracted in a fixed near-point lock for hours at a time, resulting in suboccipital stiffness, dry ocular surfaces, and end-of-day blur.\n\n### The Illusion of Passive Protection\nMany rely exclusively on blue light blocking spectacles, hoping a tinted lens will negate eight hours of static muscular fixation. While high-energy visible light management has its place, the core root of digital fatigue is physical: muscular stagnation.\n\n### Restoring the Natural Blink\nA natural blink spreads the precorneal tear film evenly across the cornea. During screen sessions, practice conscious complete blinks every 20 minutes.\n\n### The Power of Palming\nPalming is one of the most effective non-invasive ways to relax the optic nerve and orbital musculature. Cup warm hands over closed eyes without pressing the eyeballs. Breathe deeply into the abdomen and allow complete darkness to soothe retinal photoreceptors.`,
    category: "Ocular Wellness",
    readTime: "4 min read",
    publishedDate: "November 14, 2026",
    authorName: "Dr. Ananya Sen",
    coverImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "blog-2",
    slug: "gentle-art-of-palming-and-sunning",
    title: "The Gentle Art of Palming & Sunning: Classical Techniques for Modern Vision",
    excerpt: "Explore the profound parasympathetic benefits of natural daylight exposure combined with deep ocular warmth.",
    content: `For decades, vision educators across Auroville have shared simple, grounding practices that realign the visual system with the rhythms of nature. Sunning and palming are two pillars of this mindful approach.\n\n### Sunning: Awakening Retinal Light Sensitivity\nSunning involves closing your eyes and gently rotating your head from shoulder to shoulder facing the morning sun. The gentle warmth passes through the eyelids, encouraging relaxed pupil dilation and contraction without any glare or direct optical strain.\n\n### Transition to Palming\nDirectly following sunning, step into the shade and cup your palms over your eyes. The contrast between warm golden light and deep velvety darkness provides profound neurological relief to fatigued eyes.`,
    category: "Eye Yoga & Practices",
    readTime: "5 min read",
    publishedDate: "November 08, 2026",
    authorName: "Rajesh Kannan",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  },
  {
    id: "blog-3",
    slug: "nutrition-for-the-retina-and-tear-film",
    title: "Nourishing Your Sight: Holistic Nutrition for the Retina and Tear Film",
    excerpt: "A guide to clean, anti-inflammatory dietary habits that support macular pigment density and prevent tear evaporation.",
    content: `The eye is one of the highest metabolic consumers of oxygen in the human body. Providing it with rich antioxidant defense is essential for lifelong visual vitality.\n\n### Lutein and Zeaxanthin: The Internal Sunglasses\nThese two carotenoids concentrate specifically in the macula, filtering harmful blue wavelengths and neutralizing free radicals. Dark leafy greens like moringa, spinach, and kale are rich organic sources.\n\n### Healthy Fats for Tear Stability\nThe outermost layer of your tear film is lipid-based. Omega-3 fatty acids, cold-pressed flaxseed oil, and walnuts support the meibomian glands, preventing tears from evaporating prematurely in air-conditioned spaces.`,
    category: "Holistic Nutrition",
    readTime: "6 min read",
    publishedDate: "October 29, 2026",
    authorName: "Dr. Ananya Sen",
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80",
    isPublished: true,
  }
];
