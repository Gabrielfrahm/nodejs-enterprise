import { existsSync } from 'fs';
import dotenv from 'dotenv';

const envFile = `./.env`;
const testEnvFile = `./.env.test`;

if (!existsSync(envFile)) {
  throw new Error('.env file not found');
}

if (!existsSync(testEnvFile)) {
  throw new Error('.env.test file not found');
}

dotenv.config({ path: envFile });
dotenv.config({ path: testEnvFile, override: true });
