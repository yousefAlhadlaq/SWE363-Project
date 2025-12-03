const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting all servers...\n');

// Server configurations
const servers = [
  {
    name: 'Main API',
    icon: '⚡',
    command: 'node',
    args: ['src/server.js'],
    cwd: __dirname,
    env: { ...process.env, PORT: 5001 }
  },
  {
    name: 'Central Bank API',
    icon: '🏦',
    command: 'node',
    args: ['mock-servers/centralBankServer.js'],
    cwd: __dirname,
    env: { ...process.env, CENTRAL_BANK_PORT: 5002 }
  },
  {
    name: 'Crypto Exchange API',
    icon: '₿',
    command: 'node',
    args: ['mock-servers/cryptoExchangeServer.js'],
    cwd: __dirname,
    env: { ...process.env, CRYPTO_PORT: 5003 }
  },
  {
    name: 'Real Estate API',
    icon: '🏠',
    command: 'node',
    args: ['mock-servers/realEstateServer.js'],
    cwd: __dirname,
    env: { ...process.env, REAL_ESTATE_PORT: 5004 }
  }
];

// Start all servers
servers.forEach((server, index) => {
  const proc = spawn(server.command, server.args, {
    cwd: server.cwd,
    env: server.env,
    shell: true,
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      console.log(`${server.icon} [${server.name}] ${line}`);
    });
  });

  proc.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error && !error.includes('.profile')) {
      console.error(`❌ [${server.name}] ${error}`);
    }
  });

  proc.on('close', (code) => {
    console.log(`\n⚠️  [${server.name}] Process exited with code ${code}`);
  });

  console.log(`✅ Started ${server.name}`);
});

console.log('\n📊 All servers starting...');
console.log('Press Ctrl+C to stop all servers\n');

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down all servers...');
  process.exit();
});
