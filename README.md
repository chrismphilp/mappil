# Mappil

Learn the world one map at a time.

Check out the website here: https://www.mappil.com!

## Development

Use Node.js 24 LTS (24.22.1 is pinned in `.node-version`) and npm. The Node.js
type definitions stay on version 24 to match the supported runtime.

```sh
npm ci
npm run dev
```

Before opening a PR, run:

```sh
npm test
npm run typecheck
npm run build
npm audit
```

The build exports the site to `out/`. If changing Supabase Edge Functions, also
check both entry points with Deno:

```sh
deno check --no-lock supabase/functions/submit-score/index.ts supabase/functions/create-friend-challenge/index.ts
```

## Browser support

The globe requires WebGL 2. Tailwind CSS 4 requires Safari 16.4+, Chrome 111+,
and Firefox 128+; see the [Tailwind upgrade guide](https://tailwindcss.com/docs/upgrade-guide#browser-requirements).

## Supported Maps

| Map | Description |
|:--------|:-------------|
| World Countries | All 230 Countries from across the globe |
| US States | States of the United States of America |
| UK Administrative Regions | The administrative regions of the UK |
