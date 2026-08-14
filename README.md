# OpenCode Insights

Local dashboard for OpenCode usage analytics. No cloud, no telemetry, no external services. Reads the OpenCode SQLite database read-only and renders it in the browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

## What it shows

- **Overview**: KPI cards, daily activity chart, token flow, cache hit rate, models, tools, projects
- **Sessions**: searchable table with project filters, drill into any session for full detail
- **Session detail**: full message timeline, reasoning blocks, tool calls with input/output, files changed, todos, token breakdown
- **Tools**: every tool call across all sessions, filterable by tool and status, paginated
- **Projects**: activity breakdown across your codebases
- **Models**: model usage distribution and trends
- **Files**: files touched per project
- **Todos**: todos created and completed per session
- **Agents**: agent usage stats

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3777

### Production

```bash
npm run build
npm run start
```

## Data source

Reads `%USERPROFILE%\.local\share\opencode\opencode.db` in read-only mode. The connection is opened with `PRAGMA query_only` so the dashboard can never write to your OpenCode data.

Override the path if needed:

```bash
OPENCODE_DB_PATH="C:\\path\\to\\opencode.db" npm run dev
```

Click Refresh in the header to reload after a new session, no restart needed.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 with navy and gold design tokens
- `node:sqlite` for database access, zero native dependencies
- Hand-rolled SVG charts, no chart library
- Dark theme by default with light/dark toggle

## Screenshots

![Overview Dashboard](https://opencode-insights.dev/screenshots/overview.png)
![Session Detail](https://opencode-insights.dev/screenshots/session-detail.png)

## FAQ

**Is my data uploaded anywhere?**
No. Everything stays on your machine. The dashboard reads your local SQLite file and never sends data anywhere.

**Does it modify my OpenCode database?**
No. It opens the database with `PRAGMA query_only`.

**Which OpenCode version is required?**
Any version that writes to the standard SQLite database at `%USERPROFILE%\.local\share\opencode\opencode.db`.

## License

MIT
