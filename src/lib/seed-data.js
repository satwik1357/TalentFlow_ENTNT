import { db } from './db';

// Custom faker replacement using native JavaScript methods
const faker = {
  string: {
    uuid: () => crypto.randomUUID(),
  },
  helpers: {
    arrayElement: (arr) => arr[Math.floor(Math.random() * arr.length)],
    arrayElements: (arr, opts) => {
      const count = opts
        ? Math.floor(Math.random() * (opts.max - opts.min + 1)) + opts.min
        : Math.floor(Math.random() * arr.length) + 1;
      return Array.from({ length: count }, () =>
        arr[Math.floor(Math.random() * arr.length)]
      );
    },
  },
  date: {
    past: (opts) =>
      new Date(Date.now() - Math.random() * opts.years * 365 * 24 * 60 * 60 * 1000),
    between: (opts) =>
      new Date(
        new Date(opts.from).getTime() +
          Math.random() * (opts.to.getTime() - new Date(opts.from).getTime())
      ),
  },
  lorem: {
    paragraphs: (count) =>
      Array.from(
        { length: count },
        () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      ).join('\n\n'),
    sentence: () => 'Sample timeline event description.',
  },
  person: {
    firstName: () => [
      'Alex',
      'Sarah',
      'Michael',
      'Jessica',
      'David',
      'Emily',
      'James',
      'Maria',
      'Robert',
      'Jennifer',
      'William',
      'Linda',
      'Richard',
      'Patricia',
      'Thomas',
      'Elizabeth',
      'Christopher',
      'Margaret',
      'Daniel',
      'Susan',
      'Matthew',
      'Dorothy',
      'Anthony',
      'Lisa',
      'Mark',
      'Nancy',
      'Donald',
      'Karen',
      'Steven',
      'Betty',
      'Paul',
      'Helen',
      'Andrew',
      'Sandra',
      'Joshua',
      'Donna',
      'Kenneth',
      'Carol',
      'Kevin',
      'Ruth',
      'Brian',
      'Sharon',
      'George',
      'Michelle',
      'Edward',
      'Laura',
      'Ronald',
      'Sarah',
      'Timothy',
      'Kimberly',
    ][Math.floor(Math.random() * 50)],
    lastName: () => [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
      'Allen',
      'King',
      'Wright',
      'Scott',
      'Torres',
      'Nguyen',
      'Hill',
      'Flores',
      'Green',
      'Adams',
      'Nelson',
      'Baker',
      'Hall',
      'Rivera',
      'Campbell',
      'Mitchell',
      'Carter',
      'Roberts',
    ][Math.floor(Math.random() * 50)],
    fullName: () => `${faker.person.firstName()} ${faker.person.lastName()}`,
  },
  internet: {
    email: (opts) =>
      `${opts.firstName.toLowerCase()}.${opts.lastName.toLowerCase()}@example.com`,
  },
  phone: {
    number: () =>
      `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
  },
  number: {
    int: (opts) =>
      Math.floor(Math.random() * (opts.max - opts.min + 1)) + opts.min,
  },
};

// Constants
const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Success',
  'Finance',
];

const JOB_TITLES = [
  'Senior Frontend Engineer',
  'Backend Developer',
  'Full Stack Engineer',
  'Senior Software Engineer',
  'Staff Engineer',
  'Engineering Manager',
  'Product Manager',
  'Senior Product Manager',
  'Product Designer',
  'UX Designer',
  'UI Designer',
  'UX Researcher',
  'Marketing Manager',
  'Content Marketing Lead',
  'Growth Marketing Manager',
  'Sales Director',
  'Account Executive',
  'Sales Development Representative',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Data Scientist',
  'Data Engineer',
  'Machine Learning Engineer',
  'Customer Success Manager',
  'Technical Support Engineer',
  'Financial Analyst',
  'Recruiter',
  'People Operations Manager',
];

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const EVENT_DESCRIPTIONS = {
  stage_change: [
    'Moved to screening stage',
    'Progressed to technical interview',
    'Advanced to final round',
    'Received offer',
    'Successfully hired',
    'Application reviewed',
  ],
  note_added: [
    'Strong technical skills demonstrated',
    'Great cultural fit for the team',
    'Excellent communication during interview',
    'Needs follow-up on technical questions',
    'Recommended by @Sarah Johnson',
    'Discussed salary expectations',
  ],
  assessment_completed: [
    'Completed technical assessment',
    'Submitted coding challenge',
    'Finished behavioral assessment',
    'Completed take-home project',
  ],
};

/**
 * Creates a URL-friendly slug from a title.
 * @param {string} title - The title to convert.
 * @returns {string} The generated slug.
 */
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Generates mock job data.
 * @param {number} count - Number of jobs to generate.
 * @returns {Array} Array of job objects.
 */
export const generateJobs = (count) => {
  const jobs = [];
  const usedSlugs = new Set();

  for (let i = 0; i < count; i++) {
    const title = faker.helpers.arrayElement(JOB_TITLES);
    let slug = createSlug(title);

    // Ensure unique slug
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${createSlug(title)}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);

    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const seniority = faker.helpers.arrayElement([
      'Senior',
      'Mid-Level',
      'Junior',
      '',
    ]);
    const jobTitle = seniority ? `${seniority} ${title}` : title;

    jobs.push({
      id: i,
      title: jobTitle,
      slug,
      status: Math.random() > 0.25 ? 'active' : 'archived',
      tags: faker.helpers.arrayElements(
        [
          'Remote',
          'Hybrid',
          'On-site',
          'Full-time',
          'Contract',
          'Health Insurance',
          'Equity',
          '401k',
          'Flexible Hours',
        ],
        { min: 3, max: 5 }
      ),
      order: i,
      createdAt: faker.date.past({ years: 1 }),
      description: `We're looking for a talented ${jobTitle} to join our ${department} team. You'll work on cutting-edge projects, collaborate with cross-functional teams, and help shape the future of our products.\n\nKey Responsibilities:\n• Lead technical initiatives and mentor junior team members\n• Design and implement scalable solutions\n• Collaborate with product and design teams\n• Contribute to technical documentation and best practices\n\nQualifications:\n• 3+ years of relevant experience\n• Strong problem-solving skills\n• Excellent communication abilities\n• Experience with modern development practices`,
      department,
    });
  }

  return jobs;
};

/**
 * Generates mock candidate data.
 * @param {number} count - Number of candidates to generate.
 * @param {Array} jobs - Array of job objects.
 * @returns {Array} Array of candidate objects.
 */
export const generateCandidates = (count, jobs) => {
  const candidates = [];
  const activeJobs = jobs.filter((job) => job.status === 'active');

  // Ensure at least one candidate per active job
  activeJobs.forEach((job, idx) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    candidates.push({
      id: idx,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      stage: faker.helpers.arrayElement(STAGES),
      jobId: job.id,
      appliedAt: faker.date.past({ years: 1 }),
      phone: faker.phone.number(),
      resume: `https://example.com/resumes/${faker.string.uuid()}.pdf`,
    });
  });

  // Generate remaining candidates
  const startIdx = activeJobs.length;
  for (let i = startIdx; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const job = faker.helpers.arrayElement(activeJobs);
    candidates.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      stage: faker.helpers.arrayElement(STAGES),
      jobId: job.id,
      appliedAt: faker.date.past({ years: 1 }),
      phone: faker.phone.number(),
      resume: `https://example.com/resumes/${faker.string.uuid()}.pdf`,
    });
  }

  return candidates;
};

