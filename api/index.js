import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'codeoptics_fallback_secret_change_in_prod';

app.use(cors());
app.use(express.json());

// Global MongoDB Connection (Vercel Serverless Optimization)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('Successfully connected to MongoDB Atlas!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }  // bcrypt hash
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Template Schema
const templateSchema = new mongoose.Schema({
  email: { type: String, required: true },
  topicId: { type: String, required: true },
  templates: [{
    title: { type: String, default: '' },
    code: { type: String, default: '' }
  }]
});
const Template = mongoose.models.Template || mongoose.model('Template', templateSchema);

// ─── JWT Auth Middleware ───────────────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { email, iat, exp }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please sign in again.' });
  }
}

// ─── API: Register ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and 6+ character password required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    // Hash password before storing
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    // Issue JWT on successful registration
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({ success: true, email, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Helper: check if a string is a bcrypt hash
function isBcryptHash(str) {
  return str && (str.startsWith('$2b$') || str.startsWith('$2a$') || str.startsWith('$2y$'));
}

// ─── API: Login ────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up.' });
    }

    let authenticated = false;

    if (isBcryptHash(user.password)) {
      // Password is already hashed — compare with bcrypt
      authenticated = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plain-text password — compare directly
      if (password === user.password) {
        authenticated = true;
        // Auto-migrate: hash the plain-text password and save it
        console.log(`[MIGRATION] Hashing plain-text password for: ${email}`);
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    if (!authenticated) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.' });
    }

    // Issue JWT
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, email, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// ─── API: Get Templates (protected) ───────────────────────────────────────────
app.get('/api/template/:topicId', authenticateToken, async (req, res) => {
  await connectDB();
  const { topicId } = req.params;
  const email = req.user.email; // extracted from verified JWT

  try {
    const record = await Template.findOne({ email, topicId });
    return res.json({ templates: record ? record.templates : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching templates.' });
  }
});

// ─── API: Save Templates (protected) ──────────────────────────────────────────
app.post('/api/template/:topicId', authenticateToken, async (req, res) => {
  await connectDB();
  const { topicId } = req.params;
  const email = req.user.email; // extracted from verified JWT
  const { templates } = req.body;

  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'Templates array required.' });
  }

  try {
    let record = await Template.findOne({ email, topicId });
    if (record) {
      record.templates = templates;
      await record.save();
    } else {
      record = new Template({ email, topicId, templates });
      await record.save();
    }
    return res.json({ success: true, templates: record.templates });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error saving templates.' });
  }
});

// ─── Start Server locally ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
