export const dataStore = {
  internships: [
    { id: 'i1', title: 'Frontend Intern', company: 'Acme', location: 'Remote', skills: ['React','Tailwind'], postedAt: '2025-09-01', description: 'Work on UI components and Tailwind styling for our dashboard.' },
    { id: 'i2', title: 'Backend Intern', company: 'Globex', location: 'Chennai', skills: ['Node','MongoDB'], postedAt: '2025-08-26', description: 'Assist in building APIs and optimizing database queries.' },
    { id: 'i3', title: 'Data Intern', company: 'Initech', location: 'Remote', skills: ['Python','NLP'], postedAt: '2025-09-10', description: 'Analyze datasets and help prototype NLP models.' }
  ],
  freelancers: [
    { id: 'f1', title: 'Electrician', location: 'Chennai', pay: '₹600/day', worker: { name:'Ravi', skill:'Electrician', location:'Chennai' }, rating: { score: 4.7, reviews: 210 } },
    { id: 'f2', title: 'Plumber', location: 'Bangalore', pay: '₹700/day', worker: { name:'Arjun', skill:'Plumber', location:'Bangalore' }, rating: { score: 4.4, reviews: 90 } }
  ],
  applications: [],
  recruiter: { verified: false },
  bookmarks: []
};

export function addInternship(item) {
  const id = 'i' + (dataStore.internships.length + 1);
  const postedAt = item.postedAt || new Date().toISOString().slice(0,10);
  const normalized = { id, ...item, postedAt };
  dataStore.internships.unshift(normalized);
  return normalized;
}

export function listInternships(){
  return dataStore.internships;
}

export function addApplication({ internshipId, applicant }){
  const exists = dataStore.applications.find(a => a.internshipId === internshipId && a.applicant?.email === applicant?.email);
  if (exists) return exists;
  const rec = { id: 'a' + (dataStore.applications.length + 1), internshipId, applicant, at: Date.now() };
  dataStore.applications.unshift(rec);
  return rec;
}

export function listApplications(){ return dataStore.applications; }

export function setRecruiterVerified(v){ dataStore.recruiter.verified = !!v; return dataStore.recruiter; }
export function getRecruiter(){ return dataStore.recruiter; }

export function toggleBookmark(internshipId){
  const idx = dataStore.bookmarks.indexOf(internshipId);
  if (idx === -1) { dataStore.bookmarks.push(internshipId); return true; }
  dataStore.bookmarks.splice(idx,1); return false;
}
export function listBookmarks(){ return dataStore.bookmarks; }
