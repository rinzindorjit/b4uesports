import { spawn } from 'child_process';
import path from 'path';

console.log('Starting B4U Esports development environment...');

// Start the backend server
const server = spawn('node', ['server.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

// Start the frontend client
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'client'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development environment...');
  server.kill();
  client.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development environment...');
  server.kill();
  client.kill();
  process.exit(0);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

client.on('error', (error) => {
  console.error('Client error:', error);
});