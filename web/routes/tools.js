import { api, fmt } from '/web/app.js';
import { barChart } from '/web/charts.js';

export default async function (root) {
  const tools = await api('/api/tools');
  root.innerHTML = `
    <div class="card">
      <h2>Tool & file heatmap</h2>
      <p class="muted" style="margin:-8px 0 14px">Which tools are used most. Result-token estimates show how much of your context is being filled by tool output.</p>
      <div id="ch" style="height:340px"></div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>By tool</h3>
      <table>
        <thead><tr><th>tool</th><th class="num">calls</th><th class="num">est. result tokens</th></tr></thead>
        <tbody>
          ${tools.map(t => `
            <tr>
              <td><span class="badge">${fmt.htmlSafe(t.tool_name)}</span></td>
              <td class="num">${fmt.int(t.calls)}</td>
              <td class="num">${fmt.int(t.result_tokens)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  const top = tools.slice(0, 12);
  barChart(document.getElementById('ch'), {
    categories: top.map(t => t.tool_name),
    values: top.map(t => t.calls),
    color: '#7C5CFF',
  });
}
