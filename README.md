# CodeOptics

![CodeOptics](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-yellow)
![Vercel](https://img.shields.io/badge/Deployed_On-Vercel-black)

**CodeOptics** is a full-stack algorithm visualization platform that bridges comprehensive Data Structures and Algorithms (DSA) theory with interactive, real-time animations. It is designed to make complex mathematical structures, specifically Segment Trees, intuitive and easy to learn.

## 🔗 Live Demo
**[Experience CodeOptics Live](https://codeoptics.vercel.app)**

## 🚀 Features

- **Interactive Visualizations:** Real-time array updates and range queries mapped directly to an animated Segment Tree.
- **Comprehensive Theory:** Side-by-side technical explanations detailing tree construction, mathematics, and time complexities.
- **Secure Authentication:** Full user registration and login system backed by MongoDB Atlas.
- **Modern UI/UX:** A highly responsive, state-driven user interface featuring fluid animations and glassmorphism design principles.
- **Serverless Architecture:** Globally deployed via Vercel for instantaneous cold starts and infinite scalability.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Bootstrapped with Vite for lightning-fast HMR)
- **Vanilla CSS Modules** (Custom scalable design system)
- **Lucide React** (Dynamic SVG iconography)

### Backend
- **Node.js & Express.js** (RESTful API architecture)
- **Vercel Serverless Functions** (`/api` routing)

### Database
- **MongoDB Atlas** (Cloud-hosted NoSQL database)
- **Mongoose** (Object Data Modeling)

## 💻 Run Locally

To run this project on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/Lalat123/Segment-Tree-Visualizer-Range-Sum-.git
cd Segment-Tree-Visualizer-Range-Sum-
```

### 2. Install Dependencies
```bash
npm install
```
*(Note: If you run into peer dependency issues, run `npm install --legacy-peer-deps`)*

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your MongoDB connection string:
```env
MONGO_URI=mongodb://<USERNAME>:<PASSWORD>@your-cluster-url...
```

### 4. Start the Development Server
This project uses `concurrently` to run both the Vite frontend and the Node.js backend simultaneously.
```bash
npm run dev:all
```

Your frontend will be running at `http://localhost:5179` and your backend API will be running at `http://localhost:3000`.

## 👨‍💻 Author

**Lalat Keshari Swain**
- GitHub: [@Lalat123](https://github.com/Lalat123)
- LinkedIn: [Lalat Keshari Swain](https://www.linkedin.com/in/lalat-keshari-swain-471ab8316/)
