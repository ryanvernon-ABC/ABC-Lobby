const express = require('express');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const XLSX = require('xlsx');

const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;

const EXCEL_PATH = path.join(__dirname, 'data', 'visitor-checkins.xlsx');
const LABEL_DIR = path.join(__dirname, 'tmp', 'labels');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureWorkbook() {
  if (fs.existsSync(EXCEL_PATH)) {
    return XLSX.readFile(EXCEL_PATH);
  }

  const workbook = XLSX.utils.book_new();
  const headers = [['Name', 'Reason for Visit', 'Check-In Time']];
  const worksheet = XLSX.utils.aoa_to_sheet(headers);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CheckIns');
  XLSX.writeFile(workbook, EXCEL_PATH);
  return workbook;
}

function addCheckInToWorkbook({ name, reasonForVisit, checkInTime }) {
  const workbook = ensureWorkbook();
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  XLSX.utils.sheet_add_aoa(
    worksheet,
    [[name, reasonForVisit, checkInTime]],
    { origin: -1 }
  );

  XLSX.writeFile(workbook, EXCEL_PATH);
}

async function printNameTag({ name, checkInTime }) {
  const printerName = process.env.TAG_PRINTER_NAME;

  if (!fs.existsSync(LABEL_DIR)) {
    fs.mkdirSync(LABEL_DIR, { recursive: true });
  }

  const safeName = name.replace(/[^a-z0-9-_]/gi, '_').slice(0, 40) || 'visitor';
  const filename = `${Date.now()}-${safeName}.txt`;
  const labelPath = path.join(LABEL_DIR, filename);

  const labelContent = [
    'VISITOR BADGE',
    '====================',
    `Name: ${name}`,
    `Check-In: ${checkInTime}`,
    '',
    'Please wear this badge at all times.'
  ].join('\n');

  fs.writeFileSync(labelPath, labelContent, 'utf8');

  if (!printerName) {
    return {
      attempted: false,
      message:
        'TAG_PRINTER_NAME is not set. Name tag file was generated but not sent to a printer.',
      labelPath
    };
  }

  try {
    await execFileAsync('lp', ['-d', printerName, labelPath]);
    return {
      attempted: true,
      printed: true,
      labelPath,
      message: `Sent name tag to printer queue "${printerName}".`
    };
  } catch (error) {
    return {
      attempted: true,
      printed: false,
      labelPath,
      message: `Failed to print name tag via printer queue "${printerName}": ${error.message}`
    };
  }
}

app.post('/api/signin', async (req, res) => {
  const name = (req.body.name || '').trim();
  const reasonForVisit = (req.body.reasonForVisit || '').trim();

  if (!name || !reasonForVisit) {
    return res.status(400).json({ error: 'Name and Reason for Visit are required.' });
  }

  const checkInTime = new Date().toLocaleString();

  try {
    addCheckInToWorkbook({ name, reasonForVisit, checkInTime });
    const printResult = await printNameTag({ name, checkInTime });

    return res.status(200).json({
      success: true,
      checkInTime,
      printResult
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unable to save sign-in information.',
      details: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`ABC Lobby kiosk app listening on http://localhost:${PORT}`);
});
