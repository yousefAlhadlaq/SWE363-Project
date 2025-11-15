// Mock user data for development and testing

export const fakeUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'client',
    avatar: null,
    joinDate: '2024-01-01',
    stats: {
      totalIncome: 15000,
      totalExpenses: 8500,
      savings: 6500,
      zakahDue: 375
    }
  },
  {
    id: 2,
    name: 'Ahmed Al-Saud',
    email: 'ahmed@example.com',
    password: 'password123',
    role: 'advisor',
    specialty: 'Investment',
    avatar: null,
    joinDate: '2023-12-01',
    rating: 4.8,
    sessionsCompleted: 45
  },
  {
    id: 3,
    name: 'Admin User',
    email: 'admin@Guroosh.com',
    password: 'admin123',
    role: 'admin',
    avatar: null,
    joinDate: '2023-01-01'
  }
];

export const fakeTransactions = [
  {
    id: 1,
    userId: 1,
    type: 'income',
    title: 'Monthly Salary',
    amount: 5000,
    category: 'Employment',
    date: '2024-01-01',
    description: 'January salary payment'
  },
  {
    id: 2,
    userId: 1,
    type: 'expense',
    title: 'Groceries',
    amount: 250,
    category: 'Food',
    date: '2024-01-05',
    description: 'Weekly grocery shopping'
  },
  {
    id: 3,
    userId: 1,
    type: 'expense',
    title: 'Rent',
    amount: 1200,
    category: 'Housing',
    date: '2024-01-01',
    description: 'Monthly rent payment'
  }
];

export const fakeAdvisors = [
  {
    id: 1,
    name: 'Ahmed Al-Saud',
    specialty: 'Investment',
    email: 'ahmed@example.com',
    available: true,
    rating: 4.8,
    sessionsCompleted: 45,
    bio: 'Expert in Islamic investment strategies with 10+ years of experience'
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    specialty: 'Zakah & Islamic Finance',
    email: 'fatima@example.com',
    available: true,
    rating: 4.9,
    sessionsCompleted: 62,
    bio: 'Specialized in Zakah calculation and Islamic financial planning'
  },
  {
    id: 3,
    name: 'Omar Ibrahim',
    specialty: 'Budgeting & Savings',
    email: 'omar@example.com',
    available: false,
    rating: 4.7,
    sessionsCompleted: 38,
    bio: 'Helping families manage their budgets and build savings'
  }
];

export const fakeCategories = [
  { id: 1, name: 'Food', type: 'expense', icon: '🍔' },
  { id: 2, name: 'Housing', type: 'expense', icon: '🏠' },
  { id: 3, name: 'Transportation', type: 'expense', icon: '🚗' },
  { id: 4, name: 'Entertainment', type: 'expense', icon: '🎮' },
  { id: 5, name: 'Healthcare', type: 'expense', icon: '⚕️' },
  { id: 6, name: 'Employment', type: 'income', icon: '💼' },
  { id: 7, name: 'Business', type: 'income', icon: '🏢' },
  { id: 8, name: 'Investment', type: 'income', icon: '📈' }
];

export default {
  fakeUsers,
  fakeTransactions,
  fakeAdvisors,
  fakeCategories
};
