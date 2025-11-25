// ==========================================
// 📊 MOCK DATA FOR JOB BROWSE
// ==========================================

// 1️⃣ MOCK JOBS - ข้อมูลงาน 6 ตำแหน่ง
export const mockJobs = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'Tech Giants Inc.',
    logo: '💼',
    location: 'San Francisco, CA',
    type: 'Full-time',
    level: 'Senior',
    salary: '150k - 200k',
    description: 'We are looking for a Senior React Developer to lead our frontend team. You will be responsible for building scalable, efficient web applications using React and modern JavaScript. This role offers an opportunity to work with cutting-edge technologies and mentor junior developers.',
    requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience', 'Redux or state management', 'REST APIs', 'Git proficiency'],
    benefits: ['Health Insurance', '401(k) Match', 'Flexible Work Hours', 'Remote Options', 'Professional Development', 'Stock Options'],
    companyDescription: 'Tech Giants Inc. is a leading technology company specializing in cloud solutions and AI. We are committed to innovation and creating products that make a difference. Our team is passionate about building the future of technology.',
    postedDate: '2024-11-23',
    applicants: 45
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'StartUp Innovations',
    logo: '🚀',
    location: 'Remote',
    type: 'Full-time',
    level: 'Mid-level',
    salary: '100k - 140k',
    description: 'Join our fast-growing startup building the next-gen platform. We are looking for a Full Stack Developer who can work with modern technologies and contribute to our product development.',
    requirements: ['MERN stack', 'AWS', 'Docker', '3+ years experience', 'MongoDB', 'PostgreSQL', 'Agile methodologies'],
    benefits: ['Equity', 'Remote First', 'Flexible Schedule', 'Learning Budget', 'Health Benefits', 'Team Outings'],
    companyDescription: 'StartUp Innovations is a fast-growing tech startup founded in 2020. We are disrupting the industry with innovative solutions and a dynamic team culture. Our mission is to empower businesses with cutting-edge technology.',
    postedDate: '2024-11-20',
    applicants: 32
  },
  {
    id: 3,
    title: 'Frontend Engineer',
    company: 'Digital Solutions Ltd.',
    logo: '🎨',
    location: 'New York, NY',
    type: 'Full-time',
    level: 'Junior',
    salary: '80k - 120k',
    description: 'Looking for a passionate Frontend Engineer to build amazing UIs. You will work with our design team to create beautiful and responsive user interfaces for our web applications.',
    requirements: ['HTML/CSS', 'JavaScript', 'React basics', 'Git', 'Responsive design', 'Web accessibility', 'Figma'],
    benefits: ['Training Programs', 'Mentorship', 'Health Insurance', 'Paid Time Off', 'Office Gym', 'Free Snacks'],
    companyDescription: 'Digital Solutions Ltd. is a digital agency specializing in web design and development. We have been helping businesses transform their digital presence since 2015. Our portfolio includes projects for Fortune 500 companies.',
    postedDate: '2024-11-16',
    applicants: 78
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    logo: '☁️',
    location: 'Remote',
    type: 'Contract',
    level: 'Senior',
    salary: '140k - 180k',
    description: 'Seeking DevOps Engineer to manage our cloud infrastructure and ensure system reliability. You will be responsible for CI/CD pipelines, monitoring, and infrastructure automation.',
    requirements: ['Kubernetes', 'CI/CD', 'AWS/GCP', 'Docker', '5+ years', 'Terraform', 'Linux'],
    benefits: ['Competitive Pay', 'Remote', 'Flexible Terms', 'Professional Growth', 'Networking Opportunities'],
    companyDescription: 'Cloud Systems is a leading cloud infrastructure provider serving enterprise clients. We are at the forefront of cloud technology and DevOps practices.',
    postedDate: '2024-11-21',
    applicants: 28
  },
  {
    id: 5,
    title: 'Data Scientist',
    company: 'AI Labs Inc.',
    logo: '🤖',
    location: 'Boston, MA',
    type: 'Full-time',
    level: 'Mid-level',
    salary: '120k - 160k',
    description: 'Join our AI team to build machine learning models that solve real-world problems. You will work with large datasets and cutting-edge ML technologies.',
    requirements: ['Python', 'TensorFlow', 'SQL', 'Statistics', '2+ years', 'Scikit-learn', 'Data visualization'],
    benefits: ['Research Budget', 'Conference Attendance', 'Health Insurance', 'Relocation Assistance', 'Flexible Hours'],
    companyDescription: 'AI Labs Inc. is an AI research and development company pushing the boundaries of machine learning. We collaborate with leading universities and organizations on groundbreaking AI projects.',
    postedDate: '2024-11-16',
    applicants: 35
  },
  {
    id: 6,
    title: 'Backend Developer',
    company: 'E-commerce Pro',
    logo: '🛒',
    location: 'Austin, TX',
    type: 'Full-time',
    level: 'Mid-level',
    salary: '110k - 150k',
    description: 'Build scalable backend systems for our e-commerce platform serving millions of users. You will work on microservices, APIs, and database optimization.',
    requirements: ['Node.js', 'PostgreSQL', 'REST API', 'AWS', '3+ years', 'Redis', 'Message queues'],
    benefits: ['Performance Bonus', 'Stock Options', 'Health Coverage', 'Relocation Package', 'Work Life Balance'],
    companyDescription: 'E-commerce Pro is a leading online retail platform with operations in multiple countries. We process billions in transactions annually and focus on technical excellence.',
    postedDate: '2024-11-23',
    applicants: 52
  }
];

// 2️⃣ MOCK FILTERS - ตัวเลือก filter สำหรับหน้า Job Browse
export const mockFilters = {
  locations: [
    'San Francisco, CA',
    'Remote',
    'New York, NY',
    'Boston, MA',
    'Austin, TX',
    'Seattle, WA'
  ],
  jobTypes: [
    'Full-time',
    'Contract',
    'Part-time',
    'Freelance'
  ],
  levels: [
    'Junior',
    'Mid-level',
    'Senior',
    'Lead'
  ],
  salaryRanges: [
    { label: 'Under 80k', min: 0, max: 80000 },
    { label: '80k - 120k', min: 80000, max: 120000 },
    { label: '120k - 160k', min: 120000, max: 160000 },
    { label: '160k - 200k', min: 160000, max: 200000 },
    { label: '200k+', min: 200000, max: Infinity }
  ]
};

// 3️⃣ MOCK CURRENT USER - ข้อมูลผู้ใช้และรายการ favorites
export const mockCurrentUser = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: '👤',
  favorites: [1, 3]
};