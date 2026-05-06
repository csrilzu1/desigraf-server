// ================================
// DESIGRAF SURVEY SYSTEM - CORE (UPDATED)
// ================================

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ================================
// MEMORY STORAGE (TEMP DB MOCK)
// ================================
let users = [
  { id: 1, username: "admin", password: "1234" }
];

let surveys = [];
let responses = [];

// ================================
// SIMPLE TOKEN STORE (TEMP)
// ================================
let sessions = {};

// ================================
// AUTH LOGIN
// ================================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Грешно име или парола" });
  }

  const token = "token-" + user.id + "-" + Date.now();

  sessions[token] = user.id;

  res.json({
    message: "OK",
    token,
    userId: user.id
  });
});

// ================================
// AUTH CHECK (helper middleware)
// ================================
function auth(req, res, next) {
  const token = req.headers["authorization"];

  if (!token || !sessions[token]) {
    return res.status(401).json({ error: "Невалиден token" });
  }

  req.userId = sessions[token];
  next();
}

// ================================
// CREATE SURVEY
// ================================
app.post("/survey/create", auth, (req, res) => {
  const { title, password, settings } = req.body;

  const survey = {
    id: "s_" + Date.now(),
    title,
    userId: req.userId,
    password: password || null,
    settings: settings || {},
    sections: [],
    status: "draft",
    createdAt: new Date()
  };

  surveys.push(survey);

  res.json({ message: "Анкетата е създадена", survey });
});

// ================================
// ADD SECTION / QUESTIONS
// ================================
app.post("/survey/:id/section", auth, (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  if (survey.userId !== req.userId) {
    return res.status(403).json({ error: "Нямаш достъп" });
  }

  survey.sections.push(req.body);

  res.json({ message: "Секция добавена", survey });
});

// ================================
// PUBLISH SURVEY
// ================================
app.post("/survey/:id/publish", auth, (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  if (survey.userId !== req.userId) {
    return res.status(403).json({ error: "Нямаш достъп" });
  }

  survey.status = "active";

  const link = `https://your-domain.com/survey/${survey.id}`;

  res.json({
    message: "Публикувана анкета",
    link
  });
});

// ================================
// GET SURVEY (PUBLIC)
// ================================
app.get("/survey/:id", (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  if (survey.password) {
    return res.json({
      requiresPassword: true,
      id: survey.id
    });
  }

  res.json(survey);
});

// ================================
// SUBMIT RESPONSE
// ================================
app.post("/survey/:id/submit", (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  const response = {
    id: "r_" + Date.now(),
    surveyId: survey.id,
    data: req.body,
    createdAt: new Date()
  };

  responses.push(response);

  res.json({ message: "Отговор записан" });
});

// ================================
// ANALYTICS
// ================================
app.get("/survey/:id/stats", auth, (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  if (survey.userId !== req.userId) {
    return res.status(403).json({ error: "Нямаш достъп" });
  }

  const surveyResponses = responses.filter(
    r => r.surveyId === req.params.id
  );

  res.json({
    totalResponses: surveyResponses.length,
    responses: surveyResponses
  });
});

// ================================
// DELETE SURVEY
// ================================
app.post("/survey/:id/delete", auth, (req, res) => {
  const survey = surveys.find(s => s.id === req.params.id);

  if (!survey) return res.status(404).json({ error: "Няма анкета" });

  if (survey.userId !== req.userId) {
    return res.status(403).json({ error: "Нямаш достъп" });
  }

  surveys = surveys.filter(s => s.id !== req.params.id);

  res.json({ message: "Изтрита анкета" });
});

// ================================
// SERVER START (IMPORTANT FIX)
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Desigraf server running on port " + PORT);
});