import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(bodyParser.json()); 

interface Submission {
  name: string;
  email: string;
  phone: string;
  GithubLink: string;
  Stopwatch: string;
}

const dbPath = path.join(__dirname,'..', 'db.json');

// Read submissions from the JSON file
let submissions: Submission[];
try {
  const data = fs.readFileSync(dbPath, 'utf8');
  submissions = JSON.parse(data).submissions;
} catch (err) {
  console.error('Error reading database:', err);
  submissions = [];
}

// Endpoint: /ping
app.get('/ping', (req: Request, res: Response) => {
  res.json(true);
});

// Endpoint: /submit
app.post('/submit', (req: Request, res: Response) => {
  const { name, email, phone, GithubLink, Stopwatch } = req.body;
  const submission: Submission = { name, email, phone, GithubLink, Stopwatch };
  submissions.push(submission);
  saveSubmissions();
  res.json({ message: 'Submission saved' });
});

// Endpoint: /read
app.get('/read', (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  if (isNaN(index) || index < 0 || index >= submissions.length) {
    res.status(400).json({ error: 'Invalid index' });
  } else {
    res.json(submissions[index]);
  }
});

// New endpoint: /delete
app.delete('/delete', (req: Request, res: Response) => {
  const index = parseInt(req.query.index as string, 10);
  if (isNaN(index) || index < 0 || index >= submissions.length) {
    res.status(400).json({ error: 'Invalid index' });
  } else {
    submissions.splice(index, 1);
    saveSubmissions();
    res.json({ message: 'Submission deleted' });
  }
});

app.get('/search', (req: Request, res: Response) => {
  const email = req.query.email as string;
  if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
  }
  
  const result = submissions.filter(submission => submission.email === email);
  if (result.length > 0) {
      res.json(result);
  } else {
      res.status(404).json({ error: 'Submission not found' });
  }
});

app.post('/update', (req: Request, res: Response) => {
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
  fs.writeFileSync(dbPath, data, 'utf8');
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});