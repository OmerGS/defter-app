import 'dotenv/config';
import { db } from '@/database';
import { hashPassword } from '@/utils/security';

const run = async () => {
  const passwordPourLeTest = 'admin123';
  
  const hash = await hashPassword(passwordPourLeTest);
  console.log(`new hash  : ${hash}`);

  await db.query(
    `UPDATE users SET password_hash = ? WHERE email = 'admin@defter.local'`,
    [hash]
  );
  
  console.log("database updated !");
  process.exit();
};

run();