/**
 * Simulates testnet USDC transfers.
 * Allowed outcomes:
 * - success
 * - revert (transaction revert)
 * - timeout (no acknowledgment)
 * - mocked_failure (explicit mocked endpoint failure)
 */
function createMockUsdcTransfer(routeBehavior) {
  return async function transfer({ routeId, amount, recipientAgentId }) {
    const behavior = routeBehavior[routeId] || 'success';

    if (behavior === 'success') {
      return {
        status: 'success',
        details: `Transferred ${amount} USDC on testnet to ${recipientAgentId} via ${routeId}`
      };
    }

    if (behavior === 'revert') {
      return {
        status: 'failure',
        reason: 'transaction_revert',
        details: `Route ${routeId} reverted`
      };
    }

    if (behavior === 'timeout') {
      return {
        status: 'failure',
        reason: 'timeout',
        details: `Route ${routeId} timed out with no acknowledgment`
      };
    }

    return {
      status: 'failure',
      reason: 'mocked_failure',
      details: `Mocked failure returned by recipient endpoint on ${routeId}`
    };
  };
}

module.exports = { createMockUsdcTransfer };
