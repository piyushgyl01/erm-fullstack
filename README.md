# Engineering Resource Management System (ResourceHub)

![ResourceHub Banner](https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=300&q=80)

A comprehensive full-stack application for managing engineering team assignments, tracking capacity allocation, and optimizing resource utilization across projects.

## 🌐 Live Demo

**Try the application now:**
- **Frontend Application**: [https://erm-v2.vercel.app/login](https://erm-v2.vercel.app/login)
- **Backend API**: [https://erm-server-v1.onrender.com](https://erm-server-v1.onrender.com)

*Use the demo credentials below to explore the full functionality*

## 🚀 Features

### 👥 **Team Management**
- **Role-based Access Control**: Separate interfaces for Managers and Engineers
- **Engineer Profiles**: Skills tracking, seniority levels, and capacity management
- **Real-time Capacity Monitoring**: Visual indicators for workload allocation

### 📊 **Project Management**
- **Project Lifecycle Tracking**: From planning to completion
- **Skill Matching**: Automatic engineer-to-project compatibility analysis
- **Team Size Planning**: Resource requirement forecasting

### 📅 **Assignment System**
- **Smart Allocation**: Prevent over-allocation with real-time capacity checks
- **Flexible Scheduling**: Date range management with conflict detection
- **Role Assignment**: Define specific responsibilities (Tech Lead, Developer, etc.)

### 📈 **Analytics Dashboard**
- **Utilization Metrics**: Team-wide capacity analysis
- **Performance Insights**: Project completion rates and efficiency tracking
- **Resource Optimization**: Identify bottlenecks and opportunities

### 🔐 **Authentication & Security**
- **JWT-based Authentication**: Secure session management
- **Password Encryption**: bcrypt implementation
- **Protected Routes**: Role-based access control

## 🛠 Tech Stack

### **Frontend**
- **React 19** - Latest React features with concurrent rendering
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **ShadCN UI** - Beautiful, accessible component library
- **React Hook Form + Zod** - Type-safe form validation
- **Recharts** - Responsive chart library for data visualization
- **React Router** - Client-side routing with lazy loading

### **Backend**
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - Document database with ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing and security

### **Development Tools**
- **ESLint + TypeScript ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **Vercel/Render** - Cloud deployment platforms

## 📁 Project Structure

```
engineering-resource-management/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # ShadCN UI components
│   │   │   └── layout/        # Layout components
│   │   ├── contexts/          # React Context providers
│   │   ├── pages/             # Route components
│   │   ├── services/          # API service layer
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript definitions
│   ├── public/                # Static assets
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express route handlers
│   ├── middleware/            # Authentication & validation
│   ├── controllers/           # Business logic
│   └── server.js              # Express server setup
│
└── README.md
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB)
- Git

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/piyushgyl01/erm-fullstack
cd engineering-resource-management
```

2. **Backend Setup**
```bash
cd server
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
PORT=3004" > .env

# Start the server
npm run dev
```

3. **Frontend Setup**
```bash
cd ../client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3004/api" > .env

# Start the development server
npm run dev
```

4. **Create Sample Data**
Visit `http://localhost:3000` and use the "Create Demo Data" button, or:
```bash
curl -X POST http://localhost:3004/api/seed
```

### **Demo Credentials**
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Manager | manager@company.com | password123 | Full system access |
| Senior Engineer | john@company.com | password123 | Assignment viewing |
| Backend Engineer | alice@company.com | password123 | Personal dashboard |
| Frontend Engineer | bob@company.com | password123 | Project information |

## 📡 API Documentation

### **Authentication Endpoints**
```typescript
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### **Engineer Management**
```typescript
GET /api/engineers                    # List all engineers
GET /api/engineers/:id/capacity       # Check available capacity
```

### **Project Management**
```typescript
GET    /api/projects                  # List projects
POST   /api/projects                  # Create project (Manager only)
GET    /api/projects/:id              # Get project details
PUT    /api/projects/:id              # Update project (Manager only)
DELETE /api/projects/:id              # Delete project (Manager only)
```

### **Assignment Management**
```typescript
GET    /api/assignments               # List assignments
POST   /api/assignments               # Create assignment (Manager only)
PUT    /api/assignments/:id           # Update assignment (Manager only)
DELETE /api/assignments/:id           # Delete assignment (Manager only)
```

### **Analytics**
```typescript
GET /api/analytics/utilization        # Team utilization data (Manager only)
```

---

## 💡 Lessons Learned: AI as a Learning Accelerator

This project represents a transformation in how I approach software development. AI didn't replace my thinking—it amplified it and accelerated my learning journey. Here are the key insights:

### **AI Enhanced My Development Process**
- **Boilerplate Generation**: AI helped rapidly scaffold components, API routes, and database schemas
- **Pattern Recognition**: AI helped me identify common architectural patterns and industry best practices
- **Learning Acceleration**: Complex concepts became accessible through AI-guided explanations and examples
- **Code Quality**: Improved through AI-powered code reviews and optimization suggestions
- **Documentation**: AI assisted in writing clearer, more comprehensive documentation

### **AI-Assisted Learning Benefits**
- **Faster Onboarding**: Quickly understood new libraries and frameworks (React 19, ShadCN UI)
- **Best Practices**: Learned industry standards for authentication, state management, and API design
- **Debugging Support**: AI helped identify and resolve complex issues faster
- **Architecture Guidance**: Received recommendations for scalable, maintainable code structure

### **AI Tools Used**
- **Claude (Anthropic)** - Architecture guidance, boilerplate generation, and comprehensive code reviews
- **ChatGPT** - Problem-solving, debugging assistance, and learning complex concepts

**Built with ❤️ and 🤖 AI assistance for accelerated learning and development**