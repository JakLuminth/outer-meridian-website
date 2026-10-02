(() => {
  'use strict';

  const ui = {
    summary: document.getElementById('status-summary'),
    accounts: document.getElementById('status-accounts'),
    game: document.getElementById('status-game'),
    updated: document.getElementById('status-updated'),
    source: document.getElementById('status-source'),
    refresh: document.getElementById('status-refresh'),
  };
  if (Object.values(ui).some((element) => !element)) return;

  const endpoint = 'https://api.playoutermeridian.com/status.json';
  const maxAgeMs = 90000;
  const maxFutureMs = 60000;
  let report = null;
  let expiryTimer;
  let refreshing = false;

  function isFresh(timestamp) {
    const age = Date.now() - timestamp;
    return age >= -maxFutureMs && age <= maxAgeMs;
  }

  function parseReport(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        typeof value.accounts !== 'boolean' || typeof value.game !== 'boolean' ||
        typeof value.checkedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value.checkedAt)) {
      throw new Error('Invalid service report');
    }
    const timestamp = Date.parse(value.checkedAt);
    if (!Number.isFinite(timestamp) ||
        new Date(timestamp).toISOString().slice(0, 19) !== value.checkedAt.slice(0, 19) ||
        !isFresh(timestamp)) {
      throw new Error('Service report is not current');
    }
    return { accounts: value.accounts, game: value.game, timestamp };
  }

  function setState(element, state) {
    element.dataset.state = state;
    element.textContent = state[0].toUpperCase() + state.slice(1);
  }

  function render() {
    clearTimeout(expiryTimer);
    ui.source.textContent = 'Automatic health check';
    if (!report || !isFresh(report.timestamp)) {
      report = null;
      setState(ui.accounts, 'unknown');
      setState(ui.game, 'unknown');
      ui.summary.textContent = 'Waiting for a current service report.';
      ui.updated.textContent = 'No current report';
      return;
    }
    setState(ui.accounts, report.accounts ? 'online' : 'offline');
    setState(ui.game, report.game ? 'online' : 'offline');
    ui.summary.textContent = report.accounts && report.game
      ? 'Services are reporting healthy.'
      : 'One or more services are unavailable.';
    ui.updated.textContent = 'Checked ' + new Date(report.timestamp).toLocaleString(undefined, {
      dateStyle: 'medium', timeStyle: 'short',
    });
    expiryTimer = setTimeout(render, Math.max(1, maxAgeMs + 1 - (Date.now() - report.timestamp)));
  }

  async function refreshStatus() {
    if (refreshing) return;
    refreshing = true;
    ui.refresh.disabled = true;
    try {
      const response = await fetch(endpoint, {
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error('Service report unavailable');
      report = parseReport(await response.json());
      render();
    } catch {
      report = null;
      render();
    } finally {
      refreshing = false;
      ui.refresh.disabled = false;
    }
  }

  ui.refresh.addEventListener('click', () => { void refreshStatus(); });
  document.addEventListener('visibilitychange', () => {
    render();
    if (!document.hidden) void refreshStatus();
  });
  setInterval(() => { void refreshStatus(); }, 30000);
  render();
  void refreshStatus();
})();
