// ================================
// DESIGRAF DATABASE LAYER
// (MongoDB-style abstraction)
// ================================

const { v4: uuidv4 } = require("uuid");

// =========================
// MOCK COLLECTIONS (replace with Mongo later)
// =========================
class Database {
  constructor() {
    this.users = [];
    this.surveys = [];
    this.responses = [];
  }

  // =========================
  // USERS
  // =========================
  createUser(username, password) {
    const user = {
      id: uuidv4(),
      username,
      password,
      createdAt: new Date()
    };

    this.users.push(user);
    return user;
  }

  findUser(username, password) {
    return this.users.find(
      u => u.username === username && u.password === password
    );
  }

  getUserById(id) {
    return this.users.find(u => u.id === id);
  }

  // =========================
  // SURVEYS
  // =========================
  createSurvey(data) {
    const survey = {
      id: uuidv4(),
      ...data,
      status: "draft",
      createdAt: new Date()
    };

    this.surveys.push(survey);
    return survey;
  }

  updateSurvey(id, data) {
    const survey = this.surveys.find(s => s.id === id);
    if (!survey) return null;

    Object.assign(survey, data);
    return survey;
  }

  getSurvey(id) {
    return this.surveys.find(s => s.id === id);
  }

  getSurveysByUser(userId) {
    return this.surveys.filter(s => s.userId === userId);
  }

  deleteSurvey(id) {
    this.surveys = this.surveys.filter(s => s.id !== id);
  }

  // =========================
  // RESPONSES
  // =========================
  addResponse(surveyId, data) {
    const response = {
      id: uuidv4(),
      surveyId,
      data,
      createdAt: new Date()
    };

    this.responses.push(response);
    return response;
  }

  getResponsesBySurvey(surveyId) {
    return this.responses.filter(r => r.surveyId === surveyId);
  }

  // =========================
  // ANALYTICS HELPERS
  // =========================
  countResponses(surveyId) {
    return this.getResponsesBySurvey(surveyId).length;
  }
}

module.exports = new Database();