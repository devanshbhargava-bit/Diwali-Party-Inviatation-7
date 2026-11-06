/** Google Apps Script backend: saves RSVPs and hands each YES guest their own secret mission. */
const SHEET_NAME = 'RSVPs';
const HEADERS = ['Timestamp (server)', 'Submitted at (guest)', 'Submission ID', 'Name', 'Attending', 'Response chosen', 'Team', 'Drinking preference', 'Comments', 'Mission'];
const TEAMS = ['Team Devansh', 'Team Ishika'];
const DRINKS = ['Heavy Drinker', 'Light Drinker', 'Pilaoge toh mana nahi karunga', 'Sirf Chakhna khana hai'];
const N = HEADERS.length - 1; // columns the site writes; the last column (Mission) is filled by you

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse(e.postData.contents);
    const sh = sheet_();
    if (d.action === 'mission') return json_(missionFor_(sh, d));

    const name = clean_(d.name, 80), id = clean_(d.id, 80);
    if (!id || name.length < 2) throw new Error('Missing name or id');
    if (d.attending !== 'Yes' && d.attending !== 'No') throw new Error('Invalid attendance');
    const yes = d.attending === 'Yes';
    if (yes && (TEAMS.indexOf(d.team) < 0 || DRINKS.indexOf(d.drinking) < 0)) throw new Error('Invalid team or drinking preference');
    const row = [new Date(), clean_(d.submittedAt, 40), id, name, d.attending, clean_(d.response, 60),
      yes ? d.team : '', yes ? d.drinking : '', clean_(d.comments, 500)];
    // Same ID (same phone) = the same guest updating their answer: overwrite instead of duplicating.
    const r = findRow_(sh, id);
    if (r > 0) sh.getRange(r, 1, 1, N).setValues([row]); else sh.appendRow(row); // Mission column is never touched
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Could not save: ' + err.message });
  } finally { lock.releaseLock(); }
}
// Never returns guest data.
function doGet() { return json_({ ok: true, message: 'RSVP endpoint is live.' }); }

// Returns ONLY the asking guest's own mission (and only if they RSVP'd YES).
function missionFor_(sh, d) {
  const r = findRow_(sh, String(d.id || '').trim());
  if (r < 0) return { ok: true, status: 'notfound' };
  const row = sh.getRange(r, 1, 1, HEADERS.length).getValues()[0];
  if (row[4] !== 'Yes') return { ok: true, status: 'notfound' };
  const m = String(row[N] || '').trim();
  return m ? { ok: true, status: 'ok', mission: m } : { ok: true, status: 'pending' };
}
function findRow_(sh, id) {
  const n = sh.getLastRow(); if (n < 2 || !id) return -1;
  const ids = sh.getRange(2, 3, n - 1, 1).getValues().flat();
  const i = ids.indexOf(id); return i < 0 ? -1 : i + 2;   // matched by the guest's own Submission ID only, never by name
}
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  if (sh.getRange(1, HEADERS.length).getValue() !== 'Mission') sh.getRange(1, HEADERS.length).setValue('Mission'); // adds the column to an older sheet
  return sh;
}
function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // blocks spreadsheet formula injection
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
