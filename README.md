# Failure-Avoidance Routing Agent (Testnet MVP)

This project demonstrates a deterministic autonomous agent that routes **testnet USDC** and learns from payment failures.

Core proof:
> "This agent remembers where money fails and avoids those paths next time."

## What it does

- Accepts a payment request:
  - `amount`
  - `recipientAgentId`
  - `possibleRoutes`
- Chooses the route with the **lowest historical failure count**.
- Simulates a testnet USDC transfer.
- Records success/failure in persistent economic memory (`data/economic-memory.json`).
- Alters future route choice after failures are recorded.

## Failure definition implemented

A transfer is marked failed if the simulated transfer returns:
- `transaction_revert`
- `timeout`
- `mocked_failure`

## Project structure

- `src/routingAgent.js` — deterministic route selection + payment attempt flow.
- `src/memoryStore.js` — persistent economic memory store.
- `src/mockUsdcTransfer.js` — testnet transfer simulator with explicit failure modes.
- `src/demo.js` — required demonstration of first failure and improved reroute.
- `data/economic-memory.json` — generated memory state.

## Run the demo

```bash
npm run demo
```

## Expected demonstration output

You will see:
1. **Attempt 1** picks `route-A` (tie at failure score 0), then fails intentionally (`transaction_revert`).
2. Memory updates with `route-A.failureCount = 1`.
3. **Attempt 2** chooses `route-B` due to lower failure score and succeeds.

Logs explicitly show:
- chosen route
- transfer outcome
- memory update
