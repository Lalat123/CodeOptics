import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
  password: { type: String, required: true }
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

// API: Register
app.post('/api/auth/register', async (req, res) => {
  await connectDB();
  
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Valid email and 6+ char password required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const newUser = new User({ email, password });
    await newUser.save();
    
    return res.json({ success: true, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// API: Login
app.post('/api/auth/login', async (req, res) => {
  await connectDB();
  
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email. Please sign up.' });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password. Please try again.' });
    }

    return res.json({ success: true, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// API: Get Templates
app.get('/api/template/:topicId', async (req, res) => {
  await connectDB();
  const { topicId } = req.params;
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: 'Email required.' });

  try {
    const record = await Template.findOne({ email, topicId });
    return res.json({ templates: record ? record.templates : [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error fetching templates.' });
  }
});

// API: Save Templates
app.post('/api/template/:topicId', async (req, res) => {
  await connectDB();
  const { topicId } = req.params;
  const { email, templates } = req.body;

  if (!email || !Array.isArray(templates)) {
    return res.status(400).json({ error: 'Email and templates array required.' });
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

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
