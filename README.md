# Outer Meridian website

Public static website for https://playoutermeridian.com, hosted by DigitalOcean App Platform.

`playoutermeridian.net` and both `www` addresses redirect to the canonical `.com` address through App Platform ingress rules. DigitalOcean manages DNS and HTTPS; domain registration and renewals remain at Porkbun.

The commonroom image is concept art showing the intended visual direction, not a screenshot of the current game. This repository contains website assets only. Hosted gameplay and client distribution are presently offline.

To update the site, edit these static files and push to `main`, then trigger a new build/deployment in DigitalOcean's control panel. The app reads this public Git repository without a private repository integration. No game backend is deployed with this site.
