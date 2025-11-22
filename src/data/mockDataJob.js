// ==========================================
// 📊 MOCK DATA THAT WAS ADDED TO mockData.js
// ==========================================
// นี่คือข้อมูลที่เพิ่มไปยัง mockData.js เพื่อให้หน้า Job Browse ทำงาน

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
    description: 'We are looking for a Senior React Developer to lead our frontend team...',
    requirements: ['React', 'TypeScript', 'Node.js', '5+ years experience'],
    postedDate: '2 days ago',
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
    description: 'Join our fast-growing startup building the next-gen platform...',
    requirements: ['MERN stack', 'AWS', 'Docker', '3+ years experience'],
    postedDate: '5 days ago',
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
    description: 'Looking for a passionate Frontend Engineer to build amazing UIs...',
    requirements: ['HTML/CSS', 'JavaScript', 'React basics', 'Git'],
    postedDate: '1 week ago',
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
    description: 'Seeking DevOps Engineer to manage our cloud infrastructure...',
    requirements: ['Kubernetes', 'CI/CD', 'AWS/GCP', 'Docker', '5+ years'],
    postedDate: '3 days ago',
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
    description: 'Join our AI team to build machine learning models...',
    requirements: ['Python', 'TensorFlow', 'SQL', 'Statistics', '2+ years'],
    postedDate: '1 week ago',
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
    description: 'Build scalable backend systems for our e-commerce platform...',
    requirements: ['Node.js', 'PostgreSQL', 'REST API', 'AWS', '3+ years'],
    postedDate: '2 days ago',
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
  favorites: [1, 3] // IDs ของงานที่ save (Job ID 1 และ 3)
};

/*
📝 สรุปข้อมูล:

mockJobs:
- มี 6 ตำแหน่งงาน
- แต่ละอันมี: id, title, company, logo, location, type, level, salary, description, requirements, postedDate, applicants
- ใช้สำหรับแสดง JobCard

mockFilters:
- locations: 6 เมืองในประเทศ
- jobTypes: 4 ประเภทงาน
- levels: 4 ระดับประสบการณ์
- salaryRanges: 5 ช่วงเงินเดือน
- ใช้สำหรับ dropdown filter

mockCurrentUser:
- ข้อมูลของผู้ใช้ปัจจุบัน
- favorites: ID ของงานที่บันทึก
- ใช้สำหรับแสดง favorite status ของ JobCard

✨ ด้วยข้อมูลนี้ หน้า Job Browse จะแสดงอย่างสมบูรณ์ ✨
*/