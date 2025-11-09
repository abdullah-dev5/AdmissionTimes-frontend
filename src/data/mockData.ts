export interface Program {
  id: string
  title: string
  university: string
  location: string
  status: 'Open' | 'Closing Soon' | 'Closed'
  lastUpdated: string
  match?: string
  deadline?: string
  summary: {
    applicationWindow: string
    eligibility: string
    entryTest: string
    application: string
  }
  overview: {
    description: string
    highlights: string[]
  }
  eligibility?: {
    requirements: string[]
    documents: string[]
  }
  importantDates?: {
    applicationStart: string
    applicationEnd: string
    entryTestDate: string
    resultDate: string
  }
  feeStructure?: {
    admissionFee: string
    semesterFee: string
    totalProgramFee: string
  }
  documents?: string[]
  officialLinks: {
    website: string
    prospectus: string
  }
}

export const mockPrograms: Program[] = [
  {
    id: '1',
    title: 'BS Computer Science',
    university: 'Global Tech University',
    location: 'Lahore, Punjab',
    status: 'Open',
    lastUpdated: 'Nov 05, 2025',
    match: '92%',
    deadline: '2026-03-15',
    summary: {
      applicationWindow: 'Open until January 15, 2026.',
      eligibility: 'Minimum 60% in F.Sc (Pre-Engineering) or equivalent.',
      entryTest: 'University\'s own entry test is mandatory. No external tests accepted.',
      application: 'Apply through the official university online portal.',
    },
    overview: {
      description: 'The BS in Computer Science at Global Tech University is a flagship program designed to equip students with the foundational knowledge and practical skills required to excel in the ever-evolving field of technology. Our curriculum is a blend of theoretical computer science principles and hands-on experience with the latest technologies and programming languages.',
      highlights: [
        'State-of-the-art labs with modern computing facilities.',
        'Curriculum designed in collaboration with industry leaders.',
        'Specialization tracks in AI, Cybersecurity, and Software Engineering.',
        'Mandatory internship program with partner tech companies.',
      ],
    },
    eligibility: {
      requirements: [
        'F.Sc (Pre-Engineering) or equivalent with minimum 60% marks',
        'A-Levels with minimum 3 subjects including Mathematics',
        'High School Diploma with Mathematics and Physics',
      ],
      documents: [
        'Matriculation certificate',
        'Intermediate/F.Sc certificate',
        'CNIC/B-Form copy',
        'Recent passport size photographs',
        'Entry test result',
      ],
    },
    importantDates: {
      applicationStart: '2025-11-01',
      applicationEnd: '2026-01-15',
      entryTestDate: '2026-02-10',
      resultDate: '2026-02-25',
    },
    feeStructure: {
      admissionFee: 'Rs. 25,000',
      semesterFee: 'Rs. 150,000',
      totalProgramFee: 'Rs. 1,225,000',
    },
    documents: [
      'Matriculation certificate',
      'Intermediate/F.Sc certificate',
      'CNIC/B-Form copy',
      'Recent passport size photographs',
      'Entry test result',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://example.com',
      prospectus: 'https://example.com/prospectus.pdf',
    },
  },
  {
    id: '2',
    title: 'MBA',
    university: 'LUMS',
    location: 'Lahore, Punjab',
    status: 'Closing Soon',
    lastUpdated: 'Nov 03, 2025',
    match: '88%',
    deadline: '2026-01-20',
    summary: {
      applicationWindow: 'Closing on January 20, 2026.',
      eligibility: 'Minimum 16 years of education with 2.5 CGPA or equivalent.',
      entryTest: 'GMAT or LUMS admission test required.',
      application: 'Apply through LUMS online admission portal.',
    },
    overview: {
      description: 'The MBA program at LUMS is designed to develop leaders who can navigate complex business challenges. The program combines rigorous academic training with real-world business experience, preparing graduates for leadership roles in diverse industries.',
      highlights: [
        'Internationally recognized AACSB accredited program.',
        'Strong industry connections and placement support.',
        'Diverse student body with global perspectives.',
        'Experienced faculty with industry and academic expertise.',
      ],
    },
    eligibility: {
      requirements: [
        '16 years of education (Bachelor\'s degree)',
        'Minimum 2.5 CGPA or 50% marks',
        'GMAT or LUMS admission test',
        'Work experience preferred but not mandatory',
      ],
      documents: [
        'Bachelor\'s degree transcript',
        'CNIC copy',
        'GMAT/LUMS test result',
        'Two recommendation letters',
        'Statement of purpose',
      ],
    },
    importantDates: {
      applicationStart: '2025-10-01',
      applicationEnd: '2026-01-20',
      entryTestDate: '2026-02-15',
      resultDate: '2026-03-01',
    },
    feeStructure: {
      admissionFee: 'Rs. 50,000',
      semesterFee: 'Rs. 450,000',
      totalProgramFee: 'Rs. 3,650,000',
    },
    documents: [
      'Bachelor\'s degree transcript',
      'CNIC copy',
      'GMAT/LUMS test result',
      'Two recommendation letters',
      'Statement of purpose',
      'Work experience certificate (if applicable)',
    ],
    officialLinks: {
      website: 'https://lums.edu.pk',
      prospectus: 'https://lums.edu.pk/mba-prospectus.pdf',
    },
  },
  {
    id: '3',
    title: 'MD Medicine',
    university: 'Aga Khan University',
    location: 'Karachi, Sindh',
    status: 'Open',
    lastUpdated: 'Nov 01, 2025',
    match: '85%',
    deadline: '2026-04-01',
    summary: {
      applicationWindow: 'Open until March 15, 2026.',
      eligibility: 'MBBS degree with minimum 60% marks and valid PMDC registration.',
      entryTest: 'AKU entrance examination required.',
      application: 'Apply through Aga Khan University online portal.',
    },
    overview: {
      description: 'The MD Medicine program at Aga Khan University provides comprehensive training in internal medicine, preparing physicians for advanced clinical practice and research. The program emphasizes evidence-based medicine and patient-centered care.',
      highlights: [
        'World-class medical facilities and teaching hospitals.',
        'Internationally recognized faculty and research opportunities.',
        'Comprehensive clinical training program.',
        'Strong emphasis on research and evidence-based practice.',
      ],
    },
    eligibility: {
      requirements: [
        'MBBS degree from recognized institution',
        'Minimum 60% marks in MBBS',
        'Valid PMDC registration',
        'AKU entrance examination',
      ],
      documents: [
        'MBBS degree certificate',
        'PMDC registration certificate',
        'CNIC copy',
        'Medical transcripts',
        'AKU entrance test result',
      ],
    },
    importantDates: {
      applicationStart: '2025-11-01',
      applicationEnd: '2026-03-15',
      entryTestDate: '2026-03-25',
      resultDate: '2026-04-10',
    },
    feeStructure: {
      admissionFee: 'Rs. 100,000',
      semesterFee: 'Rs. 600,000',
      totalProgramFee: 'Rs. 4,900,000',
    },
    documents: [
      'MBBS degree certificate',
      'PMDC registration certificate',
      'CNIC copy',
      'Medical transcripts',
      'AKU entrance test result',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://aku.edu',
      prospectus: 'https://aku.edu/md-prospectus.pdf',
    },
  },
  {
    id: '4',
    title: 'BBA',
    university: 'IBA Karachi',
    location: 'Karachi, Sindh',
    status: 'Open',
    lastUpdated: 'Oct 30, 2025',
    match: '81%',
    deadline: '2026-02-28',
    summary: {
      applicationWindow: 'Open until February 15, 2026.',
      eligibility: 'Intermediate or A-Levels with minimum 60% marks.',
      entryTest: 'IBA admission test (NTS) required.',
      application: 'Apply through IBA online admission portal.',
    },
    overview: {
      description: 'The BBA program at IBA Karachi is designed to develop business leaders with strong analytical and decision-making skills. The program provides a solid foundation in business fundamentals while encouraging critical thinking and innovation.',
      highlights: [
        'Pakistan\'s premier business school with excellent reputation.',
        'Strong industry connections and internship opportunities.',
        'Modern curriculum aligned with global business practices.',
        'Excellent placement record with top companies.',
      ],
    },
    eligibility: {
      requirements: [
        'Intermediate or equivalent with minimum 60% marks',
        'A-Levels with minimum 3 subjects',
        'IBA admission test (NTS)',
      ],
      documents: [
        'Matriculation certificate',
        'Intermediate certificate',
        'CNIC/B-Form copy',
        'NTS test result',
        'Recent photographs',
      ],
    },
    importantDates: {
      applicationStart: '2025-11-01',
      applicationEnd: '2026-02-15',
      entryTestDate: '2026-02-20',
      resultDate: '2026-03-05',
    },
    feeStructure: {
      admissionFee: 'Rs. 30,000',
      semesterFee: 'Rs. 180,000',
      totalProgramFee: 'Rs. 1,470,000',
    },
    documents: [
      'Matriculation certificate',
      'Intermediate certificate',
      'CNIC/B-Form copy',
      'NTS test result',
      'Recent photographs',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://iba.edu.pk',
      prospectus: 'https://iba.edu.pk/bba-prospectus.pdf',
    },
  },
  {
    id: '5',
    title: 'BS Software Engineering',
    university: 'National University of IT',
    location: 'Islamabad, Capital',
    status: 'Open',
    lastUpdated: 'Nov 04, 2025',
    match: '90%',
    deadline: '2026-03-10',
    summary: {
      applicationWindow: 'Open until February 28, 2026.',
      eligibility: 'F.Sc (Pre-Engineering) with minimum 65% marks.',
      entryTest: 'NUIT entrance test required.',
      application: 'Apply through NUIT online portal.',
    },
    overview: {
      description: 'The BS Software Engineering program at National University of IT focuses on developing software systems and applications. Students learn modern software development practices, project management, and software engineering principles.',
      highlights: [
        'Industry-focused curriculum with latest technologies.',
        'Strong emphasis on practical projects and internships.',
        'Collaboration with leading tech companies.',
        'Modern labs and development facilities.',
      ],
    },
    eligibility: {
      requirements: [
        'F.Sc (Pre-Engineering) with minimum 65% marks',
        'A-Levels with Mathematics and Physics',
        'NUIT entrance test',
      ],
      documents: [
        'Matriculation certificate',
        'F.Sc certificate',
        'CNIC copy',
        'NUIT test result',
        'Photographs',
      ],
    },
    importantDates: {
      applicationStart: '2025-11-01',
      applicationEnd: '2026-02-28',
      entryTestDate: '2026-03-05',
      resultDate: '2026-03-20',
    },
    feeStructure: {
      admissionFee: 'Rs. 20,000',
      semesterFee: 'Rs. 140,000',
      totalProgramFee: 'Rs. 1,140,000',
    },
    documents: [
      'Matriculation certificate',
      'F.Sc certificate',
      'CNIC copy',
      'NUIT test result',
      'Photographs',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://example.com',
      prospectus: 'https://example.com/prospectus.pdf',
    },
  },
  {
    id: '6',
    title: 'BS Data Science',
    university: 'Metropolitan Science College',
    location: 'Karachi, Sindh',
    status: 'Closing Soon',
    lastUpdated: 'Nov 02, 2025',
    match: '87%',
    deadline: '2026-01-25',
    summary: {
      applicationWindow: 'Closing on January 25, 2026.',
      eligibility: 'F.Sc (Pre-Engineering) or equivalent with minimum 60% marks.',
      entryTest: 'MSC entrance test required.',
      application: 'Apply through MSC online portal.',
    },
    overview: {
      description: 'The BS Data Science program prepares students for careers in data analysis, machine learning, and artificial intelligence. The curriculum covers statistics, programming, data visualization, and advanced analytics techniques.',
      highlights: [
        'Cutting-edge curriculum in data science and AI.',
        'Hands-on experience with real-world datasets.',
        'Industry partnerships for internships and projects.',
        'Expert faculty with research and industry experience.',
      ],
    },
    eligibility: {
      requirements: [
        'F.Sc (Pre-Engineering) with minimum 60% marks',
        'Strong background in Mathematics',
        'MSC entrance test',
      ],
      documents: [
        'Matriculation certificate',
        'F.Sc certificate',
        'CNIC copy',
        'MSC test result',
        'Photographs',
      ],
    },
    importantDates: {
      applicationStart: '2025-10-15',
      applicationEnd: '2026-01-25',
      entryTestDate: '2026-02-05',
      resultDate: '2026-02-20',
    },
    feeStructure: {
      admissionFee: 'Rs. 25,000',
      semesterFee: 'Rs. 160,000',
      totalProgramFee: 'Rs. 1,305,000',
    },
    documents: [
      'Matriculation certificate',
      'F.Sc certificate',
      'CNIC copy',
      'MSC test result',
      'Photographs',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://example.com',
      prospectus: 'https://example.com/prospectus.pdf',
    },
  },
  {
    id: '7',
    title: 'BS Artificial Intelligence',
    university: 'Lahore Engineering University',
    location: 'Lahore, Punjab',
    status: 'Closed',
    lastUpdated: 'Oct 28, 2025',
    match: '83%',
    deadline: '2025-12-15',
    summary: {
      applicationWindow: 'Application period has closed.',
      eligibility: 'F.Sc (Pre-Engineering) with minimum 70% marks.',
      entryTest: 'LEU entrance test was required.',
      application: 'Applications are no longer being accepted.',
    },
    overview: {
      description: 'The BS Artificial Intelligence program focuses on machine learning, neural networks, and intelligent systems. Students learn to develop AI solutions for real-world problems and gain expertise in cutting-edge AI technologies.',
      highlights: [
        'Comprehensive AI and machine learning curriculum.',
        'State-of-the-art AI labs and computing resources.',
        'Research opportunities in AI and robotics.',
        'Industry collaborations with tech companies.',
      ],
    },
    eligibility: {
      requirements: [
        'F.Sc (Pre-Engineering) with minimum 70% marks',
        'Strong Mathematics background',
        'LEU entrance test',
      ],
      documents: [
        'Matriculation certificate',
        'F.Sc certificate',
        'CNIC copy',
        'LEU test result',
        'Photographs',
      ],
    },
    importantDates: {
      applicationStart: '2025-09-01',
      applicationEnd: '2025-12-15',
      entryTestDate: '2025-12-20',
      resultDate: '2026-01-05',
    },
    feeStructure: {
      admissionFee: 'Rs. 30,000',
      semesterFee: 'Rs. 170,000',
      totalProgramFee: 'Rs. 1,390,000',
    },
    documents: [
      'Matriculation certificate',
      'F.Sc certificate',
      'CNIC copy',
      'LEU test result',
      'Photographs',
      'Character certificate',
    ],
    officialLinks: {
      website: 'https://example.com',
      prospectus: 'https://example.com/prospectus.pdf',
    },
  },
]

export const getProgramById = (id: string): Program | undefined => {
  return mockPrograms.find(program => program.id === id)
}

export const getRecommendedPrograms = (limit: number = 4): Program[] => {
  return mockPrograms.slice(0, limit)
}

export const getRelatedPrograms = (currentProgramId: string, limit: number = 3): Program[] => {
  return mockPrograms
    .filter(program => program.id !== currentProgramId)
    .slice(0, limit)
}

