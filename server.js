const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Password hashing library
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Created data directory');
}

// Path to the Excel files
const EXCEL_FILE = path.join(dataDir, 'users.xlsx');
const MEETING_FILE = path.join(dataDir, 'meetings.xlsx');
const STUDENT_ID_FILE = path.join(dataDir, 'student_ids.xlsx');
const CERTIFICATE_FILE = path.join(dataDir, 'certificates.xlsx');

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Ensure the Excel files exist with headers
function ensureFileExists(filePath, headers) {
    if (!fs.existsSync(filePath)) {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([headers]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        xlsx.writeFile(workbook, filePath);
        console.log(`${filePath} created with headers.`);
    }
}

ensureFileExists(EXCEL_FILE, ["Username", "Email", "Password", "Role"]);
ensureFileExists(MEETING_FILE, ["Id", "Topic", "Date", "Time", "Host", "Link"]);
ensureFileExists(STUDENT_ID_FILE, ["StudentId", "Name", "Email", "CreatedAt"]);
ensureFileExists(CERTIFICATE_FILE, ["StudentId", "CertificateNumber", "IssuedAt"]);

// Helper functions for reading/writing Excel files
function readExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];
    return xlsx.utils.sheet_to_json(sheet, { header: 1 });
}

function writeExcelFile(filePath, data) {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    xlsx.writeFile(workbook, filePath);
}

// Routes

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API status route
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: 'Server is running' });
});

// Register user
app.post('/register', (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const validRoles = ["user", "admin"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role provided." });
    }

    const data = readExcelFile(EXCEL_FILE);
    for (let row of data.slice(1)) {
        if (row[1] === email) {
            return res.status(409).json({ message: "Email already exists." });
        }
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    data.push([username, email, hashedPassword, role]);
    writeExcelFile(EXCEL_FILE, data);

    res.status(201).json({ message: "User registered successfully." });
});

// Login user
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const data = readExcelFile(EXCEL_FILE);
    for (let row of data.slice(1)) {
        if (row[1] === email && bcrypt.compareSync(password, row[2])) {
            return res.status(200).json({
                message: "Login successful.",
                username: row[0],
                role: row[3],
            });
        }
    }

    res.status(401).json({ message: "Invalid credentials." });
});

// Fetch all users
app.get('/users', (req, res) => {
    const data = readExcelFile(EXCEL_FILE);
    const users = data.slice(1).map(row => ({
        username: row[0],
        email: row[1],
        role: row[3],
    }));
    res.status(200).json({ users });
});

// Edit user
app.put('/edit-user', (req, res) => {
    const { email, username, role } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    const data = readExcelFile(EXCEL_FILE);
    const header = data[0];
    let updated = false;

    const updatedData = data.map(row => {
        if (row[1] === email) {  // Looking for the user by email
            updated = true;
            return [username || row[0], email, row[2], role || row[3]];  // Update only if fields are provided
        }
        return row;
    });

    if (updated) {
        writeExcelFile(EXCEL_FILE, [header, ...updatedData]);
        res.status(200).json({ message: "User updated successfully." });
    } else {
        res.status(404).json({ message: "User not found." });
    }
});

// Delete users
app.delete('/delete-users', (req, res) => {
    const { users } = req.body;  // This should be an array of emails to delete

    if (!users || users.length === 0) {
        return res.status(400).json({ message: "No users specified for deletion." });
    }

    const data = readExcelFile(EXCEL_FILE);
    const header = data[0]; // Keep the header row

    // Filter out the users to be deleted
    const updatedData = data.filter(row => {
        return !users.includes(row[1]);  // row[1] corresponds to the email
    });

    // If no users were deleted (i.e., all users were filtered out)
    if (updatedData.length === data.length) {
        return res.status(404).json({ message: "No matching users found to delete." });
    }

    // Ensure we always write back the header followed by the updated rows
    writeExcelFile(EXCEL_FILE, [header, ...updatedData]);

    res.status(200).json({ message: "Users deleted successfully." });
});

// Bulk update users
app.put('/bulk-update-users', (req, res) => {
    const { users } = req.body;  // This should be an array of user objects with email and role

    if (!users || users.length === 0) {
        return res.status(400).json({ message: "No users specified for update." });
    }

    const data = readExcelFile(EXCEL_FILE);
    const header = data[0];
    let updated = false;

    const updatedData = data.map(row => {
        const userToUpdate = users.find(user => user.email === row[1]);
        if (userToUpdate) {
            updated = true;
            return [row[0], row[1], row[2], userToUpdate.role];  // Update the role
        }
        return row;
    });

    if (updated) {
        writeExcelFile(EXCEL_FILE, [header, ...updatedData]);
        res.status(200).json({ message: "Users updated successfully." });
    } else {
        res.status(404).json({ message: "No matching users found to update." });
    }
});

