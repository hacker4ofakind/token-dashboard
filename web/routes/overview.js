import { api, fmt } from '/web/app.js';
import { barChart, donutChart } from '/web/charts.js';

export default async function (root) {
  const [totals, projects, sessions, tools] = await Promise.all([
    api('/api/overview'),
    api('/api/projects'),
    api('/api/sessions?limit=10'),
    api('/api/tools'),
  ]);

  const cacheTotal =
    (totals.cache_read_tokens || 0) +
    (totals.cache_create_5m_tokens || 0) +
    (totals.cache_create_1h_tokens || 0) +
    (totals.input_tokens || 0);
  const cacheHit = cacheTotal ? totals.cache_read_tokens / cacheTotal : 0;

  // model split for donut
  const modelTotals = {};
  for (const p of projects) {
    // we don't have per-model in projects yet; donut comes from tools-as-proxy
  }

  root.innerHTML = `
    <div class="row cols-4">
      <div class="card kpi"><div class="label">Sessions</div><div class="value">${fmt.int(totals.sessions)}</div></div>
      <div class="card kpi"><div class="label">Turns</div><div class="value">${fmt.int(totals.turns)}</div></div>
      <div class="card kpi"><div class="label">Output tokens</div><div class="value">${fmt.int(totals.output_tokens)}</div></div>
      <div class="card kpi"><div class="label">Cache hit</div><div class="value">${fmt.pct(cacheHit)}</div></div>
    </div>

    <div class="row cols-2" style="margin-top:16px">
      <div class="card"><h3>Tokens by project</h3><div id="ch-projects" style="height:300px"></div></div>
      <div class="card"><h3>Top tools (by call count)</h3><div id="ch-tools" style="height:300px"></div></div>
    </div>

    <div class="card" style="margin-top:16px">
      <h3 style="display:flex;align-items:center"><span>Recent sessions</span><span class="spacer"></span><a href="#/sessions" style="font-weight:400;font-size:12px">all sessions →</a></h3>
      <table>
        <thead><tr><th>started</th><th>project</th><th class="num">turns</th><th class="num">tokens</th><th>session</th></tr></thead>
        <tbody>
          ${sessions.map(s => `
            <tr>
              <td class="mono">${fmt.ts(s.started)}</td>
              <td>${fmt.htmlSafe(s.project_slug)}</td>
              <td class="num">${fmt.int(s.turns)}</td>
              <td class="num">${fmt.int(s.tokens)}</td>
              <td><a href="#/sessions/${encodeURIComponent(s.session_id)}" class="mono">${fmt.htmlSafe(s.session_id.slice(0,8))}…</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;

  const topProjects = projects.slice(0, 8);
  barChart(document.getElementById('ch-projects'), {
    categories: topProjects.map(p => p.project_slug.length > 20 ? p.project_slug.slice(0, 19) + '…' : p.project_slug),
    values: topProjects.map(p => p.billable_tokens || 0),
  });

  const topTools = tools.slice(0, 8);
  barChart(document.getElementById('ch-tools'), {
    categories: topTools.map(t => t.tool_name),
    values: topTools.map(t => t.calls),
    color: '#7C5CFF',
  });
}
