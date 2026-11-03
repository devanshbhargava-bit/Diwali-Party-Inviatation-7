# Diwali invitation: setup

**Preview locally:** open `index.html` in a browser (or `python3 -m http.server`). Add `?preview` to the URL to click through the RSVP flow without a backend (nothing is saved, and a notice says so).

**Edit content:** everything placeholder is at the top of `script.js` (`CONFIG`). Bitmojis: put transparent PNGs in `assets/` and set `image: 'assets/host1.png'` per host.

**Connect Google Sheets**
1. Create a Google Sheet, then Extensions > Apps Script. Paste `apps-script/Code.gs`.
2. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Authorise and copy the Web App URL.
3. Paste the URL into `APPS_SCRIPT_URL` in `script.js`.
4. Test: submit an RSVP and check the `RSVPs` sheet. After editing the script, use Deploy > Manage deployments > New version.

**Deploy to GitHub Pages:** push these files to a repo, then Settings > Pages > Deploy from branch > `main` / root.
