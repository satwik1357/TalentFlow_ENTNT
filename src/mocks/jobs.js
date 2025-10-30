export const MOCK_JOBS = [
  {
    id: 'job_1001',
    title: 'Senior Frontend Developer',
    slug: 'senior-frontend-developer',
    status: 'active',
    department: 'Engineering',
    tags: ['React', 'TypeScript', 'Frontend'],
    order: 1,
    createdAt: '2023-05-15T09:00:00Z',
    description: 'We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building user interfaces and implementing features using React and TypeScript.'
  },
  {
    id: 'job_1002',
    title: 'Product Manager',
    slug: 'product-manager',
    status: 'active',
    department: 'Product',
    tags: ['Product Management', 'Agile', 'Roadmapping'],
    order: 2,
    createdAt: '2023-06-20T10:30:00Z',
    description: 'We are seeking a Product Manager to lead our product development efforts. You will work closely with engineering, design, and business teams to deliver exceptional products.'
  },
  {
    id: 'job_1003',
    title: 'DevOps Engineer',
    slug: 'devops-engineer',
    status: 'active',
    department: 'Engineering',
    tags: ['AWS', 'Kubernetes', 'CI/CD'],
    order: 3,
    createdAt: '2023-07-10T11:15:00Z',
    description: 'Join our DevOps team to build and maintain our cloud infrastructure. You will work on CI/CD pipelines, monitoring, and infrastructure'
  },
  {
    id: 'job_1004',
    title: 'UX Designer',
    slug: 'ux-designer',
    status: 'active',
    department: 'Design',
    tags: ['UI/UX', 'Figma', 'User Research'],
    order: 4,
    createdAt: '2023-08-05T14:20:00Z',
    description: 'We are looking for a talented UX Designer to create amazing user experiences. You will be responsible for designing intuitive and engaging user interfaces.'
  },
  {
    id: 'job_1005',
    title: 'Backend Developer',
    slug: 'backend-developer',
    status: 'active',
    department: 'Engineering',
    tags: ['Node.js', 'Python', 'API'],
    order: 5,
    createdAt: '2023-09-12T16:45:00Z',
    description: 'Join our backend team to build scalable and efficient APIs. Experience with Node.js, Python, and database design is required.'
  },
  {
    id: 'job_1006',
    title: 'Data Scientist',
    slug: 'data-scientist',
    status: 'archived',
    department: 'Data Science',
    tags: ['Machine Learning', 'Python', 'Data Analysis'],
    order: 6,
    createdAt: '2023-10-01T09:30:00Z',
    description: 'We are looking for a Data Scientist to analyze complex data and build machine learning models. Experience with Python and data visualization is required.'
  },
  {
    id: 'job_1007',
    title: 'QA Engineer',
    slug: 'qa-engineer',
    status: 'active',
    department: 'Quality Assurance',
    tags: ['Testing', 'Automation', 'Selenium'],
    order: 7,
    createdAt: '2023-10-15T13:10:00Z',
    description: 'Join our QA team to ensure the quality of our software products. You will be responsible for manual and automated testing.'
  },
  {
    id: 'job_1008',
    title: 'Mobile Developer (React Native)',
    slug: 'mobile-developer-react-native',
    status: 'active',
    department: 'Engineering',
    tags: ['React Native', 'Mobile', 'JavaScript'],
    order: 8,
    createdAt: '2023-10-20T15:30:00Z',
    description: 'We are looking for a Mobile Developer with React Native experience to help us build cross-platform mobile applications.'
  }
];
export const generateMockJobResponse = (params) => {
  let jobs = [...MOCK_JOBS];
  // Apply filters
  if (params.status) {
    jobs = jobs.filter(job => job.status === params.status);
  }
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(searchLower) ||
      job.department?.toLowerCase().includes(searchLower) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  // Apply pagination
  const startIndex = (params.page - 1) * params.pageSize;
  const paginatedJobs = jobs.slice(startIndex, startIndex + params.pageSize);
  return {
    data: paginatedJobs,
    pagination: {
      currentPage: params.page,
      pageSize: params.pageSize,
      totalItems: jobs.length,
      totalPages: Math.ceil(jobs.length / params.pageSize),
    }
  };
};
