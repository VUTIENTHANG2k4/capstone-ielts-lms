require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('📋 Schema file found. Please run schema.sql directly in Supabase SQL Editor.');
    }

    if (fs.existsSync(seedPath)) {
      console.log('📋 Seed file found. Please run seed.sql directly in Supabase SQL Editor.');
    }

    // Verify seed data by checking users
    const { data: users, error } = await supabase
      .from('core_ielts_lms_users')
      .select('id, email, role')
      .limit(5);

    if (error) {
      console.log('\n⚠️  Could not connect to database. Please ensure:');
      console.log('   1. Run schema.sql in Supabase SQL Editor first');
      console.log('   2. Run seed.sql in Supabase SQL Editor');
      console.log('   3. Check your SUPABASE_URL and SUPABASE_SERVICE_KEY');
      console.error('   Error:', error.message);
      return;
    }

    if (users && users.length > 0) {
      console.log('\n✅ Database has data:');
      users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    } else {
      console.log('\n⚠️  No users found. Please run seed.sql in Supabase SQL Editor.');

      // Try to seed users programmatically
      console.log('\n🔄 Attempting to seed users programmatically...');
      const passwordHash = await bcrypt.hash('111111', 10);

      const { error: insertError } = await supabase.from('core_ielts_lms_users').insert([
        { email: 'admin@ielts.academy', password_hash: passwordHash, full_name: 'Admin IELTS Academy', role: 'admin' },
        { email: 'teacher@ielts.academy', password_hash: passwordHash, full_name: 'Teacher Nguyen Van A', role: 'teacher' },
        { email: 'student@ielts.academy', password_hash: passwordHash, full_name: 'Student Le Van C', role: 'student' }
      ]);

      if (insertError) {
        console.log('   ⚠️  Could not insert users:', insertError.message);
        console.log('   → Please run schema.sql then seed.sql in Supabase SQL Editor');
      } else {
        console.log('   ✅ Users seeded successfully!');
      }
    }

    console.log('\n📝 Default login credentials:');
    console.log('   Admin:   admin@ielts.academy / 111111');
    console.log('   Teacher: teacher@ielts.academy / 111111');
    console.log('   Student: student@ielts.academy / 111111');

    console.log('\n🌱 Seed check complete!');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

seed();
