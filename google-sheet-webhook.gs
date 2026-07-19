/**
 * Javel the Hair Belle — booking → Google Sheet webhook
 *
 * SETUP (one time, ~2 minutes):
 * 1. Create a new Google Sheet (e.g. "Javel Bookings") in the Google account
 *    that should own the data.
 * 2. In the sheet: Extensions → Apps Script. Delete the starter code and
 *    paste this entire file.
 * 3. Click Deploy → New deployment → type: Web app.
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 4. Authorize when prompted, then copy the Web app URL (ends in /exec).
 * 5. Give that URL to Claude (or add it as a Netlify outgoing webhook:
 *    Site → Forms → booking → Notifications → Outgoing webhook,
 *    event "New form submission", with the /exec URL).
 *
 * Netlify then POSTs every booking here and it lands as a row in the sheet.
 */

var SHEET_NAME = 'Bookings';

var HEADERS = [
  'Submitted At',
  'Name',
  'Phone',
  'Email',
  'Style',
  'Add-ons',
  'Preferred Date',
  'Preferred Time',
  'Notes',
  'Inspiration Photo',
  'Policies Agreed',
  'Agreed At (client time)'
];

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var d = payload.data || {};

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var addons = d.addons;
    if (Array.isArray(addons)) addons = addons.join(', ');

    // File uploads arrive as an object with a url property
    var photo = d['inspiration-photo'];
    if (photo && typeof photo === 'object') photo = photo.url || '';

    sheet.appendRow([
      payload.created_at || new Date().toISOString(),
      d.name || '',
      d.phone || '',
      d.email || '',
      d.service || '',
      addons || '',
      d['preferred-date'] || '',
      d['preferred-time'] || '',
      d.notes || '',
      photo || '',
      d['policies-agreed'] || '',
      d['policies-agreed-at'] || ''
    ]);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    // Log so failures are visible in Apps Script executions, still return 200
    console.error('Booking webhook error: ' + err);
    return ContentService.createTextOutput('error: ' + err);
  }
}
