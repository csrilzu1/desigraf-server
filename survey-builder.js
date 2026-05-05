// ================================
// DESIGRAF - SURVEY BUILDER ENGINE
// ================================

class SurveyBuilder {
  constructor() {
    this.survey = null;
  }

  // =========================
  // INIT NEW SURVEY
  // =========================
  createSurvey(config) {
    this.survey = {
      id: null,
      title: config.title || "",
      email: config.email || "",
      password: config.password || null,
      theme: {
        color: config.color || "#ffffff",
        font: config.font || "default"
      },
      mediaIntro: config.media || null,
      validUntil: config.validUntil || null,
      settings: {
        shuffleSections: false,
        enableBranching: false,
        allowSectionMedia: false
      },
      sections: [],
      status: "draft"
    };
  }

  // =========================
  // GLOBAL SETTINGS
  // =========================
  updateSettings(settings) {
    Object.assign(this.survey.settings, settings);
  }

  // =========================
  // ADD SECTION
  // =========================
  addSection() {
    const section = {
      id: "sec_" + Date.now(),
      title: "",
      media: null,
      questions: []
    };
    this.survey.sections.push(section);
    return section;
  }

  // =========================
  // DELETE SECTION
  // =========================
  deleteSection(sectionId) {
    this.survey.sections = this.survey.sections.filter(
      s => s.id !== sectionId
    );
  }

  // =========================
  // ADD QUESTION
  // =========================
  addQuestion(sectionId, text, description = "") {
    const section = this._findSection(sectionId);
    if (!section) return;

    const question = {
      id: "q_" + Date.now(),
      text,
      description,
      required: false,
      shuffleAnswers: false,
      allowMultiple: false,
      affectsStats: true,
      canEndSurvey: false,
      hasMedia: false,
      pointsEnabled: false,
      answers: []
    };

    section.questions.push(question);
    return question;
  }

  // =========================
  // UPDATE QUESTION SETTINGS
  // =========================
  updateQuestionSettings(questionId, settings) {
    const q = this._findQuestion(questionId);
    if (!q) return;

    Object.assign(q, settings);
  }

  // =========================
  // ADD ANSWER
  // =========================
  addAnswer(questionId, text, description = "") {
    const question = this._findQuestion(questionId);
    if (!question) return;

    const answer = {
      id: "a_" + Date.now(),
      text,
      description,
      isCorrect: false,
      points: 0,
      redirect: null,
      media: null
    };

    question.answers.push(answer);
    return answer;
  }

  // =========================
  // UPDATE ANSWER
  // =========================
  updateAnswer(answerId, settings) {
    const a = this._findAnswer(answerId);
    if (!a) return;

    Object.assign(a, settings);
  }

  // =========================
  // SET REDIRECT LOGIC
  // =========================
  setRedirect(answerId, target) {
    const a = this._findAnswer(answerId);
    if (!a) return;

    // target: { sectionId?, questionId? }
    a.redirect = target;
  }

  // =========================
  // MEDIA ATTACHMENT
  // =========================
  attachMediaToQuestion(questionId, file) {
    const q = this._findQuestion(questionId);
    if (!q) return;

    q.media = file;
  }

  attachMediaToAnswer(answerId, file) {
    const a = this._findAnswer(answerId);
    if (!a) return;

    a.media = file;
  }

  attachMediaToSection(sectionId, file) {
    const s = this._findSection(sectionId);
    if (!s) return;

    s.media = file;
  }

  // =========================
  // VALIDATION
  // =========================
  validateSurvey() {
    if (!this.survey.title) {
      throw new Error("Анкетата няма заглавие");
    }

    if (this.survey.sections.length === 0) {
      throw new Error("Няма секции");
    }

    this.survey.sections.forEach(section => {
      if (section.questions.length === 0) {
        throw new Error("Секция без въпроси");
      }

      section.questions.forEach(q => {
        if (!q.text) {
          throw new Error("Въпрос без текст");
        }

        if (q.answers.length === 0) {
          throw new Error("Въпрос без отговори");
        }
      });
    });

    return true;
  }

  // =========================
  // FINALIZE
  // =========================
  finalizeSurvey() {
    this.validateSurvey();

    this.survey.status = "ready";

    return this.survey;
  }

  // =========================
  // EXPORT (за backend)
  // =========================
  export() {
    return this.survey;
  }

  // =========================
  // HELPERS
  // =========================
  _findSection(id) {
    return this.survey.sections.find(s => s.id === id);
  }

  _findQuestion(id) {
    for (let s of this.survey.sections) {
      const q = s.questions.find(q => q.id === id);
      if (q) return q;
    }
    return null;
  }

  _findAnswer(id) {
    for (let s of this.survey.sections) {
      for (let q of s.questions) {
        const a = q.answers.find(a => a.id === id);
        if (a) return a;
      }
    }
    return null;
  }
}

module.exports = SurveyBuilder;