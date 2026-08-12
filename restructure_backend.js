import fs from 'fs';
import path from 'path';

const backendSrcDir = path.join(process.cwd(), 'backend', 'src');

// 1. Create config/db.js
const dbContent = `import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);
`;
fs.writeFileSync(path.join(backendSrcDir, 'config', 'db.js'), dbContent);

// 2. Refactor server.js by rewriting it
// I will just use `replace_file_content` instead of a script for server.js to be safer,
// but actually writing the components here is easier.
