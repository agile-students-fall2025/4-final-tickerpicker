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

**For beginner investors** who want to build wealth but don't know where to start. **TickerPicker** is a stock screening application that helps users evaluate publicly traded companies using fundamental metrics. **Unlike** platforms like Yahoo Finance or Robinhood, which are either too shallow to be useful or throw too much information at users, **our product** provides an intuitive filtering system with educational context, making it easy to discover stocks that match your investment criteria.

### What We're Building (MVP)

Our Minimum Viable Product focuses on the core functionality needed for effective stock research:

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

After Julien and Jerry joined, we refined the concept and started planning. We're currently in Sprint 0, setting up our development environment and finalizing our technical architecture.

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
- **Database:** TBD
- **Authentication:** TBD

## Building and Testing

_Coming soon - we'll update this once we start development._

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
[Task Board](https://github.com/orgs/agile-students-fall2025/projects/20/views/3)

## Project Status

**Current Sprint:** Sprint 0  
**Status:** Planning and setup phase

We're currently:

- Setting up development environment
- Finalizing technical architecture decisions
- Creating initial product backlog
- Establishing team workflows
