# ContractIQ - AI Contract Analysis Platform

A full-stack SaaS prototype for AI-powered contract analysis with multi-tenant isolation, document parsing, vector search, and business intelligence dashboard.

## 🚀 Features

### Authentication & Multi-Tenancy
- JWT-based authentication with secure login/signup
- Multi-tenant data isolation (all operations scoped to user_id)
- Demo credentials for easy testing

### Document Management
- Drag & drop file upload (PDF, TXT, DOCX)
- Real-time upload progress tracking
- Mock LlamaCloud document parsing simulation
- Automatic document chunking and embedding generation

### AI-Powered Analysis
- Natural language query interface
- Vector similarity search with pgvector
- Contract risk assessment and scoring
- Key clause extraction and classification
- Automated insights and recommendations

### Business Dashboard
- Professional SaaS-style interface
- Contract overview with filtering and search
- Detailed contract analysis pages
- Risk scoring and status tracking
- Evidence-based recommendations

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- Responsive design optimized for desktop and mobile

### Backend (Planned)
- **FastAPI** (Python) for REST API
- **JWT** authentication
- **PostgreSQL** with **pgvector** extension
- **Supabase** for database hosting
- Multi-tenant data architecture

### Database Schema
```sql
-- Users table
users (
  user_id UUID PRIMARY KEY,
  username VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table
documents (
  doc_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  filename VARCHAR NOT NULL,
  uploaded_on TIMESTAMP DEFAULT NOW(),
  expiry_date DATE,
  status VARCHAR CHECK (status IN ('Active', 'Renewal Due', 'Expired')),
  risk_score VARCHAR CHECK (risk_score IN ('Low', 'Medium', 'High'))
);

-- Chunks table with vector embeddings
chunks (
  chunk_id UUID PRIMARY KEY,
  doc_id UUID REFERENCES documents(doc_id),
  user_id UUID REFERENCES users(user_id),
  text_chunk TEXT NOT NULL,
  embedding VECTOR(384), -- pgvector extension
  metadata JSONB,
  page_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Demo Credentials

For testing the application:
- **Email**: demo@contractiq.com
- **Password**: demo123

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contract-analysis-saas
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Backend Setup (Production)

### Environment Variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/contractiq
JWT_SECRET=your-super-secure-jwt-secret
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
```

### Database Setup
1. Install PostgreSQL with pgvector extension
2. Run the migration scripts to create tables
3. Enable Row Level Security (RLS) for multi-tenant isolation

### API Endpoints
```python
# Authentication
POST /api/signup
POST /api/login

# Document Management  
POST /api/upload          # Upload and parse documents
GET  /api/contracts       # List user's contracts
GET  /api/contracts/:id   # Get contract details

# AI Query
POST /api/ask            # Natural language query endpoint
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Emerald (#14B8A6)  
- **Accent**: Orange (#F97316)
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#EAB308)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **Headings**: 120% line height
- **Body**: 150% line height
- **Font weights**: 400 (normal), 500 (medium), 700 (bold)

### Spacing
- 8px grid system
- Consistent padding and margins
- Responsive breakpoints

## 📱 Responsive Design

- **Mobile**: < 768px - Stack layout, touch-optimized
- **Tablet**: 768px - 1024px - Hybrid layout
- **Desktop**: > 1024px - Full sidebar layout

## 🔒 Security Features

- JWT token authentication
- Multi-tenant data isolation
- Row Level Security (RLS) policies
- Secure file upload validation
- Input sanitization and validation

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend (Render/Heroku)
```bash
# Deploy FastAPI application
# Configure environment variables
# Connect to Supabase database
```

## 📊 Business Value

### For Legal Teams
- **Risk Management**: Automated risk scoring and alerts
- **Compliance**: Standardized clause analysis
- **Efficiency**: Reduce contract review time by 70%

### For Business Users  
- **Insights**: Plain English contract summaries
- **Deadlines**: Automated renewal reminders
- **Intelligence**: Data-driven contract decisions

## 🧪 Testing

The application includes comprehensive error handling and loading states:
- Upload progress tracking
- Network error handling
- Empty state management
- Form validation
- Responsive error messages

## 📝 Mock Data

The frontend includes realistic mock data for demonstration:
- Sample contracts with various statuses
- AI-generated insights and recommendations  
- Simulated document parsing results
- Natural language query responses

## 🔮 Future Enhancements

- Advanced contract analytics and reporting
- Integration with legal databases
- Automated contract generation
- Collaborative review workflows
- Mobile application
- Advanced ML models for better accuracy

## 📄 License

This project is built for demonstration purposes and showcases modern full-stack development practices with AI integration.

## 🤝 Contributing

This is a prototype for evaluation. For production use, consider:
- Implementing proper backend with FastAPI
- Setting up production database with proper indexing
- Adding comprehensive test coverage
- Implementing proper error monitoring
- Adding audit logs and compliance features

---

Built with ❤️ using React, TypeScript, and Tailwind CSS