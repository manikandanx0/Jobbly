export const internships = [
  { 
    id: 'i1', 
    title: 'Frontend Intern', 
    company: 'Acme', 
    location: 'Remote', 
    skills: ['React','Tailwind'], 
    postedAt: '2025-09-01', 
    description: 'Work on UI components and Tailwind styling for our dashboard.',
    recruiter: { name: 'Sarah Johnson', username: 'sarahj', company: 'Acme Corp', title: 'Frontend Lead' }
  },
  { 
    id: 'i2', 
    title: 'Backend Intern', 
    company: 'Globex', 
    location: 'Chennai', 
    skills: ['Node','MongoDB'], 
    postedAt: '2025-08-26', 
    description: 'Assist in building APIs and optimizing database queries.',
    recruiter: { name: 'Raj Patel', username: 'rajp', company: 'Globex Technologies', title: 'Backend Manager' }
  },
  { 
    id: 'i3', 
    title: 'Data Intern', 
    company: 'Initech', 
    location: 'Remote', 
    skills: ['Python','NLP'], 
    postedAt: '2025-09-10', 
    description: 'Analyze datasets and help prototype NLP models.',
    recruiter: { name: 'Dr. Emily Chen', username: 'emilyc', company: 'Initech Labs', title: 'Data Science Director' }
  }
];

export const freelancers = [
  { id: 'f1', title: 'Electrician', location: 'Chennai', pay: '₹600/day', worker: { name:'Ravi', skill:'Electrician', location:'Chennai' }, rating: { score: 4.7, reviews: 210 } },
  { id: 'f2', title: 'Plumber', location: 'Bangalore', pay: '₹700/day', worker: { name:'Arjun', skill:'Plumber', location:'Bangalore' }, rating: { score: 4.4, reviews: 90 } }
];

export const progress = { current: 'Applied', timeline: [
  { date: '2025-08-01', stage: 'Applied' },
  { date: '2025-08-05', stage: 'Interview' }
]};
