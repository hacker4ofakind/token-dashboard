import { api, fmt } from '/web/app.js';

export default async function (root) {
  const rows = await api('/api/prompts?limit=100');
  root.innerHTML = `
    <div class="card">
      <h2>Expensive prompts</h2>
      <p class="muted" style="margin:-8px 0 14px">Each row is a user prompt + the assistant turn it triggered. Click to expand.</p>
      <table id="prompts">
        <thead><tr><th class="num">cache cost</th><th>prompt</th><th>model</th><th class="num">tokens</th><th class="num">cache rd</th><th>session</th></tr></thead>
        <tbody>
          ${rows.map((r,i) => `
            <tr data-i="${i}" style="cursor:pointer">
              <td class="num mono">${fmt.usd4(r.estimated_cost_usd)}</td>
              <td class="blur-sensitive">${fmt.htmlSafe(fmt.short(r.prompt_text, 110))}</td>
              <td><span class="badge ${fmt.modelClass(r.model)}">${fmt.htmlSafe(fmt.modelShort(r.model))}</span></td>
              <td class="num">${fmt.int(r.billable_tokens)}</td>
              <td class="num">${fmt.int(r.cache_read_tokens)}</td>
              <td><a href="#/sessions/${encodeURIComponent(r.session_id)}" class="mono" onclick="event.stopPropagation()">${fmt.htmlSafe(r.session_id.slice(0,8))}…</a></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div id="drawer"></div>
  `;
  root.querySelectorAll('#prompts tbody tr').forEach(tr => {
    tr.addEventListener('click', () => {
      const r = rows[Number(tr.dataset.i)];
      const drawer = document.getElementById('drawer');
      drawer.innerHTML = `
        <div class="card">
          <h3 style="display:flex;align-items:center">
            <span>Prompt detail</span>
            <span class="spacer"></span>
            <span class="badge ${fmt.modelClass(r.model)}">${fmt.htmlSafe(fmt.modelShort(r.model))}</span>
          </h3>
          <pre class="blur-sensitive">${fmt.htmlSafe(r.prompt_text || '')}</pre>
          <div class="flex" style="margin-top:12px">
            <span class="muted">${fmt.int(r.billable_tokens)} billable tokens · ${fmt.int(r.cache_read_tokens)} cache reads · ~${fmt.usd4(r.estimated_cost_usd)} cache-read cost</span>
            <span class="spacer"></span>
            <a href="#/sessions/${encodeURIComponent(r.session_id)}">Open session →</a>
          </div>
        </div>`;
      drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}
