/**
 * Migration v4: Add sections_config column to mock_tests table.
 * Run: node backend/scripts/migrate_v4.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function run() {
  console.log('Running migration v4: sections_config column...');

  // Supabase JS client does not support DDL directly.
  // Use the Supabase Management API or run this SQL in the Supabase SQL Editor:
  //
  //   ALTER TABLE core_ielts_lms_mock_tests
  //   ADD COLUMN IF NOT EXISTS sections_config JSONB DEFAULT NULL;
  //
  // Attempting via a test insert to verify column exists:
  const { data, error } = await supabase
    .from('core_ielts_lms_mock_tests')
    .select('sections_config')
    .limit(1);

  if (error && error.message.includes('sections_config')) {
    console.error('\n❌ Column "sections_config" does NOT exist yet.');
    console.error('\nPlease run the following SQL in your Supabase SQL Editor:');
    console.error('\n  ALTER TABLE core_ielts_lms_mock_tests');
    console.error('  ADD COLUMN IF NOT EXISTS sections_config JSONB DEFAULT NULL;\n');
  } else if (error) {
    console.error('Error checking column:', error.message);
  } else {
    console.log('✅ Column "sections_config" already exists — migration not needed.');
  }
}

run().catch(console.error);
