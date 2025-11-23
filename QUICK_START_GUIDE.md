# Quroosh Backend - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (free tier)
- Code editor (VS Code recommended)
- Postman or Insomnia for API testing

---

## Step 1: Create MongoDB Database (5 minutes)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Sign up** for free account
3. **Create a cluster**:
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select region closest to you
   - Click "Create"
4. **Create database user**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Set role to "Read and write to any database"
5. **Whitelist IP**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
6. **Get connection string**:
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

---

## Step 2: Initialize Backend Project (2 minutes)

```bash
# Create project directory
mkdir quroosh-backend
cd quroosh-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-validator nodemailer express-rate-limit multer

# Install dev dependencies
npm install --save-dev nodemon jest supertest eslint
```

---

## Step 3: Create Project Structure (1 minute)

```bash
# Create folders
mkdir -p src/config src/models src/controllers src/routes src/middleware src/utils tests

# Create files
touch src/server.js src/app.js .env .env.example .gitignore
```

---

## Step 4: Set Up Environment Variables (1 minute)

Create `.env` file:

```env
NODE_ENV=development
PORT=5000

# Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quroosh?retryWrites=true&w=majority

# Generate a random secret (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=7d

# Email (use Gmail for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@quroosh.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: Create `.env.example` with the same structure but without actual values for team sharing.

---

## Step 5: Update package.json Scripts (30 seconds)

Edit `package.json` and add these scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --watchAll --verbose"
  }
}
```

---

## Step 6: Test Your Setup (1 minute)

Create a simple test server to verify everything works:

**src/server.js**:
```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
```

**Run the server**:
```bash
npm run dev
```

**Test in browser**: Go to http://localhost:5000/test

If you see `{"message": "Server is running!"}` and "MongoDB connected successfully" in the console, you're all set! ✅

---

## Team Member Responsibilities Summary

### 👤 Team Member 1 - Authentication & Users
**Priority**: HIGHEST (others depend on this)
- [ ] User registration & login
- [ ] JWT authentication middleware
- [ ] Email verification
- [ ] Password recovery
- [ ] User profile management

**Start with**: User model → Auth controller → JWT middleware

### 💰 Team Member 2 - Expenses & Categories
**Priority**: HIGH
- [ ] Category management (create, edit, delete)
- [ ] Expense tracking
- [ ] Income tracking
- [ ] Spending statistics

**Start with**: Category model → Expense model → Controllers

### 📈 Team Member 3 - Investments & Goals
**Priority**: MEDIUM
- [ ] Investment portfolio tracking
- [ ] Budget management
- [ ] Financial goals
- [ ] Zakah calculations

**Start with**: Investment model → Budget model → Controllers

### 🎯 Team Member 4 - Dashboard & Integration
**Priority**: MEDIUM (but handles final integration)
- [ ] Dashboard analytics
- [ ] Advisor management
- [ ] Middleware setup
- [ ] Error handling
- [ ] Deployment

**Start with**: Express app setup → Middleware → Dashboard

---

## Development Workflow

### Week 1: Foundation
**Everyone**:
1. Set up local environment
2. Create your assigned models
3. Test database connections
4. Daily standup at 10 AM

**Team Member 4 specific**:
- Set up complete project structure
- Create all middleware
- Help others with setup issues

### Week 2-4: Development
1. **Morning**: Review yesterday's work
2. **Work**: Focus on your assigned module
3. **Test**: Test your endpoints with Postman
4. **Push**: Commit and push daily
5. **Evening**: Quick team sync (15 min)

### Week 5: Integration & Testing
1. Integrate all modules
2. Test complete flows
3. Fix bugs
4. Deploy to production

---

## Git Workflow

### Initial Setup
```bash
# Create repository on GitHub
# Clone to your machine
git clone https://github.com/your-team/quroosh-backend.git
cd quroosh-backend
```

### Daily Workflow
```bash
# Start of day - get latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "Add user authentication endpoints"

# Push to your branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# After review and approval, merge to main
```

### Branch Naming Convention
- `feature/auth-system` - Team Member 1
- `feature/expense-tracking` - Team Member 2
- `feature/investments` - Team Member 3
- `feature/dashboard` - Team Member 4
- `bugfix/fix-login-error`
- `hotfix/critical-security-fix`

---

## Testing Your Endpoints

### Using Postman

1. **Install Postman**: https://www.postman.com/downloads/

2. **Create a new request**:
   - Method: POST
   - URL: `http://localhost:5000/api/auth/register`
   - Body → raw → JSON:
   ```json
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "Test123!@#",
     "phoneNumber": "+1234567890"
   }
   ```

3. **Send request** and check response

4. **For protected routes**, add token:
   - Headers → Add new header
   - Key: `Authorization`
   - Value: `Bearer your-token-here`

### Sample Postman Requests

**Register User**:
```
POST http://localhost:5000/api/auth/register
Body: {
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Login**:
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Create Expense** (requires token):
```
POST http://localhost:5000/api/expenses
Headers: Authorization: Bearer <token>
Body: {
  "categoryId": "65abc123...",
  "amount": 50.00,
  "title": "Grocery shopping",
  "date": "2024-11-23"
}
```

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution**:
- Check MongoDB URI in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Check username/password are correct

### Issue: Port Already in Use
**Solution**:
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use different port
```

### Issue: CORS Error from Frontend
**Solution**:
```javascript
// In app.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: JWT Token Invalid
**Solution**:
- Verify JWT_SECRET is set in `.env`
- Check token format: `Bearer <token>`
- Ensure token hasn't expired

---

## Useful Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Check for errors
npm run lint

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Kill process on port 5000
npx kill-port 5000
```

---

## Next Steps

1. ✅ Complete setup (above)
2. 📚 Read your team member task file
3. 💻 Start coding your assigned module
4. 🧪 Test your endpoints
5. 📝 Document your API endpoints
6. 🔄 Push to GitHub daily
7. 🤝 Help teammates when needed

---

## Resources

### Learning
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Docs](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)

### Tools
- [Postman](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (GUI for MongoDB)
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

### Help
- [Stack Overflow](https://stackoverflow.com/)
- [Node.js Docs](https://nodejs.org/docs/)
- Team Slack/Discord channel

---

## Contact & Support

- **Team Lead**: [Contact info]
- **Daily Standup**: 10:00 AM
- **Team Chat**: [Slack/Discord link]
- **GitHub Repo**: [Repository URL]

---

**Remember**:
- Commit often (at least once per day)
- Test your code before pushing
- Ask for help when stuck
- Help teammates when they're stuck
- Communication is key!

**Good luck! You've got this! 🚀**
