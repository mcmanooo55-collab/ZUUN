import { readFile } from 'node:fs/promises';
import { getInboxPath } from '../contact.mjs';

try {
  const data = await readFile(getInboxPath(), 'utf8');
  const messages = data.split('\n').filter(Boolean).map((line) => JSON.parse(line));
  console.log(JSON.stringify(messages, null, 2));
} catch (error) {
  if (error.code === 'ENOENT') console.log('No inquiries have been recorded.');
  else { console.error('Unable to read the inbox.', error.message); process.exitCode = 1; }
}
