# RecipeBox
> A simple recipe organizer with authentication, role-based access, and a session-backed data model.

**Author:** delonzow  
**Course/Project:** Dev-Delta  
**Version:** 1.0  
**Date:** 2026-11-09

## Problem and Narrative

RecipeBox began as a static front-end mockup and has evolved into a simple data-driven application that demonstrates how a browser app can authenticate a user, track session state, and manage recipe data. The app helps home cooks browse a collection of recipes, add their own ideas, and understand how user role and app data move through a browser-based application.

## User Story

- As a home cook, I want to browse recipes and sign in to manage them.
- As a regular user, I want to create and update recipes without affecting admin-only controls.
- As an admin, I want to manage the full collection and inspect the current session state.

## Current Functionality

- Authentication for the two development test accounts
- Role-based authorization between admin and regular user
- JSON-backed recipe data loaded with fetch()
- Session-based persistence using sessionStorage
- Admin dashboard that displays current session data and app state

## Authentication and Authorization

The application includes two instructional test accounts:

- Admin: username = admin, password = admin123
- User: username = user, password = user123

The credentials are also written to the browser console when the app loads so they are easy to find during testing.

### Role rules

- Regular user: can browse, create, and edit recipes
- Admin: can browse, create, edit, and delete recipes, and access the admin dashboard

## Data Flow
```
AUTH ────────────────┐
                     │
STATIC JSON ──fetch()─┼──→ appState
                     │       ↓
USER INPUT ───────────┘   sessionStorage
                             ↓
                            DOM
```
## Technology Stack

- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons
- Normalize.css
- Google Fonts
- Git and GitHub
- GitHub Pages

## Project Structure

```
scaling-enigma-dev-delta/
├── assets/
│   ├── data/
│   │   ├── recipes.json
│   │   └── users.json
│   ├── scripts/
│   │   └── app.js
│   └── styles/
│       └── styles.css
├── pages/
│   ├── admin.html
│   └── signin.html
├── index.html
└── README.md
```
## Testing

- Open the home page and verify the console contains the development credentials.
- Sign in as the user and verify the user can create and edit recipes.
- Sign in as the admin and verify the Admin link appears and the dashboard loads.
- Delete a recipe as admin, then refresh the page and confirm the appState remains in sessionStorage.
- Inspect the admin dashboard to confirm the JSON output matches the current app state.

## Known Issues

- This is a front-end prototype and does not use a real server-side database.
- User authentication is intentionally insecure and only meant for classroom demonstration.
- The app relies on sessionStorage, so state is temporary and specific to the browser session.

## Future Development

- Replace the front-end-only auth model with a real backend and secure session handling.
- Move recipe data into a persistent database.
- Add search, filters, and sorting that operate on the JSON dataset.
- Add editing permissions based on ownership rather than only role.

## Resources and Attribution

- Bootstrap documentation for layout and component styling
- Normalize.css, Bootstrap Icons, and Google Fonts from public CDNs
- Unsplash image sources for recipe visuals

## Repository Status

- The Bravo version was preserved in Git on the bravo branch before Delta changes were introduced.
- The active Delta iteration continues on the main branch.
