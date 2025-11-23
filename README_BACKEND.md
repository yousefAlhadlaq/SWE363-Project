# Quroosh Backend - Team Implementation Guide

## 📋 Quick Overview

You have **10 days** to build a complete Node.js + Express.js + MongoDB backend for the Quroosh Personal Finance Management app.

**Team Size**: 4 members
**Timeline**: 10 days
**Testing**: Manual with Postman (no unit tests)
**Focus**: Working features > Perfect code

---

## 📚 Documentation Files

### Start Here
1. **[10_DAY_QUICK_TIMELINE.md](10_DAY_QUICK_TIMELINE.md)** ⭐ **READ THIS FIRST**
   - Day-by-day breakdown
   - What each person does each day
   - Critical path if you fall behind
   - Daily checklists

2. **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** ⭐ **FOR SETUP**
   - 5-minute setup instructions
   - MongoDB Atlas configuration
   - Testing with Postman
   - Common issues & solutions

### Detailed References
3. **[BACKEND_IMPLEMENTATION_PLAN.md](BACKEND_IMPLEMENTATION_PLAN.md)**
   - Complete database schema (8 models)
   - All API endpoints (60+)
   - Code examples
   - Best practices

### Individual Task Lists (Optional - Use if you need more detail)
4. **[TEAM_MEMBER_1_TASKS.md](TEAM_MEMBER_1_TASKS.md)** - Authentication & Users
5. **[TEAM_MEMBER_2_TASKS.md](TEAM_MEMBER_2_TASKS.md)** - Expenses & Categories
6. **[TEAM_MEMBER_3_TASKS.md](TEAM_MEMBER_3_TASKS.md)** - Investments & Goals
7. **[TEAM_MEMBER_4_TASKS.md](TEAM_MEMBER_4_TASKS.md)** - Dashboard & Integration

---

## 🚀 Getting Started (First 30 Minutes)

### Step 1: Read This (5 min)
You're doing it now! ✓

### Step 2: Quick Start (15 min)
Follow **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** to:
- Set up MongoDB Atlas
- Create project structure
- Install dependencies

### Step 3: Check Timeline (10 min)
Read **[10_DAY_QUICK_TIMELINE.md](10_DAY_QUICK_TIMELINE.md)** to understand:
- What you're building each day
- Your individual responsibilities
- How everything connects

---

## 👥 Team Responsibilities

### Team Member 1: Authentication & User Management
**What you build**:
- User registration & login (JWT)
- Authentication middleware (protect routes)
- User profile management
- Password reset

**Dependencies**: None - Everyone depends on YOU
**Priority**: HIGHEST - Start immediately

---

### Team Member 2: Expenses, Income & Categories
**What you build**:
- Categories (create, edit, delete, list)
- Expenses (CRUD + filtering + statistics)
- Income tracking

**Dependencies**: Team Member 1 (auth middleware)
**Priority**: HIGH - Core feature

---

### Team Member 3: Investments, Budgets & Goals
**What you build**:
- Investment portfolio (stocks, real estate, crypto, gold)
- Budget management
- Financial goals
- Zakah calculations

**Dependencies**: Team Member 1 (auth), Team Member 2 (categories for budgets)
**Priority**: HIGH - Core feature

---

### Team Member 4: Dashboard, Integration & Deployment
**What you build**:
- Express app setup (middleware, error handling)
- Dashboard analytics
- Advisor management
- Final integration
- Deployment

**Dependencies**: Everyone (integrates all modules)
**Priority**: MEDIUM initially, HIGHEST on Days 7-10

---

## 📅 10-Day Timeline Summary

### Days 1-2: Setup & Models
- Everyone: Set up together
- Individual: Create your models and basic CRUD

### Days 3-4: Complete CRUD & Filtering
- Finish all Create, Read, Update, Delete operations
- Add filtering and search

### Days 5-6: Statistics & Integration
- Add analytics and calculations
- Integrate all modules

### Days 7-8: Polish & Documentation
- Fix bugs
- Add validation
- Write documentation
- Security review

### Days 9-10: Deploy & Frontend Integration
- Deploy to production
- Connect with frontend
- Final testing

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
By Day 10, you MUST have:
- ✅ User registration & login working
- ✅ Users can create/view/edit/delete expenses
- ✅ Users can create/view/edit/delete investments
- ✅ Dashboard shows overview and recent transactions
- ✅ Backend deployed and accessible
- ✅ Frontend can connect to backend

### Nice to Have (If Time Permits)
- ⭐ Email verification
- ⭐ Advanced statistics
- ⭐ SMS parsing
- ⭐ Advisor booking system

---

## 🛠️ Tech Stack

```json
{
  "runtime": "Node.js v18+",
  "framework": "Express.js",
  "database": "MongoDB (Atlas)",
  "authentication": "JWT + bcryptjs",
  "validation": "express-validator",
  "security": "helmet, cors, rate-limiting",
  "testing": "Postman (manual)"
}
```

---

## 📦 Project Structure

```
quroosh-backend/
├── src/
│   ├── config/           # Database, JWT config
│   ├── models/           # Mongoose models (8 models)
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth, validation, errors
│   ├── utils/            # Helper functions
│   ├── app.js           # Express app
│   └── server.js        # Entry point
├── .env                 # Environment variables
├── .gitignore
└── package.json
```

---

## 🗄️ Database Models (8 Total)

1. **User** - Authentication & profile
2. **Category** - Expense/income categories
3. **Expense** - Expense transactions
4. **Income** - Income transactions
5. **Budget** - Budget limits
6. **Goal** - Financial goals
7. **Investment** - Portfolio tracking
8. **Advisor** - Financial advisors