/**
 * Generates mock timeline events for candidates.
 * @param {Array} candidates - Array of candidate objects.
 * @returns {Array} Array of timeline event objects.
 */
export const generateTimeline = (candidates) => {
  const events = [];

  candidates.forEach((candidate) => {
    // Initial application event
    events.push({
      id: candidate.id,
      candidateId: candidate.id,
      type: 'stage_change',
      description: 'Applied to position',
      timestamp: candidate.appliedAt,
      userName: 'System',
    });

    // Random additional events
    const eventCount = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < eventCount; i++) {
      const type = faker.helpers.arrayElement([
        'stage_change',
        'note_added',
        'assessment_completed',
      ]);
      events.push({
        id: `${candidate.id}-${i}-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        candidateId: candidate.id,
        type,
        description: faker.helpers.arrayElement(EVENT_DESCRIPTIONS[type]),
        timestamp: faker.date.between({
          from: candidate.appliedAt,
          to: new Date(),
        }),
        userName: faker.person.fullName(),
      });
    }
  });

  // Sort events by timestamp
  return events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
};

/**
 * Generates 4 fixed mock assessments, each with exactly 10 questions.
 * @param {Array} jobs - Array of job objects.
 * @returns {Array} Array of assessment objects.
 */
export const generateAssessments = (jobs) => {
  const assessments = [];
  const selectedJobs = jobs.slice(0, 4); // Take the first 4 jobs

  selectedJobs.forEach((job, index) => {
    const questions = [
      // Single-choice questions (3)
      {
        id: faker.string.uuid(),
        type: 'single-choice',
        question: 'How many years of professional experience do you have?',
        required: true,
        options: ['0-2 years', '2-5 years', '5-10 years', '10+ years'],
      },
      {
        id: faker.string.uuid(),
        type: 'single-choice',
        question: 'Are you familiar with React?',
        required: true,
        options: ['Yes', 'No'],
      },
      {
        id: faker.string.uuid(),
        type: 'single-choice',
        question: 'What is your preferred work environment?',
        required: true,
        options: ['Remote', 'Hybrid', 'On-site'],
      },
      // Multi-choice questions (3)
      {
        id: faker.string.uuid(),
        type: 'multi-choice',
        question: 'Which technologies have you worked with?',
        required: true,
        options: ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'Go'],
      },
      {
        id: faker.string.uuid(),
        type: 'multi-choice',
        question: 'Select your preferred programming languages.',
        required: true,
        options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Ruby'],
      },
      {
        id: faker.string.uuid(),
        type: 'multi-choice',
        question: 'Which soft skills do you possess?',
        required: true,
        options: ['Communication', 'Teamwork', 'Problem-solving', 'Leadership', 'Creativity'],
      },
      // Long-text questions (2)
      {
        id: faker.string.uuid(),
        type: 'long-text',
        question: 'Describe a challenging project you worked on and how you overcame obstacles.',
        required: true,
        validation: { minLength: 100, maxLength: 1000 },
      },
      {
        id: faker.string.uuid(),
        type: 'long-text',
        question: 'Explain your approach to debugging complex issues.',
        required: true,
        validation: { minLength: 100, maxLength: 1000 },
      },
      // Short-text questions (2)
      {
        id: faker.string.uuid(),
        type: 'short-text',
        question: 'What are your salary expectations?',
        required: false,
        validation: { maxLength: 100 },
      },
      {
        id: faker.string.uuid(),
        type: 'short-text',
        question: 'Why do you want to work for this company?',
        required: true,
        validation: { maxLength: 200 },
      },
    ];

    assessments.push({
      id: job.id,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical and behavioral assessment for ${job.title}`,
      sections: [
        {
          id: faker.string.uuid(),
          title: 'Assessment Questions',
          description: 'Answer the following questions',
          questions: questions,
        },
      ],
      createdAt: job.createdAt,
      updatedAt: new Date().toISOString(),
    });
  });

  return assessments;
};

