import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import GlassPanel from '../components/ui/GlassPanel';
import GlassCard from '../components/ui/GlassCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Link } from 'react-router-dom';

// TODO: Replace with API call to /api/partners/search
const DEMO_PARTNERS = [
  {
    id: 1,
    name: 'Anika Rahman',
    avatar: 'AR',
    degreeLevel: "Master's",
    major: 'Computer Science',
    targetCountry: 'Germany',
    targetUniversity: 'TU Munich',
    cgpa: 3.7,
    languages: ['English', 'Bengali', 'German (Basic)'],
    researchInterests: ['Machine Learning', 'Computer Vision', 'NLP'],
    intake: 'Winter 2025',
    status: 'Applying',
    bio: 'Looking for partners interested in AI research. Happy to share resources and application tips for German universities.',
    matchScore: 95,
    linkedin: '#',
    joined: '2 weeks ago',
    // TODO: Replace with API call to /api/partners/1/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'CONFERENCE',
          title: 'Attention Mechanisms in Low-Resource NLP for Bengali Language Processing',
          authors: 'Anika Rahman, Dr. Md. Shahjahan',
          journal: 'International Conference on Natural Language Processing (ICNLP)',
          year: 2024,
          status: 'PUBLISHED',
          doi: '10.1145/example.001',
          citations: 3
        },
        {
          id: 2,
          type: 'PREPRINT',
          title: 'Transfer Learning Approaches for Computer Vision in Medical Imaging',
          authors: 'Anika Rahman',
          journal: 'arXiv',
          year: 2024,
          status: 'PREPRINT',
          doi: null,
          citations: 0
        }
      ],
      articles: [
        {
          id: 1,
          title: 'How I prepared my application for TU Munich as a Bangladeshi student',
          platform: 'Medium',
          publishedAt: '2024-08-15',
          summary: 'A detailed guide covering APS certification, motivation letter writing, and German language preparation for engineering applicants from South Asia.',
          tags: 'Germany, TU Munich, Application Tips'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Research Assistant — NLP Lab',
          institution: 'BUET',
          department: 'Department of CSE',
          supervisor: 'Dr. Md. Shahjahan',
          startDate: 'Jan 2023',
          endDate: 'Dec 2023',
          isCurrent: false,
          description: 'Worked on Bengali language processing models, dataset curation for low-resource NLP, and transformer fine-tuning experiments.',
          skills: 'Python, PyTorch, HuggingFace, BERT, Data Annotation'
        }
      ]
    }
  },
  {
    id: 2,
    name: 'Carlos Mendez',
    avatar: 'CM',
    degreeLevel: "Master's",
    major: 'Data Science',
    targetCountry: 'Canada',
    targetUniversity: 'University of Toronto',
    cgpa: 3.5,
    languages: ['English', 'Spanish'],
    researchInterests: ['Data Engineering', 'Big Data', 'Cloud Computing'],
    intake: 'Fall 2025',
    status: 'Accepted',
    bio: 'Already accepted at UofT. Can help with application process and SOP writing for Canadian universities.',
    matchScore: 88,
    linkedin: '#',
    joined: '1 month ago',
    // TODO: Replace with API call to /api/partners/2/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'JOURNAL',
          title: 'Scalable ETL Pipelines for Real-Time Analytics on Cloud Infrastructure',
          authors: 'Carlos Mendez, Prof. Ana Gutierrez',
          journal: 'IEEE Transactions on Big Data',
          year: 2023,
          status: 'PUBLISHED',
          doi: '10.1109/example.002',
          citations: 11
        }
      ],
      articles: [
        {
          id: 1,
          title: 'Getting into University of Toronto for Data Science — My Full Journey',
          platform: 'LinkedIn',
          publishedAt: '2024-10-01',
          summary: 'Step-by-step breakdown of my application process, SOP writing, reference letters, and interview preparation for UofT Data Science program.',
          tags: 'Canada, UofT, Data Science, Masters'
        },
        {
          id: 2,
          title: 'Apache Spark vs Flink — Which Should You Learn in 2024?',
          platform: 'Medium',
          publishedAt: '2024-06-20',
          summary: 'Technical comparison of two dominant stream processing frameworks with benchmarks and use-case analysis.',
          tags: 'Big Data, Spark, Flink, Data Engineering'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Data Engineering Intern — Research Division',
          institution: 'National Autonomous University of Mexico',
          department: 'Data Science Research Group',
          supervisor: 'Prof. Ana Gutierrez',
          startDate: 'Jun 2022',
          endDate: 'Aug 2023',
          isCurrent: false,
          description: 'Built real-time data pipelines processing 2M+ records daily. Contributed to a published paper on scalable ETL architecture.',
          skills: 'Apache Spark, Kafka, AWS, SQL, Python'
        }
      ]
    }
  },
  {
    id: 3,
    name: 'Priya Sharma',
    avatar: 'PS',
    degreeLevel: "PhD",
    major: 'Biotechnology',
    targetCountry: 'Netherlands',
    targetUniversity: 'Wageningen University',
    cgpa: 3.9,
    languages: ['English', 'Hindi'],
    researchInterests: ['Genomics', 'CRISPR', 'Agricultural Biotech'],
    intake: 'Fall 2025',
    status: 'Applying',
    bio: 'Researching PhD programs in biotech. Looking for study partners and research collaboration opportunities.',
    matchScore: 72,
    linkedin: '#',
    joined: '3 days ago',
    // TODO: Replace with API call to /api/partners/3/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'JOURNAL',
          title: 'CRISPR-Cas9 Efficiency in Plant Genome Editing for Drought Resistance',
          authors: 'Priya Sharma, Dr. Rajesh Kumar, Dr. Anita Singh',
          journal: 'Plant Biotechnology Journal',
          year: 2024,
          status: 'PUBLISHED',
          doi: '10.1111/example.003',
          citations: 7
        },
        {
          id: 2,
          type: 'CONFERENCE',
          title: 'Off-Target Analysis Methods in Agricultural CRISPR Applications',
          authors: 'Priya Sharma, Dr. Anita Singh',
          journal: 'International Plant Biology Congress',
          year: 2023,
          status: 'PUBLISHED',
          doi: null,
          citations: 2
        }
      ],
      articles: [],
      researchExperience: [
        {
          id: 1,
          title: 'Junior Researcher — Genomics Lab',
          institution: 'Indian Institute of Science',
          department: 'Centre for BioSystems Science and Engineering',
          supervisor: 'Dr. Rajesh Kumar',
          startDate: 'Aug 2022',
          endDate: null,
          isCurrent: true,
          description: 'Conducting research on CRISPR gene editing techniques for improving crop resilience. Working on PhD proposal targeting Wageningen.',
          skills: 'CRISPR, PCR, DNA Sequencing, R, Bioinformatics, Lab Management'
        }
      ]
    }
  },
  {
    id: 4,
    name: 'Yuki Tanaka',
    avatar: 'YT',
    degreeLevel: "Master's",
    major: 'Mechanical Engineering',
    targetCountry: 'Germany',
    targetUniversity: 'RWTH Aachen',
    cgpa: 3.6,
    languages: ['English', 'Japanese', 'German (Intermediate)'],
    researchInterests: ['Robotics', 'Automotive Engineering', 'CAD/CAM'],
    intake: 'Winter 2025',
    status: 'Applying',
    bio: 'Engineering student targeting top German technical universities. Can help with APS certificate process for Germany.',
    matchScore: 85,
    linkedin: '#',
    joined: '1 week ago',
    // TODO: Replace with API call to /api/partners/4/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'CONFERENCE',
          title: 'Simulation-Based Optimization of Robotic Arm Trajectories for Assembly Lines',
          authors: 'Yuki Tanaka, Prof. Kenji Watanabe',
          journal: 'IEEE International Conference on Robotics and Automation (ICRA)',
          year: 2023,
          status: 'PUBLISHED',
          doi: null,
          citations: 4
        }
      ],
      articles: [
        {
          id: 1,
          title: 'Navigating the APS Certificate Process for Germany — A Japanese Student\'s Guide',
          platform: 'Medium',
          publishedAt: '2024-09-10',
          summary: 'Complete walkthrough of the APS certification procedure, required documents, and timeline for students from Japan applying to German universities.',
          tags: 'Germany, APS, RWTH, Mechanical Engineering'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Research Assistant — Advanced Robotics Lab',
          institution: 'Tokyo Institute of Technology',
          department: 'Department of Mechanical Engineering',
          supervisor: 'Prof. Kenji Watanabe',
          startDate: 'Apr 2022',
          endDate: 'Mar 2024',
          isCurrent: false,
          description: 'Developed simulation environments for robotic trajectory planning. Worked on path optimization algorithms for industrial automation.',
          skills: 'MATLAB, ROS, SolidWorks, Python, Simulink'
        }
      ]
    }
  },
  {
    id: 5,
    name: 'Fatima Al-Hassan',
    avatar: 'FA',
    degreeLevel: "Bachelor's",
    major: 'Business Administration',
    targetCountry: 'UK',
    targetUniversity: 'London School of Economics',
    cgpa: 3.8,
    languages: ['English', 'Arabic', 'French'],
    researchInterests: ['International Finance', 'Econometrics', 'Development Economics'],
    intake: 'Fall 2025',
    status: 'Applying',
    bio: 'Applying to top UK business schools. Interested in connecting with others targeting LSE or Warwick.',
    matchScore: 65,
    linkedin: '#',
    joined: '5 days ago',
    // TODO: Replace with API call to /api/partners/5/portfolio
    portfolio: {
      publications: [],
      articles: [
        {
          id: 1,
          title: 'My LSE Application Journey — Personal Statement, Interviews, and What I Learned',
          platform: 'LinkedIn',
          publishedAt: '2025-01-18',
          summary: 'A candid account of applying to the London School of Economics, including personal statement writing, the written assessment, and managing rejections and offers.',
          tags: 'LSE, UK, Business, Personal Statement'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Research Intern — Economics Policy Unit',
          institution: 'Gulf Development Institute',
          department: 'Macroeconomics and Trade Policy',
          supervisor: 'Dr. Sara Al-Fadli',
          startDate: 'Jul 2023',
          endDate: 'Dec 2023',
          isCurrent: false,
          description: 'Conducted literature reviews on trade policy impacts in MENA economies. Compiled econometric datasets and assisted with policy briefs.',
          skills: 'Stata, Excel, Economic Research, Report Writing'
        }
      ]
    }
  },
  {
    id: 6,
    name: 'Ravi Krishnan',
    avatar: 'RK',
    degreeLevel: "Master's",
    major: 'Electrical Engineering',
    targetCountry: 'USA',
    targetUniversity: 'MIT',
    cgpa: 3.95,
    languages: ['English', 'Tamil', 'Hindi'],
    researchInterests: ['Semiconductor Design', 'VLSI', 'Embedded Systems'],
    intake: 'Fall 2025',
    status: 'Applying',
    bio: 'Targeting top US engineering programs. Strong GRE score, happy to discuss test prep strategies.',
    matchScore: 78,
    linkedin: '#',
    joined: '2 months ago',
    // TODO: Replace with API call to /api/partners/6/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'JOURNAL',
          title: 'Energy-Efficient VLSI Design Patterns for Edge AI Inference Chips',
          authors: 'Ravi Krishnan, Dr. Suresh Naidu',
          journal: 'IEEE Transactions on VLSI Systems',
          year: 2024,
          status: 'UNDER_REVIEW',
          doi: null,
          citations: 0
        }
      ],
      articles: [
        {
          id: 1,
          title: 'How I Scored 340 on GRE in 6 Weeks — My Complete Study Plan',
          platform: 'Medium',
          publishedAt: '2024-11-05',
          summary: 'Detailed breakdown of resources, daily schedule, and test strategy that helped me achieve a perfect GRE Quant score while working part-time.',
          tags: 'GRE, USA, MIT, Test Prep, Electrical Engineering'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'VLSI Design Research Intern',
          institution: 'Indian Institute of Technology Madras',
          department: 'Department of Electrical Engineering',
          supervisor: 'Dr. Suresh Naidu',
          startDate: 'May 2023',
          endDate: null,
          isCurrent: true,
          description: 'Designing low-power VLSI architectures for edge inference applications. Currently submitting journal paper and preparing MS applications to top US programs.',
          skills: 'Verilog, Cadence, SPICE, FPGA, Python, Signal Processing'
        }
      ]
    }
  },
  {
    id: 7,
    name: 'Sofia Kowalski',
    avatar: 'SK',
    degreeLevel: "Master's",
    major: 'Environmental Science',
    targetCountry: 'Sweden',
    targetUniversity: 'KTH Royal Institute',
    cgpa: 3.4,
    languages: ['English', 'Polish'],
    researchInterests: ['Climate Change', 'Renewable Energy', 'Sustainability'],
    intake: 'Fall 2025',
    status: 'Accepted',
    bio: 'Accepted at KTH! Can share insights about Swedish university applications and scholarship opportunities.',
    matchScore: 60,
    linkedin: '#',
    joined: '3 weeks ago',
    // TODO: Replace with API call to /api/partners/7/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'PREPRINT',
          title: 'Carbon Capture Efficiency in Urban Green Infrastructure: A Comparative Study',
          authors: 'Sofia Kowalski, Dr. Marek Lewandowski',
          journal: 'EarthArXiv',
          year: 2024,
          status: 'PREPRINT',
          doi: null,
          citations: 0
        }
      ],
      articles: [
        {
          id: 1,
          title: 'How I Got Accepted to KTH for Sustainable Energy Engineering',
          platform: 'LinkedIn',
          publishedAt: '2025-02-20',
          summary: 'My complete application story including motivation letter tips, KTH-specific requirements, and how to apply for Swedish Institute scholarships.',
          tags: 'KTH, Sweden, Scholarship, Sustainability, Acceptance'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Research Assistant — Environmental Systems Lab',
          institution: 'Warsaw University of Technology',
          department: 'Faculty of Environmental Engineering',
          supervisor: 'Dr. Marek Lewandowski',
          startDate: 'Oct 2022',
          endDate: 'Jun 2024',
          isCurrent: false,
          description: 'Analyzed urban green infrastructure for carbon sequestration capacity. Contributed to a preprint examining tree cover and temperature correlation in Polish cities.',
          skills: 'R, GIS, ArcGIS, Environmental Sampling, Data Visualization'
        }
      ]
    }
  },
  {
    id: 8,
    name: 'Ahmed Hassan',
    avatar: 'AH',
    degreeLevel: "Master's",
    major: 'Computer Science',
    targetCountry: 'Canada',
    targetUniversity: 'University of British Columbia',
    cgpa: 3.6,
    languages: ['English', 'Arabic'],
    researchInterests: ['Cybersecurity', 'Blockchain', 'Distributed Systems'],
    intake: 'Winter 2025',
    status: 'Applying',
    bio: 'Focusing on cybersecurity programs in Canada. Looking for partners to share application experiences.',
    matchScore: 82,
    linkedin: '#',
    joined: '1 week ago',
    // TODO: Replace with API call to /api/partners/8/portfolio
    portfolio: {
      publications: [
        {
          id: 1,
          type: 'CONFERENCE',
          title: 'Threat Detection in Blockchain Networks Using Graph Neural Networks',
          authors: 'Ahmed Hassan, Dr. Layla Nasser',
          journal: 'ACM Conference on Computer and Communications Security (CCS)',
          year: 2024,
          status: 'ACCEPTED',
          doi: null,
          citations: 1
        }
      ],
      articles: [
        {
          id: 1,
          title: 'Applying to UBC for Cybersecurity — Tips from a Successful Applicant',
          platform: 'Medium',
          publishedAt: '2024-12-01',
          summary: 'A practical guide to UBC\'s CS graduate program application, covering SOP structure, reference letter strategy, and how to demonstrate research potential.',
          tags: 'UBC, Canada, Cybersecurity, Graduate Admission'
        }
      ],
      researchExperience: [
        {
          id: 1,
          title: 'Cybersecurity Research Assistant',
          institution: 'American University in Cairo',
          department: 'Department of Computer Science',
          supervisor: 'Dr. Layla Nasser',
          startDate: 'Sep 2022',
          endDate: 'Aug 2024',
          isCurrent: false,
          description: 'Researched anomaly detection in distributed ledger systems. Built graph-based detection models evaluated on public blockchain datasets.',
          skills: 'Python, PyTorch Geometric, Solidity, Wireshark, Linux Security'
        }
      ]
    }
  }
];

