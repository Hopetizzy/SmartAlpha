const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const migrationFile = path.join(__dirname, '../migrations/20260627000537_stripe-sync-triggers.sql');
let sql = fs.readFileSync(migrationFile, 'utf8');

// Strip SQL comments starting with -- to prevent any command line option confusion
sql = sql.split('\n').filter(line => !line.trim().startsWith('--')).join('\n');

const escapedSql = JSON.stringify(sql);

console.log('Running trigger migration with --unrestricted...');
try {
  const res = execSync(`npx @insforge/cli db query --unrestricted -- ${escapedSql}`, {
    encoding: 'utf8',
    stdio: 'inherit'
  });
  console.log('Trigger migration applied successfully!');
} catch (err) {
  console.error('Execution failed:', err);
  process.exit(1);
}
