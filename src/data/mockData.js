// Mock Data for Smart Persona Profile
export const mockProfileData = {
  // Header info
  name: 'Alex Johnson',
  title: 'Senior Software Engineer',
  bio: 'Full-stack developer with 8+ years building scalable web applications. Expert in React, Node.js, AWS. Leading teams to deliver high-performance solutions.',
  avatar: '👨‍💻',

  // Quick stats
  stats: {
    experience: '8+',
    projects: '45+',
    certifications: '5',
    rating: '95%'
  },

  // Social links
  social: [
    { name: 'LinkedIn', url: 'https://linkedin.com/in/alexjohnson', icon: '💼' },
    { name: 'GitHub', url: '', icon: '💻' },
    { name: 'Website', url: 'https://alexjohnson.dev', icon: '🌐' }
  ],

  // Quick Info (Sidebar)
  quickInfo: {
    age: '32 years',
    nationality: 'American',
    visaStatus: 'US Citizen',
    location: 'San Francisco, CA',
    workType: 'Remote / Onsite'
  },

  // Contact
  contact: {
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'alexjohnson.dev',
    linkedin: 'https://linkedin.com/in/alexjohnson',
    github: 'https://github.com/alexjohnson'
  },

  // Education
  education: [
    { degree: 'M.S. Computer Science', school: 'Stanford University', year: '2014 - 2016' },
    { degree: 'B.S. Software Engineering', school: 'MIT', year: '2010 - 2014' }
  ],

  // Languages
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Fluent' },
    { name: 'Mandarin', level: 'Intermediate' }
  ],

  // Professional Summary
  summary: 'Senior Software Engineer with 8+ years of proven experience designing and implementing scalable web applications. Specialized in full-stack development with modern technologies (React, Node.js, AWS). Strong track record of leading engineering teams, architecting cloud-native solutions, and delivering enterprise-grade solutions on schedule.',

  // Work Experience
  experience: [
    {
      id: 1,
      period: '📅 Jan 2021 - Present · 3 yrs 10 mos',
      title: 'Senior Software Engineer',
      company: 'Tech Giants Inc. • San Francisco, CA',
      description: '• Leading team of 6 engineers building cloud-native microservices architecture\n• Designed and implemented real-time analytics platform handling 2M+ daily active users\n• Optimized CI/CD pipeline reducing deployment time by 60%\n• Mentored 3 junior developers, 2 promoted to mid-level\n• Tech Stack: React, Node.js, AWS, Kubernetes, TypeScript',
      skills: ['React', 'Node.js', 'AWS', 'Kubernetes', 'TypeScript']
    },
    {
      id: 2,
      period: '📅 Mar 2018 - Dec 2020 · 2 yrs 10 mos',
      title: 'Full Stack Developer',
      company: 'StartUp Innovations • Remote',
      description: '• Developed and maintained 12+ client projects using MERN stack\n• Built e-commerce platforms processing $5M+ annual revenue\n• Reduced database query time by 45% through optimization\n• Collaborated with product team in agile (2-week sprints)\n• Tech Stack: MongoDB, Express, React, Node.js, AWS',
      skills: ['MongoDB', 'Express', 'React', 'Node.js']
    },
    {
      id: 3,
      period: '📅 Jun 2016 - Feb 2018 · 1 yr 9 mos',
      title: 'Junior Developer',
      company: 'Digital Solutions Ltd. • New York, NY',
      description: '• Built responsive front-end interfaces for 15+ corporate websites\n• Mastered modern JavaScript frameworks and best practices\n• Contributed to open-source projects with 10+ merged PRs\n• Consistently met tight deadlines with high code quality\n• Tech Stack: JavaScript, HTML/CSS, jQuery, Git',
      skills: ['JavaScript', 'HTML/CSS', 'jQuery', 'Git']
    }
  ],

  // Key Expertise Areas
  expertise: [
    {
      icon: '🗽',
      name: 'System Architecture',
      description: 'Design scalable systems, choose tech stacks'
    },
    {
      icon: '⚡',
      name: 'Performance Optimization',
      description: '60% latency reduction, 45% faster queries'
    },
    {
      icon: '👥',
      name: 'Team Leadership',
      description: 'Led 6 engineers, 3 promotions mentored'
    },
    {
      icon: '🔍',
      name: 'Debugging & Problem Solving',
      description: 'Complex issues, edge cases, root cause analysis'
    },
    {
      icon: '📊',
      name: 'Data Architecture',
      description: 'Database design, optimization, indexing strategies'
    },
    {
      icon: '🚀',
      name: 'DevOps & Deployment',
      description: 'CI/CD, containerization, infrastructure-as-code'
    },
    {
      icon: '📚',
      name: 'Code Quality & Best Practices',
      description: 'Clean architecture, testing, code reviews, mentoring'
    },
    {
      icon: '🔐',
      name: 'Security & Authentication',
      description: 'OAuth, JWT, encryption, secure API design'
    }
  ],

  // Portfolio (URL string for edit form)
  portfolio: 'https://alexjohnson.dev/portfolio',

  // Featured Portfolio Projects (for display)
  portfolioProjects: [
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time data visualization'
    },
    {
      icon: '🛒',
      title: 'E-commerce Platform',
      description: 'Full-stack MERN solution'
    },
    {
      icon: '🌐',
      title: 'Corporate Website',
      description: 'Performance optimized'
    },
    {
      icon: '📱',
      title: 'Mobile App',
      description: 'React Native fitness app'
    },
    {
      icon: '🤖',
      title: 'API Platform',
      description: 'RESTful + GraphQL'
    }
  ],

  // Work Preferences
  workPreferences: [
    {
      icon: '💼',
      title: 'Employment Type',
      description: 'Full-time or Contract'
    },
    {
      icon: '📍',
      title: 'Location',
      description: 'Remote or Bay Area'
    },
    {
      icon: '💰',
      title: 'Salary Range',
      description: '$180k - $220k'
    },
    {
      icon: '🚀',
      title: 'Team Size',
      description: 'Prefer leading teams'
    },
    {
      icon: '⏰',
      title: 'Notice Period',
      description: '2 weeks'
    },
    {
      icon: '🎓',
      title: 'Growth Focus',
      description: 'Architect/Leadership'
    }
  ],

  // Certifications
  certifications: [
    {
      name: 'AWS Solutions Architect - Professional',
      issuer: 'Amazon Web Services',
      date: 'Issued: May 2022 • Expires: May 2025'
    },
    {
      name: 'Kubernetes Administrator (CKAD)',
      issuer: 'Linux Foundation',
      date: 'Issued: Jan 2021 • Expires: Jan 2024'
    },
    {
      name: 'AWS Certified Developer - Associate',
      issuer: 'Amazon Web Services',
      date: 'Issued: Mar 2020 • Expires: Mar 2023'
    },
    {
      name: 'Google Cloud Associate Cloud Engineer',
      issuer: 'Google Cloud',
      date: 'Issued: Aug 2021'
    },
    {
      name: 'MongoDB Certified Developer',
      issuer: 'MongoDB University',
      date: 'Issued: Sep 2019'
    }
  ],

  // Open Source Contributions
  openSource: [
    {
      title: 'React Router Contributors',
      company: 'GitHub: remix-run/react-router',
      description: '50+ merged commits contributing advanced routing patterns. Performance improvements used by 100k+ developers worldwide.'
    },
    {
      title: 'npm Package: CLI Helper Tool',
      company: 'npm: @alexjohnson/cli-helper • 5k monthly downloads',
      description: 'Published developer productivity tool. Active maintenance with community support.'
    },
    {
      title: 'Open Source Contributions',
      company: '10+ repositories with merged PRs',
      description: 'Regular contributor to popular JavaScript ecosystem projects.'
    }
  ],

  // Technical Publications
  publications: [
    {
      title: 'Building Scalable Microservices with Node.js',
      company: 'Dev.to • 10k+ views • Featured'
    },
    {
      title: 'React Performance Optimization Strategies',
      company: 'Medium • Better Programming publication'
    },
    {
      title: 'Cloud Architecture Design Patterns',
      company: 'Dev.to • University course reference'
    }
  ],

  // Technical Skills (for sidebar)
  skills: [
    { name: 'JavaScript / TypeScript', level: 'Advanced', years: '8yr', proficiency: 85, description: 'Production code • Optimization' },
    { name: 'React & Redux', level: 'Advanced', years: '6yr', proficiency: 80, description: 'Complex apps • State mgmt' },
    { name: 'Node.js & Express', level: 'Advanced', years: '5yr', proficiency: 80, description: 'REST APIs • Middleware' },
    { name: 'AWS & Cloud', level: 'Inter-Adv', years: '4yr', proficiency: 72, description: 'Deployment • Monitoring' },
    { name: 'MongoDB / PostgreSQL', level: 'Advanced', years: '5yr', proficiency: 80, description: 'Optimization • Indexing' }
  ]
};

export default mockProfileData;