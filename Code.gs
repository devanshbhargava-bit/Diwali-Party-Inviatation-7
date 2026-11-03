/** Google Apps Script backend for the RSVP site. Paste into script.google.com (see README). */
const SHEET_NAME = 'RSVPs';
const HEADERS = ['Timestamp (server)', 'Submitted at (guest)', 'Submission ID', 'Name', 'Attending', 'Response chosen', 'Team', 'Drinking preference', 'Comments'];
const TEAMS = ['Team Devansh', 'Team Ishika'];
const DRINKS = ['Heavy Drinker', 'Light Drinker', 'Pilaoge toh mana nahi karunga', 'Sirf Chakhna khana hai'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse(e.postData.contents);
    const name = clean_(d.name, 80), id = clean_(d.id, 80);
    if (!id || name.length < 2) throw new Error('Missing name or id');
    if (d.attending !== 'Yes' && d.attending !== 'No') throw new Error('Invalid attendance');
    const yes = d.attending === 'Yes';
    if (yes && (TEAMS.indexOf(d.team) < 0 || DRINKS.indexOf(d.drinking) < 0)) throw new Error('Invalid team or drinking preference');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    const row = [new Date(), clean_(d.submittedAt, 40), id, name, d.attending, clean_(d.response, 60),
      yes ? d.team : '', yes ? d.drinking : '', clean_(d.comments, 500)];
    // Same Submission ID = same guest updating their answer: overwrite instead of duplicating.
    const ids = sh.getLastRow() > 1 ? sh.getRange(2, 3, sh.getLastRow() - 1, 1).getValues().flat() : [];
    const idx = ids.indexOf(id);
    if (idx >= 0) sh.getRange(idx + 2, 1, 1, row.length).setValues([row]); else sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Could not save RSVP: ' + err.message });
  } finally { lock.releaseLock(); }
}
// Never returns guest data.
function doGet() { return json_({ ok: true, message: 'RSVP endpoint is live.' }); }

function clean_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s; // blocks spreadsheet formula injection
}
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