// TODO: Real match score will be calculated by backend based on:
// - Same target country (+30 points)
// - Same degree level (+20 points)
// - Overlapping research interests (+10 points each, max 30)
// - Same intake semester (+15 points)
// - Similar CGPA range (+5 points)
// TODO: Real match score will also include:
// - Publication count and citation score
// - Overlapping research experience institutions
// - Shared research interest keywords from publications
// Total: 100 points max

// TODO: move to shared utils when feature becomes functional
const getPublicationTypeColor = (type) => {
  const map = {
    JOURNAL: 'bg-blue-100 text-blue-800',
    CONFERENCE: 'bg-purple-100 text-purple-800',
    PREPRINT: 'bg-amber-100 text-amber-800',
    THESIS: 'bg-green-100 text-green-800',
    BOOK_CHAPTER: 'bg-teal-100 text-teal-800',
    OTHER: 'bg-gray-100 text-gray-700',
  };
  return map[type] || map.OTHER;
};

const getPublicationStatusColor = (status) => {
  const map = {
    PUBLISHED: 'bg-green-100 text-green-800',
    ACCEPTED: 'bg-teal-100 text-teal-800',
    UNDER_REVIEW: 'bg-amber-100 text-amber-800',
    PREPRINT: 'bg-gray-100 text-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
};

const getPlatformColor = (platform) => {
  if (!platform) return 'bg-gray-100 text-gray-700';
  const p = platform.toLowerCase();
  if (p.includes('medium')) return 'bg-green-100 text-green-800';
  if (p.includes('linkedin')) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-700';
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500',
    'bg-amber-500', 'bg-red-500', 'bg-teal-500',
    'bg-pink-500', 'bg-indigo-500'
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// ── Collapsible Section Component ──────────────────────────────────────────────
const CollapsibleSection = ({ icon, title, count, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left group"
        aria-expanded={isOpen}
      >
        <i className={`ti ${icon} text-primary text-base flex-none`}></i>
        <span className="flex-1 font-semibold text-slate-800 text-sm">{title}</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
            {count}
          </span>
        )}
        <i
          className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'} text-slate-400 text-sm transition-transform duration-200`}
        ></i>
      </button>

      <div
        style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '2000px' : '0',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
        }}
      >
        <div className="pt-3 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function PartnerFinder() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterDegree, setFilterDegree] = useState('All');
  const [filterMajor, setFilterMajor] = useState('All');
  const [filterIntake, setFilterIntake] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore', 'newest', 'cgpa'

  const [selectedPartner, setSelectedPartner] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = (key) => {
    setExpandedDescriptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Derive filter options
  const countries = ['All', 'Germany', 'Canada', 'UK', 'USA', 'Netherlands', 'Sweden', 'Australia', 'New Zealand'];
  const degrees = ['All', "Bachelor's", "Master's", "PhD"];
  const majors = ['All', 'Computer Science', 'Data Science', 'Engineering', 'Business', 'Biotechnology', 'Environmental Science', 'Mechanical Engineering', 'Electrical Engineering'];
  const intakes = ['All', 'Fall 2025', 'Winter 2025', 'Fall 2026'];
  const statuses = ['All', 'Applying', 'Accepted'];

  // Filter and Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = [...DEMO_PARTNERS];

    // Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.researchInterests.some(ri => ri.toLowerCase().includes(q))
      );
    }
    if (filterCountry !== 'All') result = result.filter(p => p.targetCountry === filterCountry);
    if (filterDegree !== 'All') result = result.filter(p => p.degreeLevel === filterDegree);
    if (filterMajor !== 'All') result = result.filter(p => p.major === filterMajor || (filterMajor === 'Engineering' && p.major.includes('Engineering')));
    if (filterIntake !== 'All') result = result.filter(p => p.intake === filterIntake);
    if (filterStatus !== 'All') result = result.filter(p => p.status === filterStatus);

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
      if (sortBy === 'cgpa') return b.cgpa - a.cgpa;
      if (sortBy === 'newest') {
        // Mock newest sort using IDs desc for simplicity of demo
        return b.id - a.id;
      }
      return 0;
    });

    return result;
  }, [searchQuery, filterCountry, filterDegree, filterMajor, filterIntake, filterStatus, sortBy]);

  const handleConnect = (name) => {
    toast.success(`Connection request sent to ${name}! (Demo - not functional yet)`, { icon: <i className="ti ti-plug text-primary"></i> });
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 70) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  const isProfileIncomplete = !user?.degreeLevel || !user?.major || !user?.cgpa || !user?.preferredCountry;

  // Check if a partner has any portfolio content at all
  const hasAnyPortfolio = (portfolio) => {
    if (!portfolio) return false;
    return (
      (portfolio.publications?.length > 0) ||
      (portfolio.articles?.length > 0) ||
      (portfolio.researchExperience?.length > 0)
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── SECTION 1: Page Header ── */}
      <div>
        <PageHeader
          title="Research Partner Finder"
          subtitle="Connect with students heading to the same destination"
        >
          <div className="flex items-center gap-2">
            <i className="ti ti-users text-xl text-primary"></i>
          </div>
        </PageHeader>

        {/* Demo Badge */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold flex-none">
            <i className="ti ti-bulb text-lg"></i>
            Demo Feature
          </div>
          <p className="text-sm text-amber-600 sm:ml-4">
            Showing sample profiles. In the full version, matches will be based on your actual profile, target university, research interests, and intake semester.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="mt-5 flex flex-wrap gap-4">
          <div className="glass-strong px-4 py-2 rounded-full text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm">
            <i className="ti ti-user-check text-primary text-lg"></i> 247 Students Registered
          </div>
          <div className="glass-strong px-4 py-2 rounded-full text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm">
            <i className="ti ti-map-pin text-primary text-lg"></i> 42 Countries
          </div>
          <div className="glass-strong px-4 py-2 rounded-full text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm">
            <i className="ti ti-message-circle-2 text-primary text-lg"></i> 180+ Connections Made
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">

        <div className="space-y-6">
          {/* ── SECTION 2: Search and Filter Bar ── */}
          <GlassPanel className="p-5 border border-white/30 shadow-md">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Search by name or research interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-2">
                <select className="bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="matchScore">Best Match</option>
                  <option value="newest">Newest First</option>
                  <option value="cgpa">Highest CGPA</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
                {countries.map(c => <option key={c} value={c}>Country: {c}</option>)}
              </select>
              <select className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700" value={filterDegree} onChange={e => setFilterDegree(e.target.value)}>
                {degrees.map(c => <option key={c} value={c}>Degree: {c}</option>)}
              </select>
              <select className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700" value={filterMajor} onChange={e => setFilterMajor(e.target.value)}>
                {majors.map(c => <option key={c} value={c}>Major: {c}</option>)}
              </select>
              <select className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700" value={filterIntake} onChange={e => setFilterIntake(e.target.value)}>
                {intakes.map(c => <option key={c} value={c}>Intake: {c}</option>)}
              </select>
              <select className="bg-white/50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {statuses.map(c => <option key={c} value={c}>Status: {c}</option>)}
              </select>
            </div>

            <div className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Showing {filteredAndSorted.length} of {DEMO_PARTNERS.length} partners
            </div>
          </GlassPanel>

          {/* ── SECTION 3: Partner Cards Grid ── */}
          {filteredAndSorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAndSorted.map(partner => (
                <GlassCard key={partner.id} className="p-5 border border-white/40 hover:shadow-lg transition-shadow flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3 items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getAvatarColor(partner.name)} shadow-inner`}>
                        {partner.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{partner.name}</h3>
                        <p className="text-xs text-slate-500">Joined {partner.joined}</p>
                      </div>
                    </div>
                    {/* TODO: Real match score will include publication count, citation score, and shared research keywords */}
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getMatchScoreColor(partner.matchScore)}`}
                      title="Match score based on target country, degree level, research interests, intake, and CGPA. Future versions will also factor in publications, citations, and research experience."
                    >
                      {partner.matchScore}% Match
                    </span>
                  </div>

                  <div className="mb-4 space-y-1.5">
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <i className="ti ti-book text-slate-400"></i> {partner.degreeLevel} in {partner.major}
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5">
                      <i className="ti ti-map-pin text-slate-400"></i> {partner.targetUniversity}, {partner.targetCountry}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 border border-slate-200 text-slate-600 font-medium">CGPA: {partner.cgpa}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-100 border border-slate-200 text-slate-600 font-medium">Intake: {partner.intake}</span>
                    <span className={`px-2 py-0.5 rounded text-xs border font-medium ${partner.status === 'Accepted' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      {partner.status}
                    </span>
                  </div>

                  <div className="mb-4 flex-1">
                    <p className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wider">Research Interests</p>
                    <div className="flex flex-wrap gap-1.5">
                      {partner.researchInterests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                          {interest}
                        </span>
                      ))}
                      {partner.researchInterests.length > 3 && (
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
                          +{partner.researchInterests.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100/50">
                    <PrimaryButton className="flex-1 text-sm py-2" onClick={() => handleConnect(partner.name)}>
                      Connect
                    </PrimaryButton>
                    <button
                      onClick={() => {
                        setSelectedPartner(partner);
                        setExpandedDescriptions({});
                      }}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent transition-all"
                    >
                      View Profile
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-strong rounded-3xl border border-white/30">
              <i className="ti ti-mood-empty text-5xl text-slate-300 mb-4 block"></i>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No partners found</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">We couldn't find anyone matching your exact filters. Try adjusting your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery(''); setFilterCountry('All'); setFilterDegree('All');
                  setFilterMajor('All'); setFilterIntake('All'); setFilterStatus('All');
                }}
                className="text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* ── SECTION 6: Coming Soon Banner ── */}
          <div className="relative overflow-hidden mt-10 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-8 shadow-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Full Matching Engine Coming Soon
              </h2>
              <p className="text-slate-600 mb-6">Our team is building an advanced compatibility engine.</p>

              <ul className="space-y-3 mb-8">
                {['AI-powered compatibility matching based on research interests', 'In-platform messaging between matched partners', 'Group study rooms for same-destination students', 'Mentor matching with alumni who studied abroad', 'Verified profile badges'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <i className="ti ti-check text-primary mt-0.5"></i> {item}
                  </li>
                ))}
              </ul>

              <PrimaryButton onClick={() => toast.success('You will be notified when this launches!')} className="px-8">
                Get Notified
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: My Profile Preview (Sidebar) ── */}
        <div className="space-y-6">
          <GlassPanel className="p-6 border border-white/40 sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 pb-3 border-b border-slate-200/50">Your Profile as Others See It</h3>

            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-md ${getAvatarColor(user?.fullName)}`}>
                {user?.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'ME'}
              </div>
              <h4 className="font-bold text-lg text-slate-900">{user?.fullName || 'User Name'}</h4>
              <p className="text-sm text-slate-500">{user?.degreeLevel || 'Degree not set'} in {user?.major || 'Major not set'}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">CGPA</span>
                <span className="font-semibold text-slate-800">{user?.cgpa || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Target</span>
                <span className="font-semibold text-slate-800">{user?.preferredCountry || 'Not set'}</span>
              </div>
            </div>

            {isProfileIncomplete ? (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-xs text-amber-800 font-medium mb-3">Complete your profile to get better matches and appear in search results.</p>
                <Link to="/profile" className="inline-block text-xs font-bold bg-amber-100 text-amber-700 px-4 py-2 rounded-full hover:bg-amber-200 transition-colors">
                  Complete Profile -&gt;
                </Link>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center text-xs text-green-800 font-medium">
                <i className="ti ti-circle-check text-green-600 inline mr-1"></i> Your profile is complete and ready for matching.
              </div>
            )}
          </GlassPanel>
        </div>

      </div>

      {/* ── SECTION 4: Partner Detail Modal ── */}
      {selectedPartner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPartner(null); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col animate-in fade-in zoom-in-95 duration-200"
            style={{ maxHeight: '88vh' }}
          >
            {/* ── Modal Header (sticky) ── */}
            <div className="flex-none px-6 pt-6 pb-5 border-b border-slate-100 relative">
              <button
                onClick={() => setSelectedPartner(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                aria-label="Close modal"
              >
                <i className="ti ti-x text-xl"></i>
              </button>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className={`w-16 h-16 flex-none rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-inner ${getAvatarColor(selectedPartner.name)}`}>
                  {selectedPartner.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">{selectedPartner.name}</h2>
                    {/* TODO: Real match score will include publication count, citation score, and shared research keywords */}
                    <span
                      className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${getMatchScoreColor(selectedPartner.matchScore)}`}
                      title="Match score based on target country, degree level, research interests, intake, and CGPA. Future versions will also factor in publications, citations, and research experience."
                    >
                      {selectedPartner.matchScore}% Match
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${selectedPartner.status === 'Accepted' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {selectedPartner.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm">{selectedPartner.degreeLevel} candidate in {selectedPartner.major}</p>
                </div>
              </div>
            </div>

            {/* ── Modal Body (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Bio */}
              <p className="text-sm text-slate-700 leading-relaxed">{selectedPartner.bio}</p>

              {/* Application Details + Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <i className="ti ti-map-pin text-primary mt-0.5 flex-none"></i>
                      <div>
                        <span className="font-semibold text-slate-800">{selectedPartner.targetUniversity}</span>
                        <p className="text-slate-500">{selectedPartner.targetCountry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ti ti-calendar text-primary flex-none"></i>
                      <span className="text-slate-700">Intake: {selectedPartner.intake}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ti ti-award text-primary flex-none"></i>
                      <span className="text-slate-700">CGPA: {selectedPartner.cgpa}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPartner.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Research Interests */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Research Interests</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPartner.researchInterests.map(interest => (
                    <span key={interest} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold border border-primary/20">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Interest Overlap */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <h5 className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1.5">
                    <i className="ti ti-bulb"></i> Interest Overlap
                  </h5>
                  <p className="text-sm text-green-700">
                    You both share interests in <strong>{selectedPartner.researchInterests[0]}</strong> and <strong>{selectedPartner.researchInterests[1] || selectedPartner.major}</strong>.
                  </p>
                </div>
              </div>

              {/* ── Academic Portfolio ── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <i className="ti ti-briefcase text-primary text-base"></i>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Academic Portfolio</h4>
                </div>

                {!hasAnyPortfolio(selectedPartner.portfolio) ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-6 text-center">
                    <i className="ti ti-folder-off text-3xl text-slate-300 block mb-2"></i>
                    <p className="text-sm text-slate-400">This student has not added their academic portfolio yet.</p>
                  </div>
                ) : (
                  <div className="space-y-1">

                    {/* SECTION A — Publications */}
                    <CollapsibleSection
                      icon="ti-file-text"
                      title="Publications"
                      count={selectedPartner.portfolio?.publications?.length || 0}
                      defaultOpen={(selectedPartner.portfolio?.publications?.length || 0) > 0}
                    >
                      {(selectedPartner.portfolio?.publications?.length || 0) === 0 ? (
                        <p className="text-sm text-slate-400 px-1">No publications listed yet.</p>
                      ) : (
                        selectedPartner.portfolio.publications.map((pub) => (
                          <div key={pub.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPublicationTypeColor(pub.type)}`}>
                                {pub.type}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPublicationStatusColor(pub.status)}`}>
                                {pub.status?.replace('_', ' ')}
                              </span>
                              {pub.citations > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  <i className="ti ti-quote text-[9px]"></i> Cited by {pub.citations}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-900 leading-snug mb-1">{pub.title}</p>
                            <p className="text-xs text-slate-500 italic mb-1">{pub.authors}</p>
                            <p className="text-xs text-slate-600 mb-1.5">
                              {pub.journal} &middot; {pub.year}
                            </p>
                            {pub.doi && (
                              <a
                                href={`https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                              >
                                <i className="ti ti-external-link text-[10px]"></i>
                                DOI: {pub.doi}
                              </a>
                            )}
                          </div>
                        ))
                      )}
                    </CollapsibleSection>

                    {/* SECTION B — Articles and Blog Posts */}
                    <CollapsibleSection
                      icon="ti-article"
                      title="Articles and Blog Posts"
                      count={selectedPartner.portfolio?.articles?.length || 0}
                      defaultOpen={(selectedPartner.portfolio?.articles?.length || 0) > 0}
                    >
                      {(selectedPartner.portfolio?.articles?.length || 0) === 0 ? (
                        <p className="text-sm text-slate-400 px-1">No articles listed yet.</p>
                      ) : (
                        selectedPartner.portfolio.articles.map((article) => {
                          const tags = article.tags ? article.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                          return (
                            <div key={article.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getPlatformColor(article.platform)}`}>
                                  {article.platform}
                                </span>
                                {article.publishedAt && (
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-bold text-slate-900 leading-snug mb-1.5">{article.title}</p>
                              <p className="text-xs text-slate-600 leading-relaxed mb-2 line-clamp-2">{article.summary}</p>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {article.url && (
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline mt-1"
                                >
                                  <i className="ti ti-external-link text-[10px]"></i>
                                  Read Article
                                </a>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CollapsibleSection>

                    {/* SECTION C — Research Experience */}
                    <CollapsibleSection
                      icon="ti-microscope"
                      title="Research Experience"
                      count={selectedPartner.portfolio?.researchExperience?.length || 0}
                      defaultOpen={true}
                    >
                      {(selectedPartner.portfolio?.researchExperience?.length || 0) === 0 ? (
                        <p className="text-sm text-slate-400 px-1">No research experience listed yet.</p>
                      ) : (
                        selectedPartner.portfolio.researchExperience.map((exp) => {
                          const descKey = `exp-${selectedPartner.id}-${exp.id}`;
                          const isDescExpanded = expandedDescriptions[descKey] || false;
                          const skills = exp.skills ? exp.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                          const dateRange = exp.isCurrent
                            ? `${exp.startDate} — Present`
                            : `${exp.startDate} — ${exp.endDate || 'Present'}`;

                          return (
                            <div key={exp.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                              {/* Ongoing indicator */}
                              {exp.isCurrent && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    Ongoing
                                  </span>
                                </div>
                              )}

                              <p className="text-sm font-bold text-slate-900 leading-snug mb-1">{exp.title}</p>
                              <p className="text-xs text-slate-500 mb-0.5">
                                {exp.institution}
                                {exp.department && <span> &middot; {exp.department}</span>}
                              </p>
                              {exp.supervisor && (
                                <p className="text-xs text-slate-500 mb-1">Supervisor: {exp.supervisor}</p>
                              )}
                              <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1">
                                <i className="ti ti-calendar-event text-[10px]"></i>
                                {dateRange}
                              </p>

                              {exp.description && (
                                <div className="mb-2">
                                  <p className={`text-xs text-slate-600 leading-relaxed ${isDescExpanded ? '' : 'line-clamp-3'}`}>
                                    {exp.description}
                                  </p>
                                  {exp.description.length > 150 && (
                                    <button
                                      onClick={() => toggleDescription(descKey)}
                                      className="text-[11px] font-semibold text-primary hover:underline mt-1"
                                    >
                                      {isDescExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </div>
                              )}

                              {skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {skills.map(skill => (
                                    <span key={skill} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[10px] font-semibold border border-primary/15">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {exp.fundingSource && (
                                <p className="text-[11px] text-slate-400 mt-2 italic">
                                  <i className="ti ti-coin text-[10px] mr-0.5"></i>
                                  Funding: {exp.fundingSource}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CollapsibleSection>

                  </div>
                )}
              </div>
            </div>

            {/* ── Modal Footer — Action Buttons (sticky) ── */}
            <div className="flex-none px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <PrimaryButton
                  className="flex-1 py-3"
                  onClick={() => {
                    toast.success(`Connection request sent to ${selectedPartner.name}! (Demo)`);
                    setSelectedPartner(null);
                  }}
                >
                  <i className="ti ti-user-plus mr-2"></i> Connect
                </PrimaryButton>
                <a
                  href={selectedPartner.linkedin}
                  className="flex-1 flex justify-center items-center py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  <i className="ti ti-brand-linkedin text-xl mr-2"></i> LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
