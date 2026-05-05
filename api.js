// ================================
// DESIGRAF - API LAYER
// ================================

class API {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = null;
  }

  // =========================
  // SET TOKEN
  // =========================
  setToken(token) {
    this.token = token;
  }

  // =========================
  // HEADERS
  // =========================
  _headers() {
    return {
      "Content-Type": "application/json",
      "Authorization": this.token ? `Bearer ${this.token}` : ""
    };
  }

  // =========================
  // LOGIN
  // =========================
  async login(username, password) {
    const res = await fetch(this.baseURL + "/login", {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) throw new Error("Login failed");

    const data = await res.json();

    this.setToken(data.token);

    return data;
  }

  // =========================
  // GET SURVEYS
  // =========================
  async getSurveys() {
    const res = await fetch(this.baseURL + "/surveys", {
      method: "GET",
      headers: this._headers()
    });

    return await res.json();
  }

  // =========================
  // CREATE / SAVE SURVEY
  // =========================
  async saveSurvey(survey) {
    const res = await fetch(this.baseURL + "/survey/create", {
      method: "POST",
      headers: this._headers(),
      body: JSON.stringify(survey)
    });

    return await res.json();
  }

  // =========================
  // PUBLISH SURVEY
  // =========================
  async publishSurvey(survey) {
    const res = await fetch(
      this.baseURL + `/survey/${survey.id}/publish`,
      {
        method: "POST",
        headers: this._headers()
      }
    );

    return await res.json();
  }

  // =========================
  // GET SINGLE SURVEY (PUBLIC)
  // =========================
  async getSurvey(id) {
    const res = await fetch(this.baseURL + `/survey/${id}`);

    return await res.json();
  }

  // =========================
  // SUBMIT RESPONSE
  // =========================
  async submitResponse(surveyId, data) {
    const res = await fetch(
      this.baseURL + `/survey/${surveyId}/submit`,
      {
        method: "POST",
        headers: this._headers(),
        body: JSON.stringify(data)
      }
    );

    return await res.json();
  }

  // =========================
  // ANALYTICS
  // =========================
  async getStats(surveyId) {
    const res = await fetch(
      this.baseURL + `/survey/${surveyId}/stats`,
      {
        method: "GET",
        headers: this._headers()
      }
    );

    return await res.json();
  }

  // =========================
  // DELETE SURVEY
  // =========================
  async deleteSurvey(id) {
    const res = await fetch(
      this.baseURL + `/survey/${id}/delete`,
      {
        method: "POST",
        headers: this._headers()
      }
    );

    return await res.json();
  }

  // =========================
  // ARCHIVE SURVEY (logical)
  // =========================
  async archiveSurvey(id) {
    const res = await fetch(
      this.baseURL + `/survey/${id}/archive`,
      {
        method: "POST",
        headers: this._headers()
      }
    );

    return await res.json();
  }

  // =========================
  // HEALTH CHECK
  // =========================
  async ping() {
    const res = await fetch(this.baseURL + "/health");
    return await res.text();
  }
}

window.API = API;