/**
 * Clears all data from the database.
 * @returns {boolean} True if successful, false otherwise.
 */
const clearDatabase = async () => {
  try {
    await db.transaction(
      'rw',
      [db.jobs, db.candidates, db.timeline, db.assessments, db.responses],
      async () => {
        await Promise.all([
          db.jobs.clear(),
          db.candidates.clear(),
          db.timeline.clear(),
          db.assessments.clear(),
          db.responses.clear(),
        ]);
      }
    );
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    return false;
  }
};

/**
 * Adds items to a database table with retry logic.
 * @param {Object} table - The Dexie table object.
 * @param {Array} items - Array of items to add.
 * @param {number} retries - Number of retries for bulk add.
 * @returns {Object} Result object with success and count.
 */
const addItemsWithRetry = async (table, items, retries = 3) => {
  try {
    // First try bulk add
    await table.bulkAdd(items);
    return { success: true, count: items.length };
  } catch (error) {
    if (error.name === 'BulkError' && retries > 0) {
      console.warn('Bulk add failed, trying individual adds...');
      // If bulk add fails, try adding items one by one
      let successCount = 0;
      for (const item of items) {
        try {
          await table.add(item);
          successCount++;
        } catch (e) {
          // Skip duplicate errors
          if (e.name !== 'ConstraintError') {
            console.warn('Error adding item:', e);
          }
        }
      }
      return { success: successCount > 0, count: successCount };
    }
    throw error;
  }
};

/**
 * Seeds the database with mock data.
 * @param {boolean} forceClear - Whether to clear existing data first.
 * @returns {boolean} True if successful, false otherwise.
 */
export const seedDatabase = async (forceClear = false) => {
  console.log('Starting database seed...');

  try {
    // Clear existing data if forced
    if (forceClear) {
      console.log('Clearing existing data...');
      const cleared = await clearDatabase();
      if (!cleared) {
        console.warn('Failed to clear database, continuing with existing data');
      }
    }

    // Generate data
    const jobs = generateJobs(25);
    const candidates = generateCandidates(1000, jobs); // Reduced count for better performance
    const timeline = generateTimeline(candidates);
    const assessments = generateAssessments(jobs);

    // Seed database with transaction
    await db.transaction(
      'rw',
      [db.jobs, db.candidates, db.timeline, db.assessments],
      async () => {
        // Add jobs first since other entities depend on them
        const jobsResult = await addItemsWithRetry(db.jobs, jobs);
        console.log(`Added ${jobsResult.count} jobs`);

        // Then candidates
        const candidatesResult = await addItemsWithRetry(db.candidates, candidates);
        console.log(`Added ${candidatesResult.count} candidates`);

        // Then timeline events
        const timelineResult = await addItemsWithRetry(db.timeline, timeline);
        console.log(`Added ${timelineResult.count} timeline events`);

        // Finally assessments
        const assessmentsResult = await addItemsWithRetry(
          db.assessments,
          assessments
        );
        console.log(`Added ${assessmentsResult.count} assessments`);
      }
    );

    console.log('Database seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};
