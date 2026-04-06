# FutureWings - Smart Path to Study Abroad

> **Your AI-powered companion for navigating international education. Discover universities, track applications, get visa insights, and connect with a global community of aspiring scholars.**

[![GitHub](https://img.shields.io/badge/GitHub-md--sazid9089-blue?logo=github&style=flat-square)](https://github.com/md-sazid9089/FutureWings_Smart_Path_to_Study_Abroad)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js&style=flat-square)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react&style=flat-square)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-38B2AC?logo=tailwind-css&style=flat-square)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Database-SQL%20Server-CC2927?logo=microsoft-sql-server&style=flat-square)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## Problem → Solution

**Problem:** Thousands of aspiring international students struggle to navigate the study abroad process - scattered information, complex application procedures, visa uncertainties, and information overload.

**Solution:** FutureWings is a unified platform that simplifies the entire study abroad journey through AI-assisted guidance, comprehensive university databases, application tracking, and community insights.

---

## Key Features

### **For Students**
- **Smart University Discovery** - Browse 10,000+ universities across 150+ countries with intelligent filtering
- **Personalized Recommendations** - AI-powered program matching based on CGPA, major, and budget
- **Application Tracking** - Centralized dashboard to manage multiple applications and deadlines
- **Document Management** - Upload and share documents via Google Drive/OneDrive links with verification status
- **Visa Outcome Tracking** - Record visa decisions and outcomes for reference
- **Country Ratings** - Rate universities and countries based on real student experiences
- **AI Assistant** - Chat with our AI for personalized advice on applications, visas, and programs
- **Study Abroad News** - Stay updated on policy changes, scholarships, and international education trends
- **Scholarship Database** - Discover and apply for scholarships from leading institutions

### **For Administrators**
- **Dashboard Analytics** - Overview of users, applications, and platform metrics
- **University Management** - Add/edit/delete universities and programs
- **User Management** - Monitor and manage user accounts
- **Application Management** - Review and process applications
- **Content Moderation** - Manage news articles and announcements
- **Document Verification** - Verify submitted user documents
- **Scholarship Management** - Update scholarship opportunities

---

## Tech Stack

### **Frontend**
- **Framework** - React 18 with Vite
- **Styling** - Tailwind CSS 4.0
- **Design System** - Glassmorphism with custom utilities
- **Routing** - React Router v6
- **State Management** - React Hooks
- **Toast Notifications** - React Hot Toast
- **Icons** - Hero Icons v2
- **HTTP Client** - Axios with JWT interceptors

### **Backend**
- **Runtime** - Node.js with Express.js
- **Database ORM** - Prisma
- **Database** - SQL Server (Windows Authentication)
- **Authentication** - JWT + Bcrypt
- **Environment** - .env configuration
- **API** - RESTful architecture
- **Deployment** - Vercel

### **DevOps & Tools**
- **Version Control** - Git & GitHub
- **Package Manager** - npm
- **Code Quality** - ESLint (frontend)
- **Build Tool** - Vite

---

## Project Structure

```
FutureWings_Smart_Path_to_Study_Abroad/
├── frontend/                              # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Landing page
│   │   │   ├── News.jsx                  # News listing
│   │   │   ├── NewsArticle.jsx           # Individual article view
│   │   │   ├── Documents.jsx             # Drive link document management
│   │   │   ├── Applications.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   └── admin/                    # Admin pages
│   │   ├── components/
│   │   │   ├── ui/                       # Reusable UI components
│   │   │   ├── home/                     # Landing page sections
│   │   │   ├── GlassNavbar.jsx
│   │   │   ├── GlassSidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── AppLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── api/
│   │   │   ├── axios.js                  # HTTP client setup
│   │   │   └── adminService.js
│   │   ├── App.jsx                       # Main routing
│   │   └── index.css                     # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                               # Express server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── documents.js              # Drive link document endpoints
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── applications.js
│   │   │   ├── countries.js
│   │   │   ├── universities.js
│   │   │   ├── ai-assistant.js
│   │   │   └── admin.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── admin.js
│   │   ├── prisma/
│   │   │   └── client.js
│   │   └── utils/
│   │       └── response.js
│   ├── prisma/
│   │   ├── schema.prisma                 # Database schema
│   │   ├── seed.js
│   │   └── migrations/
│   ├── server.js                         # Entry point
│   ├── package.json
│   └── .env
│
└── config/                                # Configuration files
    └── mcporter.json
```

---

## Quick Start

### **Prerequisites**
- Node.js v18+ 
- SQL Server (Windows Authentication)
- npm or yarn
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/md-sazid9089/FutureWings_Smart_Path_to_Study_Abroad.git
cd FutureWings_Smart_Path_to_Study_Abroad
```

2. **Backend Setup**
```bash
cd backend
npm install

# Configure database in .env
# DATABASE_URL="sqlserver://localhost:PORT;database=DB_NAME;integratedSecurity=true;..."
# JWT_SECRET="your_jwt_secret"

# Database-first sync (introspect existing DB schema)
npm run db:sync

# Optional: seed sample data
npx prisma db seed

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Start development server
npm run dev
# App runs on http://localhost:5173
```

---

## Recent Updates (April 2026)

### Feature Highlights

#### **Document Upload with Drive Links** (Latest)
- Users can now add documents via **Google Drive** or **OneDrive** links
- Replaced traditional file uploads for easier document management
- Admin verification system for submitted documents
- Modal-based interface for seamless UX
- No database changes required - uses existing schema

#### **News & Articles System** (Latest)
- Comprehensive **news listing page** with category filtering
- **Full article detail pages** with deep content
- **Related articles** section for content discovery
- Policy updates, scholarship news, rankings, and trends
- Newsletter subscription CTA
- Date-based sorting

#### **Removed Features**
- Emoji usage (now using standard text/symbols)
- Unused icon imports
- Em-dash decorations (replaced with hyphens)

---

## API Endpoints

### **Documents**
```
GET    /api/documents              # List user's documents
POST   /api/documents              # Add new document link
GET    /api/documents/:id          # Get specific document
```

**Example Request:**
```bash
POST /api/documents
Content-Type: application/json

{
  "filePath": "https://drive.google.com/file/d/...",
  "fileType": "Passport"
}
```

### **News**
```
Frontend only - no backend API needed
All data managed in NewsArticle.jsx
```

### **Authentication**
```
POST   /api/auth/signup            # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/admin-login       # Admin login
```

### **Users**
```
GET    /api/user/me                # Get current user profile
PUT    /api/user/:id               # Update user profile
```

### **Applications**
```
GET    /api/applications           # List user's applications
POST   /api/applications           # Create new application
GET    /api/applications/:id       # Get application details
```

### **More Endpoints**
- `/api/countries` - Country information
- `/api/universities` - University listings
- `/api/programs` - Program details
- `/api/scholarships` - Scholarship database
- `/api/recommendations` - AI recommendations
- `/api/ratings` - User ratings
- `/api/admin/*` - Admin operations

---

## Design System

### **Color Palette**
- **Primary** - #ff6b3d (Warm Orange)
- **Secondary** - #51607a (Dark Blue-Grey)
- **Accent** - #3b82f6 (Bright Blue)
- **Success** - #10b981 (Emerald)
- **Warning** - #f59e0b (Amber)
- **Danger** - #ef4444 (Red)

### **Typography**
- **Font Family** - Inter, system fonts
- **Headings** - Bold, extrabold weights
- **Body** - Regular weight, 16px
- **Captions** - Small, muted colors

### **Components**
- Glass cards with blur effects
- Smooth transitions and hover states
- Responsive grid layouts
- Accessible focus rings
- Loading skeletons

---

## Security Features

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (USER/ADMIN)
- Protected routes on frontend
- Environment variable management
- CORS enabled for trusted origins
- Input validation on backend

---

## Database Schema

### **Core Models**
- **User** - Student profiles with CGPA and academic details
- **UserDocument** - Document management with verification tracking
- **Country** - Study destination information
- **University** - Institution details with tiers
- **Program** - Degree programs with tuition info
- **Application** - Application tracking
- **VisaOutcome** - Visa decision records
- **Scholarship** - Funding opportunities
- **CountryRating** - Student experience ratings
- **ApplicationStatus** - Application workflow states

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
```bash
git clone https://github.com/YOUR_USERNAME/FutureWings_Smart_Path_to_Study_Abroad.git
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes** and commit
```bash
git commit -m "feat: description of your changes"
```

4. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

5. **Create a Pull Request** on the main repository

### **Commit Message Guidelines**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation updates
- `style:` - CSS/styling changes
- `test:` - Test additions

---

## Environment Variables

### **Backend (.env)**
```env
# Database
DATABASE_URL="sqlserver://localhost:PORT;database=FutureWings_Smart_Path_to_Study_Abroad;integratedSecurity=true;trustServerCertificate=true;encrypt=false"

# Authentication
JWT_SECRET="your_jwt_secret_key_here"

# Server
PORT=5000
NODE_ENV=development
```

### **Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=FutureWings
```

---

## Troubleshooting

### **Database Connection Issues**
```bash
# Database-first re-sync
npm run db:sync

# Verify connection
curl http://localhost:5000/api/health
```

### **Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
npm run dev
```

### **Port Already in Use**
```bash
# Backend on different port
PORT=3001 npm run dev

# Frontend on different port
npm run dev -- --port 5173
```

---

## Contact & Support

- **GitHub** - [@md-sazid9089](https://github.com/md-sazid9089)
- **Email** - irfanzahit184@gmail.com
- **Report Issues** - [GitHub Issues](https://github.com/md-sazid9089/FutureWings_Smart_Path_to_Study_Abroad/issues)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **UI Inspiration** - urann.netlify.app glassmorphism design
- **Tailwind CSS** - For the amazing utility-first CSS framework
- **Prisma** - For simplified database management
- **React Community** - For the ecosystem and tools

---

## Roadmap

### **Q2 2026**
- [ ] Mobile app (React Native)
- [ ] Video call consultations with advisors
- [ ] Advanced search filters
- [ ] Payment gateway integration

### **Q3 2026**
- [ ] Machine learning for visa prediction
- [ ] Chatbot for 24/7 support
- [ ] Community forums
- [ ] Internship tracking

### **Q4 2026**
- [ ] University partnerships
- [ ] Direct application portals
- [ ] Scholarship matching algorithm
- [ ] Multi-language support

---

<div align="center">

### Made with love for global education access

**FutureWings - Your smart path to studying abroad**

If this project helped you, please star the repository!

</div>
