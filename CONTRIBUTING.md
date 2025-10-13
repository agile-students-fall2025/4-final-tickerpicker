# Contributing to TickerPicker

Thanks for your interest in contributing! This document outlines how our team works and how you can contribute effectively.

## Table of Contents

- [Team Norms](#team-norms)
- [Sprint Cadence](#sprint-cadence)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Development Environment Setup](#development-environment-setup)
- [Building and Testing](#building-and-testing)
- [How to Contribute](#how-to-contribute)

## Team Norms

### Team Values

**How we work together:**
- We communicate openly and frequently via Discord
- We help each other when someone gets stuck—no one should struggle alone
- We write code that others can understand and maintain
- We prioritize working software over perfect documentation
- We focus on building features end-to-end before optimizing

**How we ask for help:**
- Post in the Discord channel when you're blocked
- Don't wait until standup if you need help immediately  
- Share what you've already tried so others can help more effectively
- Screen share or pair program when debugging tricky issues

**How we handle conflict:**
- Discuss disagreements openly as a team in Discord or meetings
- Present your reasoning and listen to others' perspectives
- The Product Owner makes final decisions on scope and priorities
- Technical decisions are made collaboratively by developers
- If someone isn't delivering on their commitments, we address it directly with them first

**Response time expectations:**
- Respond to direct messages or mentions within 24 hours
- If you're going to be unavailable, let the team know in advance
- Check Discord at least once per day during the week

**If someone isn't making progress:**
- After 2 standups with no progress, the team will check in directly with that person
- We'll offer help and try to identify blockers
- If the pattern continues despite support, we'll report the situation to the professor

### Sprint Cadence

- **Sprint length:** 2-3 weeks
- **Sprint planning:** At the start of each sprint
- **Sprint review/demo:** At the end of each sprint
- **Sprint retrospective:** After each sprint review

### Daily Standups

- **When:** Monday and Friday mornings at 8:30 AM EST
- **Duration:** ~1 hour (though standups should be brief, we use this time for team coordination)
- **Where:** Discord voice channel
- **Required attendance:** All team members must attend synchronously
- **Format:** Each person shares:
  - What they completed since last standup
  - What they're working on next
  - Any blockers or issues

**Important:** 
- We don't cover for absent team members
- If you miss a standup, post your update in Discord
- No progress for 2+ standups in a row will trigger a team check-in

## Git Workflow

We follow a **feature branch workflow**:

1. The `main` branch always contains working, deployable code
2. All development happens in feature branches
3. Feature branches are created in the shared team repository (not forks)
4. Changes are merged via Pull Requests after peer review
5. PRs require at least one approval before merging

### Branch Naming

Use descriptive names that indicate what you're building:

feature/stock-filter-sliders
feature/watchlist-api
fix/chart-rendering-mobile
enhancement/login-validation

### Making Changes

1. **Pull latest changes:**
```bash
    git checkout main
    git pull origin main
```

2. **Create a feature branch:**
```bash
    git checkout -b feature/your-feature-name
```

3. **Make your changes and commit often:**
```bash   
    git add .
    git commit -m "Add industry filter dropdown"
```

4. **Push your branch:**
```bash   
    git push origin feature/your-feature-name
```

5. **Open a Pull Request on GitHub**

6. **Request review from at least one team member**

7. **Address any feedback**

8. **Merge once approved (use "Squash and Merge")**

### Commit Messages

Write clear, single-line commit messages in imperative mood:

**Good:**
```bash
Add filter slider for P/E ratio
Fix login button not responding on mobile
Update README with setup instructions
Remove unused imports from App.js
```
**Bad:**
```bash
fixed stuff
WIP
updated things
asdfasdf
```

**Rules:**
- Start with a verb (Add, Fix, Update, Remove, Refactor)
- Be specific about what changed
- Keep it under 72 characters
- Don't end with a period
