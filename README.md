# Quroosh - Personal Finance Management App

A comprehensive personal finance management application built with React, featuring expense tracking, investment management, zakah calculation, and financial advisory services.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Key Features](#key-features)
- [Contributing](#contributing)

## Features

- **User Authentication**: Secure login, signup, password recovery, and email verification
- **Dashboard**: Overview of financial metrics and insights
- **Expense Tracking**: Categorize and track expenses with budget management
- **Income Management**: Record and monitor income sources
- **Investment Portfolio**: Track and manage investments
- **Zakah Calculator**: Calculate Islamic charitable obligations
- **Financial Advisory**: Connect with financial advisors
- **Reports & Export**: Generate and export financial reports
- **Admin Panel**: User management and system administration
- **Theme Support**: Light and dark mode with customizable themes
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Routing**: React Router DOM 6.26.2
- **Styling**: Tailwind CSS 3.4.15
- **Icons**: Lucide React 0.553.0
- **Language**: JavaScript (ES modules)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: version 14.x or higher (recommended: 18.x or 20.x)
- **npm**: version 6.x or higher (comes with Node.js)

To check your current versions:

```bash
node --version
npm --version
```

## Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd quroosh-frontend
```

2. **Install dependencies**

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- React and React DOM
- React Router DOM
- Tailwind CSS
- Vite
- Lucide React icons
- And all dev dependencies

## Usage

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

The application will start on `http://localhost:5173` (default Vite port). The page will automatically reload when you make changes to the code.

### Build for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be generated in the `dist` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the built application from the `dist` directory.

## Project Structure

```
quroosh-frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Admin/       # Admin panel components
│   │   ├── Advisor/     # Financial advisor components
│   │   ├── Auth/        # Authentication components
│   │   ├── Dashboard/   # Dashboard components
│   │   ├── Expenses/    # Expense tracking components
│   │   ├── Investments/ # Investment management components
│   │   └── Shared/      # Reusable shared components
│   ├── context/         # React context providers
│   ├── routes/          # Application routing
│   ├── App.jsx          # Root component
│   └── main.jsx         # Application entry point
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the development server with hot-reloading |
| `npm run build` | Builds the app for production to the `dist` folder |
| `npm run preview` | Previews the production build locally |

## Key Features

### Authentication System
- User registration with email verification
- Secure login with password recovery
- Profile settings and management
- Protected routes for authenticated users

### Dashboard
- Financial overview and metrics
- Quick access to key features
- Zakah calculator integration
- Reports and export functionality

### Expense Management
- Add and categorize expenses
- Income tracking
- Budget creation and monitoring
- Spending goals
- Category-based analysis

### Investment Tracking
- Portfolio management
- Investment performance tracking
- Zakah calculation for investments
- Export investment reports

### Financial Advisory
- Connect with financial advisors
- View advisor availability
- Request financial advice
- Advisor settings and configuration

### Admin Panel
- User management
- Advisor availability settings
- System notifications
- Administrative dashboard

### UI/UX Features
- Responsive design for all screen sizes
- Light and dark theme support
- Accessible components with skip-to-content
- Loading states and error handling
- Modal dialogs and notifications
- File upload capabilities
- Interactive charts and visualizations

