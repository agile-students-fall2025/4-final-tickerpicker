<!-- # Project Repository

This repository will be used for team projects.

Several sets of instructions are included in this repository. They should each be treated as separate assignments with their own due dates and sets of requirements.

1. See the [App Map & Wireframes](instructions-0a-app-map-wireframes.md) and [Prototyping](./instructions-0b-prototyping.md) instructions for the requirements of the initial user experience design of the app.

1. Delete the contents of this file and replace with the contents of a proper README.md, as described in the [project setup instructions](./instructions-0c-project-setup.md)

1. See the [Sprint Planning instructions](instructions-0d-sprint-planning.md) for the requirements of Sprint Planning for each Sprint.

1. See the [Front-End Development instructions](./instructions-1-front-end.md) for the requirements of the initial Front-End Development.

1. See the [Back-End Development instructions](./instructions-2-back-end.md) for the requirements of the initial Back-End Development.

1. See the [Database Integration instructions](./instructions-3-database.md) for the requirements of integrating a database into the back-end.

1. See the [Deployment instructions](./instructions-4-deployment.md) for the requirements of deploying an app. -->

# TickerPicker

A stock screening and analysis tool built for beginner investors who want to learn fundamental analysis without getting overwhelmed.

## Product Vision

For beginner investors who want to build wealth but don't know where to start, TickerPicker is a stock screening application that helps users evaluate publicly traded companies using fundamental metrics. Unlike platforms like Yahoo Finance or Robinhood, which are either too shallow to be useful or throw too much information at users, our product provides an intuitive filtering system with educational context, making it easy to discover stocks that match your investment criteria.

### What We're Building (MVP)

Our minimum viable product focuses on the core functionality needed for effective stock research:

- **Stock filtering system** - Filter by industry and adjust sliders for key metrics (P/E ratio, EPS growth, debt-to-equity, beta, etc.)
- **Price charts** - View stock performance over time using interactive charts
- **Fundamental data display** - See the key metrics that matter for each stock
- **User accounts** - Login/logout functionality with secure authentication
- **Watchlist** - Save stocks you're interested in tracking
- **Earnings notifications** - Get notified via email and in-app when your watchlisted stocks have earnings calls

### What's Coming Later

If time permits, we'd like to add:

- **AI chatbot** - Ask questions like "What does P/E ratio mean?" and get beginner-friendly explanations
- **Saved filters** - Store your favorite filter configurations for quick access
- **Multi-language support** - Make the platform accessible to non-English speakers

## Team

### Sprint 0 Roles

