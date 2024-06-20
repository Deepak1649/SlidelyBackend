"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
const dbPath = path_1.default.join(__dirname, '..', 'db.json');
// Read submissions from the JSON file
let submissions;
try {
    const data = fs_1.default.readFileSync(dbPath, 'utf8');
    submissions = JSON.parse(data).submissions;
}
catch (err) {
    console.error('Error reading database:', err);
    submissions = [];
}
// Endpoint: /ping
app.get('/ping', (req, res) => {
    res.json(true);
});
// Endpoint: /submit
app.post('/submit', (req, res) => {
    const { name, email, phone, GithubLink, Stopwatch } = req.body;
    const submission = { name, email, phone, GithubLink, Stopwatch };
    submissions.push(submission);
    saveSubmissions();
    res.json({ message: 'Submission saved' });
});
// Endpoint: /read
app.get('/read', (req, res) => {
    const index = parseInt(req.query.index, 10);
    if (isNaN(index) || index < 0 || index >= submissions.length) {
        res.status(400).json({ error: 'Invalid index' });
    }
    else {
        res.json(submissions[index]);
    }
});
// New endpoint: /delete
app.delete('/delete', (req, res) => {
    const index = parseInt(req.query.index, 10);
    if (isNaN(index) || index < 0 || index >= submissions.length) {
        res.status(400).json({ error: 'Invalid index' });
    }
    else {
        submissions.splice(index, 1);
        saveSubmissions();
        res.json({ message: 'Submission deleted' });
    }
});
app.get('/search', (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }
    const result = submissions.filter(submission => submission.email === email);
    if (result.length > 0) {
        res.json(result);
    }
    else {
        res.status(404).json({ error: 'Submission not found' });
    }
});
app.post('/update', (req, res) => {
    const index = req.body.index;
    if (isNaN(index) || index < 0 || index >= submissions.length) {
        return res.status(400).json({ error: 'Invalid index' });
    }
    const { name, email, phone, GithubLink, Stopwatch } = req.body;
    submissions[index] = { name, email, phone, GithubLink, Stopwatch };
    saveSubmissions();
    res.status(200).json({ success: true });
});
// Save submissions to the JSON file
function saveSubmissions() {
    const data = JSON.stringify({ submissions }, null, 2);
    fs_1.default.writeFileSync(dbPath, data, 'utf8');
}
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