// Fetch all meetings
app.get('/meetings', (req, res) => {
    const data = readExcelFile(MEETING_FILE);
    const meetings = data.slice(1).map(row => ({
        id: row[0],
        topic: row[1],
        date: row[2],
        time: row[3],
        host: row[4],
        link: row[5],
    }));
    res.status(200).json({ meetings });
});

// Schedule a meeting
app.post('/schedule-meeting', (req, res) => {
    const { topic, date, time, host, link } = req.body;

    if (!topic || !date || !time || !host || !link) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const id = uuidv4();
    const data = readExcelFile(MEETING_FILE);
    data.push([id, topic, date, time, host, link]);
    writeExcelFile(MEETING_FILE, data);

    res.status(201).json({ message: "Meeting scheduled successfully." });
});

// Edit meeting
app.put('/edit-meeting', (req, res) => {
    const { id, topic, date, time, host, link } = req.body;

    const data = readExcelFile(MEETING_FILE);
    const header = data[0];
    let updated = false;

    const updatedData = data.map(row => {
        if (row[0] === id) {
            updated = true;
            return [id, topic, date, time, host, link];
        }
        return row;
    });

    if (updated) {
        writeExcelFile(MEETING_FILE, [header, ...updatedData]);
        res.status(200).json({ message: "Meeting updated successfully." });
    } else {
        res.status(404).json({ message: "Meeting not found." });
    }
});

// Delete meeting
app.delete('/delete-meeting', (req, res) => {
    const { id } = req.body;

    const data = readExcelFile(MEETING_FILE);
    const header = data[0];
    const updatedData = data.filter(row => row[0] !== id);

    writeExcelFile(MEETING_FILE, [header, ...updatedData]);
    res.status(200).json({ message: "Meeting deleted successfully." });
});

// Get all student IDs
app.get('/generatedstudentidofregisteredstudentatstudenterastudentid', (req, res) => {
    try {
        const data = readExcelFile(STUDENT_ID_FILE);
        const students = data.slice(1).map(row => row[0]); // Extract just the student IDs
        res.status(200).json({ students });
    } catch (error) {
        console.error('Error fetching student IDs:', error);
        res.status(500).json({ message: "Error fetching student IDs" });
    }
});

// Generate a new student ID
app.post('/generatestudentid', (req, res) => {
    try {
        const { name, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required." });
        }
        
        // Generate a unique student ID (e.g., SE12345)
        const studentId = 'SE' + Math.floor(10000 + Math.random() * 90000);
        const createdAt = new Date().toISOString();
        
        const data = readExcelFile(STUDENT_ID_FILE);
        data.push([studentId, name, email, createdAt]);
        writeExcelFile(STUDENT_ID_FILE, data);
        
        res.status(201).json({ 
            message: "Student ID generated successfully.",
            studentId
        });
    } catch (error) {
        console.error('Error generating student ID:', error);
        res.status(500).json({ message: "Error generating student ID" });
    }
});

// Get all certificates
app.get('/progressreportuserofinternshipscompletedinternship', (req, res) => {
    try {
        const data = readExcelFile(CERTIFICATE_FILE);
        const certificates = data.slice(1).map(row => ({
            studentId: row[0],
            certificateNumber: row[1],
            issuedAt: row[2]
        }));
        res.status(200).json(certificates);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ message: "Error fetching certificates" });
    }
});

// Generate a certificate for a student
app.post('/progressreportuserofinternshipscompletedinternship', (req, res) => {
    try {
        const { studentId, certificateNumber } = req.body;
        
        if (!studentId || !certificateNumber) {
            return res.status(400).json({ message: "Student ID and certificate number are required." });
        }
        
        // Check if the student ID exists
        const studentData = readExcelFile(STUDENT_ID_FILE);
        const studentExists = studentData.slice(1).some(row => row[0] === studentId);
        
        if (!studentExists) {
            return res.status(404).json({ message: "Student ID not found." });
        }
        
        // Check if a certificate already exists for this student
        const certData = readExcelFile(CERTIFICATE_FILE);
        const certExists = certData.slice(1).some(row => row[0] === studentId);
        
        if (certExists) {
            return res.status(409).json({ message: "Certificate already exists for this student." });
        }
        
        const issuedAt = new Date().toISOString();
        certData.push([studentId, certificateNumber, issuedAt]);
        writeExcelFile(CERTIFICATE_FILE, certData);
        
        res.status(201).json({ 
            message: "Certificate generated successfully.",
            studentId,
            certificateNumber,
            issuedAt
        });
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).json({ message: "Error generating certificate" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});