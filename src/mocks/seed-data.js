import { faker } from '@faker-js/faker';
import { db } from '@/lib/db';

const JOB_TITLES = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UX/UI Designer',
  'Data Scientist',
  'QA Engineer',
  'Technical Writer',
  'Engineering Manager',
  'Machine Learning Engineer',
  'Cloud Solutions Architect',
  'Mobile App Developer',
  'Cybersecurity Analyst',
  'Database Administrator',
  'AI Research Scientist',
  'Blockchain Developer',
  'Site Reliability Engineer',
  'Systems Architect',
  'Software Test Engineer',
  'Network Engineer',
  'Business Analyst',
  'IT Project Manager',
  'Game Developer',
  'Embedded Systems Engineer'

];

const SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes',
  'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Terraform', 'Go',
  'Java', 'Spring Boot', 'Kotlin', 'Swift', 'Flutter', 'Dart', 'Rust'
];

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateJob() {
  const title = faker.helpers.arrayElement(JOB_TITLES);
  return {
    id: faker.string.uuid(),
    title,
    slug: faker.helpers.slugify(title).toLowerCase(),
    status: faker.helpers.arrayElement(['active', 'archived']),
    description: faker.lorem.paragraphs(3),
    requirements: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, 
      () => faker.lorem.sentence()
    ),
    tags: faker.helpers.arrayElements(
      ['remote', 'full-time', 'senior', 'frontend', 'backend', 'fullstack'],
      { min: 1, max: 4 }
    ),
    order: faker.number.int(1000),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

function generateCandidate(jobId) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: faker.string.uuid(),
    jobId,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }),
    phone: faker.phone.number(),
    currentRole: faker.person.jobTitle(),
    experience: faker.number.int({ min: 0, max: 20 }),
    skills: faker.helpers.arrayElements(SKILLS, { min: 3, max: 8 }),
    stage: faker.helpers.arrayElement(STAGES),
    appliedDate: faker.date.past().toISOString(),
    avatar: faker.image.avatar(),
    resumeUrl: faker.internet.url(),
    notes: faker.lorem.paragraph(),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.5 }),
    status: faker.helpers.arrayElement(['new', 'in_review', 'contacted', 'interviewed', 'hired', 'rejected']),
    location: faker.location.city() + ', ' + faker.location.country(),
    salaryExpectation: faker.finance.amount(50000, 200000, 0, '$'),
    noticePeriod: faker.helpers.arrayElement(['Immediately', '1 month', '2 months', '3 months', 'More than 3 months']),
    source: faker.helpers.arrayElement(['LinkedIn', 'Indeed', 'Company Website', 'Referral', 'Job Board', 'Other']),
    linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    githubUrl: `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}`,

    portfolioUrl: faker.internet.url(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

function generateTimelineEntry(candidateId) {
  const events = [
    { type: 'applied', title: 'Application Submitted' },
    { type: 'screen', title: 'Screening Call' },
    { type: 'tech', title: 'Technical Interview' },
    { type: 'offer', title: 'Offer Extended' },
    { type: 'hired', title: 'Hired' },
    { type: 'rejected', title: 'Rejected' },
    { type: 'note', title: 'Note Added' },
    { type: 'email', title: 'Email Sent' },
    { type: 'call', title: 'Phone Call' },
    { type: 'interview', title: 'Interview Scheduled' }
  ];
  
  const event = faker.helpers.arrayElement(events);
  
  return {
    id: faker.string.uuid(),
    candidateId,
    type: event.type,
    title: event.title,
    description: faker.lorem.sentence(),
    timestamp: faker.date.recent().toISOString(),
    metadata: {}
  };
}

function generateAssessment(jobId) {
  const questionTypes = ['text', 'multiple_choice', 'code', 'boolean'];
  
  return {
    id: faker.string.uuid(),
    jobId,
    title: `${faker.hacker.adjective()} ${faker.hacker.noun()} Assessment`,
    description: faker.lorem.paragraph(),
    timeLimit: faker.number.int({ min: 30, max: 120 }), // minutes
    passingScore: faker.number.int({ min: 60, max: 80 }),
    questions: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, (_, i) => ({
      id: faker.string.uuid(),
      order: i + 1,
      type: faker.helpers.arrayElement(questionTypes),
      question: faker.lorem.sentence().replace(/\.$/, '?'),
      description: faker.lorem.sentence(),
      required: faker.datatype.boolean(),
      options: faker.datatype.boolean() ? 
        Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
          id: faker.string.uuid(),
          text: faker.lorem.words(3),
          isCorrect: faker.datatype.boolean()
        })) : [],
      maxLength: faker.datatype.boolean() ? faker.number.int({ min: 100, max: 1000 }) : null
    })),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

export async function seedDatabase() {
  // Clear existing data
  await Promise.all([
    db.jobs.clear(),
    db.candidates.clear(),
    db.timeline.clear(),
    db.assessments.clear(),
    db.responses.clear()
  ]);

  // Generate jobs
  const jobs = Array.from({ length: 25 }, () => generateJob());
  await db.jobs.bulkAdd(jobs);

  // For each job, generate candidates
  // Generate exactly 1000 candidates, distributed across all jobs
  let candidates = [];
  const candidatesPerJob = Math.floor(1000 / jobs.length);
  let extra = 1000 % jobs.length;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const num = candidatesPerJob + (i < extra ? 1 : 0);
    const jobCandidates = Array.from({ length: num }, () => generateCandidate(job.id));
    candidates = candidates.concat(jobCandidates);

    // For each candidate, generate timeline entries
    for (const candidate of jobCandidates) {
      const entryCount = faker.number.int({ min: 1, max: 5 });
      const entries = Array.from({ length: entryCount }, () => 
        generateTimelineEntry(candidate.id)
      );
      await db.timeline.bulkAdd(entries);
    }

    // For some jobs, generate assessments
    if (faker.datatype.boolean(0.7)) {
      const assessment = generateAssessment(job.id);
      await db.assessments.add(assessment);
    }
  }
await db.candidates.bulkAdd(candidates);


  console.log('Database seeded successfully!');
  return {
    jobs: await db.jobs.count(),
    candidates: await db.candidates.count(),
    timeline: await db.timeline.count(),
    assessments: await db.assessments.count()
  };
}
