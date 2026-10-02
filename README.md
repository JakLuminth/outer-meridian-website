# Outer Meridian website

Public static website for https://playoutermeridian.com, hosted by DigitalOcean App Platform.

`playoutermeridian.net` and both `www` addresses redirect to the canonical `.com` address through App Platform ingress rules. DigitalOcean manages DNS and HTTPS; domain registration and renewals remain at Porkbun.

The commonroom image is concept art showing the intended visual direction, not a screenshot of the current game. This repository contains website assets only. Hosted gameplay and client distribution are managed separately from this website.

To update the site, edit these static files and push to `main`, then trigger a new build/deployment in DigitalOcean's control panel. The app reads this public Git repository without a private repository integration. No game backend is deployed with this site.

## Automatic service availability

`status.js` polls `https://api.playoutermeridian.com/status.json` every 30 seconds,
with an eight-second timeout. The website can remain on static hosting: these
requests run in the visitor's browser. No manually maintained status file is
published with the site.

The future backend must provide a public, credential-free report:

```json
{"accounts": true, "game": true, "checkedAt": "2026-10-02T22:00:00Z"}
```

`accounts` and `game` are strict booleans from actual service checks. `checkedAt`
is the UTC observation time. Reports older than 90 seconds, invalid responses,
network failures, and an unconfigured endpoint display Unknown. Fetching this
website successfully does not establish that either game service is online.

When provisioning a replacement backend, configure the `api` DNS record and
valid HTTPS, install the automatic status publisher, and allow public GETs from
`https://playoutermeridian.com` through CORS. The existing game repository's
`deploy/linux/setup-public-status.sh` installs the status generator/timer:
it checks backend health (including the database) and the game process's live
database lease, then regenerates the report every 15 seconds. The standalone
installer requires the backend, database, game service, and nginx configuration;
it has no client-download staging requirement.

An unconfigured or unavailable feed displays Unknown. The panel updates
automatically once a fresh report becomes reachable. No
manual Online/Offline edits are needed during normal operation.
