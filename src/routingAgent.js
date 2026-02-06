class RoutingAgent {
  constructor(memoryStore, transferFn) {
    this.memoryStore = memoryStore;
    this.transferFn = transferFn;
  }

  riskScore(routeId, recipientAgentId) {
    const record = this.memoryStore.getRouteRecord(routeId, recipientAgentId);
    return record.failureCount;
  }

  chooseRoute({ recipientAgentId, possibleRoutes }) {
    const scoredRoutes = possibleRoutes
      .map((routeId) => ({
        routeId,
        riskScore: this.riskScore(routeId, recipientAgentId)
      }))
      .sort((a, b) => a.riskScore - b.riskScore);

    return scoredRoutes[0];
  }

  async attemptPayment({ amount, recipientAgentId, possibleRoutes }) {
    const selected = this.chooseRoute({ recipientAgentId, possibleRoutes });

    console.log(`[ROUTER] Chosen route=${selected.routeId}, riskScore=${selected.riskScore}`);

    const transferResult = await this.transferFn({
      routeId: selected.routeId,
      amount,
      recipientAgentId
    });

    const outcome = transferResult.status === 'success' ? 'success' : 'failure';
    const updatedRecord = this.memoryStore.recordOutcome(selected.routeId, recipientAgentId, outcome);

    console.log(`[TRANSFER] outcome=${transferResult.status}, details="${transferResult.details}"`);
    if (transferResult.status === 'failure') {
      console.log(`[TRANSFER] failureType=${transferResult.reason}`);
    }

    console.log(
      `[MEMORY] route=${updatedRecord.routeId}, recipient=${updatedRecord.recipientAgentId}, success=${updatedRecord.successCount}, failure=${updatedRecord.failureCount}, lastAttempted=${updatedRecord.lastAttemptedTimestamp}`
    );

    return {
      selectedRoute: selected.routeId,
      transferResult,
      updatedRecord
    };
  }
}

module.exports = { RoutingAgent };
