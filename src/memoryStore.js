const fs = require('fs');

class MemoryStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = this.load();
  }

  load() {
    if (!fs.existsSync(this.filePath)) {
      return { routes: {} };
    }

    const raw = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw);
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
  }

  key(routeId, recipientAgentId) {
    return `${routeId}::${recipientAgentId}`;
  }

  getRouteRecord(routeId, recipientAgentId) {
    const routeKey = this.key(routeId, recipientAgentId);
    if (!this.state.routes[routeKey]) {
      this.state.routes[routeKey] = {
        routeId,
        recipientAgentId,
        successCount: 0,
        failureCount: 0,
        lastAttemptedTimestamp: null
      };
    }

    return this.state.routes[routeKey];
  }

  recordOutcome(routeId, recipientAgentId, outcome) {
    const record = this.getRouteRecord(routeId, recipientAgentId);
    record.lastAttemptedTimestamp = new Date().toISOString();

    if (outcome === 'success') {
      record.successCount += 1;
    } else {
      record.failureCount += 1;
    }

    this.save();
    return record;
  }
}

module.exports = { MemoryStore };