- **Product Owner:** [Lauren Throve](https://github.com/laurenst17)
- **Scrum Master:** [Julien Soto-Raspa](https://github.com/jlnsr)

### Sprint 1 Roles

- **Product Owner:** [Muyao (Jerry) Kong](https://github.com/Jerry-K5050)
- **Scrum Master:** [Apoorv Belgundi](https://github.com/apoorvib)

### Sprint 2 Roles

- **Product Owner:** [Michael Mvano](https://github.com/michx02)
- **Scrum Master:** [Lauren Throve](https://github.com/laurenst17)

### Sprint 3 Roles

- **Product Owner:** [Apoorv Belgundi](https://github.com/apoorvib)
- **Scrum Master:** [Michael Mvano](https://github.com/michx02)

### Sprint 4 Roles

- **Product Owner:** [Julien Soto-Raspa](https://github.com/jlnsr)
- **Scrum Master:** [Muyao (Jerry) Kong](https://github.com/Jerry-K5050)

### Developers

- [Lauren Throve](https://github.com/laurenst17)
- [Apoorv Belgundi](https://github.com/apoorvib)
- [Michael Mvano](https://github.com/michx02)
- [Julien Soto-Raspa](https://github.com/jlnsr)
- [Muyao (Jerry) Kong](https://github.com/Jerry-K5050)

_Note: Scrum Master and Product Owner roles rotate each sprint so everyone gets experience in each role._

## History

TickerPicker started during our project proposal assignment when Apoorv, Lauren, and Michael noticed a problem: every stock platform is either useless or overwhelming for beginners.

Platforms like Robinhood show you a price chart, basic technical indicators, and not much else, which is fine for buying but not for research. Professional tools like Bloomberg Terminal or even Yahoo Finance dump every possible metric on you without explaining what matters or why. We wanted something in between: a tool that shows beginners the important fundamentals, lets them filter by what matters to their strategy, and doesn't assume they already have a finance degree.

After Julien and Jerry joined, we refined the concept and started planning. We're currently in Sprint 3, integrating MongoDB database for efficient data storage and retrieval.

## Contributing

Want to contribute? Check out our [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Team norms and values
- Git workflow and branching strategy
- How to set up your development environment
- Code review process

## Tech Stack

- **Frontend:** React
- **Charts:** TradingView Lightweight Charts API
- **Backend:** Express.js (Node.js) + Python
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** JWT (JSON Web Tokens)

## How to Run

### Prerequisites

- Node.js installed
- npm installed
- MongoDB Atlas account

### Environment Setup

**1. Configure Environment Variables:**

Before running the backend, you need to set up your environment variables:

```bash
cd back-end
cp .env.example .env
```

Then edit the `.env` file and add your MongoDB Atlas connection string. See `.env.example` for the required format.

**Note:** The `.env` file is not tracked in git for security reasons. Make sure to create it locally with your MongoDB credentials.

### Running the Application

**Note** It is recommended to rename the front-end and back-end terminal accordingly so that you don't mix them up. If you wish to contribute, you can also have a seperate terminal specifically for other operations (such as git).

**1. Start the Backend Server:**

```bash
cd back-end
npm install
npm run dev
```

Backend will run on `http://localhost:3001`

**Note:** If MongoDB connection fails, the server will still start but will fall back to direct API calls (no caching). Make sure your `.env` file has a valid `MONGODB_URI`.

**2. Start the Frontend (in a new terminal) in the root:**

```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

**3. Open your browser to `http://localhost:5173`**

Both servers must be running simultaneously for the application to work properly.

## Product Backlog Themes

Our user stories are organized into these themes:

### 1. Stock Discovery & Filtering

Features that help users find stocks matching their criteria

- Industry/sector filtering
- Metric-based filtering with sliders
- Search functionality

### 2. Data Visualization

Features that display stock information clearly

- Interactive price charts
- Fundamental data presentation
- Performance metrics display

### 3. User Account Management

Features for personalized experiences

- Authentication (login/logout)
- User profiles
- Account settings

### 4. Portfolio Tracking

Features for monitoring stocks over time

- Watchlist functionality
- Earnings call notifications
- Price alerts

### 5. User Education _(Nice-to-Have)_

Features that explain financial concepts

- AI chatbot for metric explanations
- Tooltips and help text
- Educational resources

## Project Links

[Product Backlog](https://github.com/orgs/agile-students-fall2025/projects/20/views/1)

[Task Board](https://github.com/orgs/agile-students-fall2025/projects/20/views/20)

## Project Status

**Current Sprint:** Sprint 4

**Status:** Deployment Phase

We're currently:

- **CI/CD Pipeline implemented** - GitHub Actions workflow for automated testing and building on every push and pull request
- **Docker containerization** - Full Docker setup with docker-compose for easy deployment (see [DOCKER.md](./DOCKER.md))
- **Deployment preparation** - Setting up Digital Ocean deployment infrastructure
- **MongoDB database integrated** with Mongoose for data persistence
- **Price data caching system** - MongoDB stores historical OHLCV data with gap-filling strategy (checks DB first, fetches only missing dates from Yahoo Finance API)
- **User authentication with MongoDB** - User registration, login, password updates, and email changes all use MongoDB with secure password hashing (PBKDF2)
- **Notification model created** - Mongoose schema ready for notifications (earnings, dividends) with user association
- Backend API endpoints fully integrated with frontend
- Homepage features implemented: recommended picks (SPDR ETFs by Sharpe ratio) and top 10 performers (Nasdaq 100)
- Stock data fetching, filtering, and watchlist management functional
- Unit tests in place for backend routes
