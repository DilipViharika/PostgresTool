#!/usr/bin/env node
/**
 * comment.mjs
 * ───────────
 * Post (or update) a single consolidated PR comment with the findings from
 * lint.mjs. Idempotent: looks for a previous VIGIL comment (marker in body)
 * and edits it in place so repeated runs don't spam the PR.
 *
 * Requires GH_TOKEN in env (provided by the action). Uses `gh` CLI when
 * available, falls back to fetch() against api.github.com.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(
    process.argv.slice(2).map(a => a.replace(/^--/, '').split('='))
);
const findingsPath = args.findings;
const repo = args.repo;
const pr = Number(args.pr);

if (!findingsPath || !repo || !pr) {
    console.log('[comment] missing args — skipping');
    process.exit(0);
}

const report = JSON.parse(fs.readFileSync(findingsPath, 'utf8'));
const MARKER = '<!-- vigil-db-migration-review -->';

function render() {
    const { counts = {}, findings = [], engine, fileCount } = report;
    const { error = 0, warn = 0, info = 0 } = counts;
    const head = [
        MARKER,
        '### VIGIL DB Migration Review',
        '',
        `Engine: **${engine}** · Files scanned: **${fileCount}** · Findings: **${error} error**, **${warn} warn**, **${info} info**`,
        '',
    ];
    if (!findings.length) {
        head.push('No issues detected. ');
        head.push('');
        head.push('<sub>_VIGIL migration linter — `vigil db-migration-review` action_</sub>');
        return head.join('\n');
    }
    const rows = ['| Level | Rule | File | Suggestion |', '|---|---|---|---|'];
    for (const f of findings) {
        const icon = f.level === 'error' ? 'ERROR' : f.level === 'warn' ? 'WARN ' : 'info ';
        const fix = (f.fix || '').replace(/\|/g, '\\|');
        const msg = f.message.replace(/\|/g, '\\|');
        rows.push(`| \`${icon}\` | \`${f.ruleId}\` | \`${f.file}\` | ${msg}${fix ? ' — ' + fix : ''} |`);
    }
    const details = findings.map(f =>
`<details><summary><code>${f.ruleId}</code> — ${f.file}</summary>

\`\`\`sql
${f.snippet}
\`\`\`
**${f.message}**${f.fix ? `\n\nSuggestion: ${f.fix}` : ''}

</details>`
    ).join('\n');
    return head.join('\n') + '\n' + rows.join('\n') + '\n\n' + details + '\n\n<sub>_VIGIL migration linter_</sub>';
}

const body = render();

// Try gh CLI first — simpler.
function ghCli(...cmd) {
    return execFileSync('gh', cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
}

async function apiFetch(url, init = {}) {
    const token = process.env.GH_TOKEN;
    const r = await fetch(`https://api.github.com${url}`, {
        ...init,
        headers: {
            accept: 'application/vnd.github+json',
            authorization: `Bearer ${token}`,
            'x-github-api-version': '2022-11-28',
            ...(init.headers || {}),
        },
    });
    if (!r.ok) throw new Error(`GitHub ${r.status}: ${await r.text()}`);
    return r.json();
}

(async () => {
    try {
        // Find existing comment
        let comments = [];
        try {
            const raw = ghCli('api', `repos/${repo}/issues/${pr}/comments`, '--paginate');
            comments = JSON.parse(raw);
        } catch {
            comments = await apiFetch(`/repos/${repo}/issues/${pr}/comments?per_page=100`);
        }
        const existing = comments.find(c => typeof c.body === 'string' && c.body.includes(MARKER));

        if (existing) {
            try {
                ghCli('api', '--method', 'PATCH',
                    `repos/${repo}/issues/comments/${existing.id}`,
                    '-f', `body=${body}`);
            } catch {
                await apiFetch(`/repos/${repo}/issues/comments/${existing.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ body }),
                });
            }
            console.log(`[comment] updated #${existing.id}`);
        } else {
            try {
                ghCli('api', '--method', 'POST',
                    `repos/${repo}/issues/${pr}/comments`,
                    '-f', `body=${body}`);
            } catch {
                await apiFetch(`/repos/${repo}/issues/${pr}/comments`, {
                    method: 'POST',
                    body: JSON.stringify({ body }),
                });
            }
            console.log('[comment] created new comment');
        }
    } catch (err) {
        console.log(`[comment] failed: ${err.message}`);
    }
})();
