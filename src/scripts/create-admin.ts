import { env } from '../config/env.js';
import { upsertAdmin } from '../modules/auth/service.js';

async function main() {
  const admin = await upsertAdmin(env.admin.email, env.admin.password, env.admin.name);
  console.log('Admin ready:', admin);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
