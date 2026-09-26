export const ACHIEVE_OPTIONS = [
  'Money & Finance',
  'Growth in Business',
  'Growth in Career',
  'Good Health',
  'Good Relationship',
  'Self Growth',
  'Energy & Passion',
  'Want Control on my Mind',
  'Want Mental Peace, Clarity & Happiness',
  'Remove Stress, Anxiety & Overthinking',
] as const;

export const INITIAL_FORM_DATA = {
  fullName: '',
  contactNumber: '',
  city: '',
  achieveSoonest: [] as string[],
  otherAchieve: '',
  challenges: '',
  expectations: '',
  additionalInfo: '',
};

export const APPS_SCRIPT_TEMPLATE = `// -------------------------------------------------------------
// Google Apps Script code for Advanced Manifestation Form
// Paste this into Extensions > Apps Script in your Google Sheet,
// then click Deploy > New Deployment > Web App (Access: Anyone)
// -------------------------------------------------------------

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Set headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Submission ID",
        "Full Name",
        "Contact Number",
        "City",
        "What to Achieve Soonest",
        "Current Challenges",
        "Expectations from Program",
        "Additional Information / Situation"
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f3f4f6");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.submissionId || "",
      data.fullName || "",
      data.contactNumber || "",
      data.city || "",
      data.achieveSoonest || "",
      data.challenges || "",
      data.expectations || "",
      data.additionalInfo || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Advanced Manifestation Form Webhook is Live!");
}
`;
