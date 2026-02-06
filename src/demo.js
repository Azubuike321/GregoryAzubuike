const fs = require('fs');
const path = require('path');
const { MemoryStore } = require('./memoryStore');
const { RoutingAgent } = require('./routingAgent');
const { createMockUsdcTransfer } = require('./mockUsdcTransfer');

async function runDemo() {
  const memoryPath = path.join(__dirname, '..', 'data', 'economic-memory.json');

  // Reset demo memory so the same first-failure -> reroute behavior is reproducible every run.
  if (fs.existsSync(memoryPath)) {
    fs.unlinkSync(memoryPath);
  }

  const memoryStore = new MemoryStore(memoryPath);

  // Intentionally fail route-A and allow route-B.
  const transferFn = createMockUsdcTransfer({
    'route-A': 'revert',
    'route-B': 'success'
  });

  const agent = new RoutingAgent(memoryStore, transferFn);

  const paymentRequest = {
    amount: 25,
    recipientAgentId: 'recipient-agent-7',
    possibleRoutes: ['route-A', 'route-B']
  };

  console.log('--- Attempt 1: expected failure on route-A (both routes initially tied at risk=0) ---');
  await agent.attemptPayment(paymentRequest);

  console.log('\n--- Attempt 2: expected reroute to route-B because route-A has recorded failure ---');
  await agent.attemptPayment(paymentRequest);
}

runDemo().catch((err) => {
  console.error('[DEMO ERROR]', err);
  process.exit(1);
});
