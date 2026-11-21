/**
 * One-time migration script: hash all plain-text passwords in MongoDB.
 * Run with: node migrate-passwords.mjs
 * Safe to run multiple times — skips already-hashed passwords.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

async function migrate() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  const users = await User.find({});
  console.log(`📋 Found ${users.length} user(s).\n`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    // bcrypt hashes always start with "$2b$" — skip if already hashed
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      console.log(`⏭️  Skipping ${user.email} — already hashed.`);
      skipped++;
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 12);
    user.password = hashed;
    await user.save();
    console.log(`✅ Migrated: ${user.email}`);
    migrated++;
  }

  console.log(`\n🎉 Done! Migrated: ${migrated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