---

## 🔌 API Endpoints (60+ Total)

### Authentication (7 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/verify-email

### Expenses (7 endpoints)
- GET /api/expenses (with filters)
- GET /api/expenses/:id
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id
- GET /api/expenses/stats
- POST /api/expenses/bulk

### Investments (7 endpoints)
- GET /api/investments
- GET /api/investments/:id
- POST /api/investments
- PUT /api/investments/:id
- DELETE /api/investments/:id
- GET /api/investments/portfolio
- GET /api/investments/zakah

### Dashboard (5 endpoints)
- GET /api/dashboard/overview
- GET /api/dashboard/financial-status
- GET /api/dashboard/recent-transactions
- GET /api/dashboard/spending-breakdown
- GET /api/dashboard/monthly-comparison

**Plus**: Categories, Incomes, Budgets, Goals, Users, Advisors (similar patterns)

---

## 🔐 Environment Variables

Create `.env` file:

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quroosh

# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Email (Gmail for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@quroosh.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🧪 Testing Strategy

### No Unit Tests - Manual Testing Only

**Use Postman**:
1. Create a collection with all endpoints
2. Test each endpoint as you build it
3. Test with valid data
4. Test with invalid data (errors)
5. Test authentication (with/without token)

**Integration Testing**:
- Test complete user flows
- Example: Register → Login → Create Expense → View Dashboard

---

## 🚨 Common Issues

### MongoDB Connection Failed
```bash
# Check:
1. Connection string in .env
2. IP whitelist in MongoDB Atlas (add 0.0.0.0/0)
3. Username/password are correct
```

### CORS Errors
```javascript
// In app.js, make sure you have:
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### JWT Token Invalid
```bash
# Check:
1. JWT_SECRET is set in .env
2. Token format: "Bearer <token>"
3. Token not expired
```

### Port 5000 Already in Use
```bash
npx kill-port 5000
```

---

## 📞 Communication

### Daily Routine
- **Morning (10 AM)**: Standup (15 min)
  - What did you do yesterday?
  - What will you do today?
  - Any blockers?

- **Afternoon (3 PM)**: Quick sync (10 min)
  - Progress check
  - Help with blockers

- **Evening**: Commit & push code

### When Stuck
1. Try for 30 minutes
2. Search Google/Stack Overflow
3. Ask teammate
4. Ask in group chat

### Git Workflow
```bash
# Daily routine
git pull origin main
git checkout -b feature/your-feature
# ... make changes ...
git add .
git commit -m "feat: add user registration"
git push origin feature/your-feature
# Create Pull Request
```

---

## 🎓 Learning Resources

### Must Read
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - View database
- [Railway](https://railway.app/) - Easy deployment

---

## 🎯 Priority System

If you're falling behind, focus on **P0 first**:

**P0 (Critical - Must Have)**:
- User registration & login
- JWT authentication
- Expense CRUD
- Dashboard overview
- Deployment

**P1 (High - Should Have)**:
- Categories
- Investments
- Budgets
- Statistics

**P2 (Medium - Nice to Have)**:
- Goals
- Advisors
- Advanced filtering

**P3 (Low - Skip if needed)**:
- Email verification
- SMS parsing
- Advanced analytics

---

## 📊 Progress Tracking

### Daily Checklist
Create a shared document where each person updates:
- [ ] Day X - Task completed
- [ ] Endpoints tested
- [ ] Bugs found
- [ ] Blockers

### Week 1 Goal (Days 1-5)
- ✅ All models created
- ✅ All basic CRUD operations working
- ✅ Authentication working

### Week 2 Goal (Days 6-10)
- ✅ All features integrated
- ✅ Documentation complete
- ✅ Deployed to production
- ✅ Frontend connected

---

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easiest)
1. Sign up at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Set environment variables
4. Deploy automatically

### Option 2: Heroku
1. Sign up at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Create new app
4. Set environment variables
5. Deploy via Git

### Option 3: Render
1. Sign up at [render.com](https://render.com)
2. Connect GitHub
3. Configure environment
4. Deploy

---

## ✅ Final Checklist

Before submission:
- [ ] All P0 endpoints working
- [ ] Authentication secure (passwords hashed, JWT working)
- [ ] CORS configured for frontend
- [ ] Environment variables documented
- [ ] README with setup instructions
- [ ] API endpoints documented
- [ ] Deployed to production
- [ ] Frontend can connect
- [ ] Tested complete user flows

---

## 🎉 Success Metrics

You're successful if by Day 10:
1. Backend is deployed and accessible
2. Frontend can register users
3. Frontend can login
4. Users can create expenses and see them
5. Dashboard shows data
6. All team members contributed

---

## 💡 Tips for Success

1. **Start Simple**: Get basic CRUD working before adding features
2. **Test Early**: Test each endpoint immediately after building
3. **Communicate**: Daily standups are critical
4. **Help Each Other**: Team Member 4 helps everyone integrate
5. **Don't Perfectionism**: Working code > perfect code
6. **Commit Often**: Push code at least once per day
7. **Use Postman**: Share collection with team
8. **Focus on P0**: If behind, skip P2/P3 features

---

## 📞 Need Help?

1. Check documentation files
2. Search Stack Overflow
3. Ask teammates
4. Check Express/Mongoose docs
5. Ask instructor (if completely stuck)

---

**Remember**: You're building a real application in 10 days. It won't be perfect, but it WILL work!

**You've got this!** 💪🚀

---

*Good luck from the entire Quroosh team! We're rooting for you!* ❤️
