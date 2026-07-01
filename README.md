# Kyro - Personal Context Operating System

Kyro is your AI that never forgets. It acts as a Personal Context Operating System, seamlessly remembering and organizing your interactions, providing context-aware insights, and offering an intuitive interface to manage your digital life.

This repository is a monorepo containing three core components of the Kyro ecosystem:
1. **Backend**: A robust FastAPI-based service powering the core memory system.
2. **Dashboard**: A comprehensive web interface for visualizing and managing your personal context.
3. **Browser Extension**: A Chrome extension to seamlessly capture and retrieve context as you browse the web.

## 🏗️ Project Architecture

The project is structured as a monorepo with the following main directories:

- `/backend` - Python FastAPI application acting as the core intelligence layer. It uses **Cognee** for the memory system and integrates with **PostgreSQL** & **pgvector** for vector storage.
- `/dashboard` - React-based web application built with **Vite**. It provides a visual interface to explore your data, powered by **TailwindCSS (v4)**, **Framer Motion**, and **XYFlow**.
- `/extension` - Chrome browser extension built with React, Vite, and TailwindCSS, designed to interact with the web and the Kyro backend seamlessly.

## 🚀 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with `pgvector`
- **Memory System**: Cognee
- **Monitoring**: Sentry

### Frontend (Dashboard & Extension)
- **Framework**: React 19, Vite
- **Styling**: TailwindCSS v4, Framer Motion
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Graphs/Visualization**: XYFlow (React Flow)

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python](https://www.python.org/) (v3.9 or higher)
- [Docker & Docker Compose](https://www.docker.com/) (for database and containerized deployment)

## ⚙️ Local Development Setup

Kyro is set up to easily run all components simultaneously for local development.

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Kyro
   ```

2. **Install Root Dependencies**:
   ```bash
   npm install
   ```

3. **Install Component Dependencies**:
   - For Dashboard: `cd dashboard && npm install`
   - For Extension: `cd extension && npm install`
   - For Backend: `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt` *(Note: Setup may vary slightly depending on your OS and package manager like `uv` or `pip`)*

4. **Start the Infrastructure (Database)**:
   You need the `pgvector` database running for the backend to work correctly.
   ```bash
   docker-compose up -d kyro-postgres
   ```

5. **Run the Development Servers**:
   From the root of the project, you can start the backend, dashboard, and extension development servers concurrently:
   ```bash
   npm run dev
   ```
   This will spin up:
   - Backend on `http://localhost:8000`
   - Dashboard on its Vite dev server (usually `http://localhost:5173`)
   - Extension Vite build in watch mode

## 🐳 Docker Deployment

To run the entire Kyro suite (Backend, Dashboard, and PostgreSQL) using Docker Compose:

```bash
docker-compose up --build
```

- Backend API will be available at `http://localhost:8000`
- Dashboard will be available at `http://localhost:4173`
- PostgreSQL will be mapped to port `5432`

## 🔒 Authentication

Authentication across the Dashboard and Extension is handled by [Clerk](https://clerk.com/). Ensure you have the necessary Clerk API keys configured in your environment variables for the respective frontend projects.

## 📄 License

[Add License Information Here]