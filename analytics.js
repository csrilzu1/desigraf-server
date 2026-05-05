// ================================
// DESIGRAF - ANALYTICS ENGINE
// ================================

class AnalyticsEngine {
  constructor(responses, survey) {
    this.responses = responses || [];
    this.survey = survey;
  }

  // =========================
  // FILTER ENGINE
  // =========================
  applyFilters(filters) {
    let data = [...this.responses];

    if (filters.gender) {
      data = data.filter(r => r.meta?.gender === filters.gender);
    }

    if (filters.ageMin !== undefined) {
      data = data.filter(r => r.meta?.age >= filters.ageMin);
    }

    if (filters.ageMax !== undefined) {
      data = data.filter(r => r.meta?.age <= filters.ageMax);
    }

    if (filters.questionId) {
      data = data.filter(r => r.answers[filters.questionId] !== undefined);
    }

    return data;
  }

  // =========================
  // TOTAL RESPONSES
  // =========================
  getTotal(filters = {}) {
    const data = this.applyFilters(filters);
    return data.length;
  }

  // =========================
  // GENDER STATS
  // =========================
  getGenderStats(filters = {}) {
    const data = this.applyFilters(filters);

    const result = { male: 0, female: 0, other: 0 };

    data.forEach(r => {
      const g = r.meta?.gender || "other";
      result[g]++;
    });

    const total = data.length || 1;

    return {
      counts: result,
      percentages: {
        male: (result.male / total) * 100,
        female: (result.female / total) * 100,
        other: (result.other / total) * 100
      }
    };
  }

  // =========================
  // AGE GROUPS
  // =========================
  getAgeStats(groups = [], filters = {}) {
    const data = this.applyFilters(filters);

    const result = {};

    groups.forEach(g => {
      result[g.label] = 0;
    });

    data.forEach(r => {
      const age = r.meta?.age;

      groups.forEach(g => {
        if (age >= g.min && age <= g.max) {
          result[g.label]++;
        }
      });
    });

    return result;
  }

  // =========================
  // QUESTION STATS
  // =========================
  getQuestionStats(questionId, filters = {}) {
    const data = this.applyFilters(filters);

    const counts = {};

    data.forEach(r => {
      const answers = r.answers[questionId];

      if (Array.isArray(answers)) {
        answers.forEach(a => {
          counts[a] = (counts[a] || 0) + 1;
        });
      } else {
        counts[answers] = (counts[answers] || 0) + 1;
      }
    });

    const total = data.length || 1;

    const percentages = {};
    Object.keys(counts).forEach(a => {
      percentages[a] = (counts[a] / total) * 100;
    });

    return { counts, percentages };
  }

  // =========================
  // MOST POPULAR ANSWER
  // =========================
  getTopAnswers(questionId) {
    const stats = this.getQuestionStats(questionId);

    let max = 0;
    let top = null;

    Object.entries(stats.counts).forEach(([a, count]) => {
      if (count > max) {
        max = count;
        top = a;
      }
    });

    return {
      answer: top,
      count: max,
      percentage: stats.percentages[top] || 0
    };
  }

  // =========================
  // GLOBAL SUMMARY
  // =========================
  getGlobalSummary(filters = {}) {
    const total = this.getTotal(filters);
    const gender = this.getGenderStats(filters);

    return {
      total,
      gender
    };
  }

  // =========================
  // FULL SURVEY ANALYSIS
  // =========================
  analyzeAll(filters = {}) {
    const result = {
      total: this.getTotal(filters),
      gender: this.getGenderStats(filters),
      questions: {}
    };

    this.survey.sections.forEach(section => {
      section.questions.forEach(q => {
        result.questions[q.id] = {
          stats: this.getQuestionStats(q.id, filters),
          top: this.getTopAnswers(q.id)
        };
      });
    });

    return result;
  }

  // =========================
  // SCORE CALCULATION
  // =========================
  calculateScore(response) {
    let score = 0;

    this.survey.sections.forEach(section => {
      section.questions.forEach(q => {
        if (!q.pointsEnabled) return;

        const ans = response.answers[q.id];

        if (Array.isArray(ans)) {
          ans.forEach(aId => {
            const a = q.answers.find(x => x.id === aId);
            if (a) score += a.points || 0;
          });
        } else {
          const a = q.answers.find(x => x.id === ans);
          if (a) score += a.points || 0;
        }
      });
    });

    return score;
  }

  // =========================
  // SCORES SUMMARY
  // =========================
  getScores(filters = {}) {
    const data = this.applyFilters(filters);

    const scores = data.map(r => this.calculateScore(r));

    const total = scores.reduce((a, b) => a + b, 0);

    return {
      average: scores.length ? total / scores.length : 0,
      max: Math.max(...scores, 0),
      min: Math.min(...scores, 0)
    };
  }

  // =========================
  // TABLE DATA FOR UI
  // =========================
  generateTable(filters = {}) {
    const data = this.analyzeAll(filters);

    const table = [];

    Object.entries(data.questions).forEach(([qId, qData]) => {
      Object.entries(qData.stats.counts).forEach(([answer, count]) => {
        table.push({
          questionId: qId,
          answer,
          count,
          percentage: qData.stats.percentages[answer]
        });
      });
    });

    return table;
  }

  // =========================
  // COMBOBOX OPTIONS
  // =========================
  getFilterOptions() {
    const genders = ["male", "female", "other"];

    const questions = [];
    this.survey.sections.forEach(s => {
      s.questions.forEach(q => {
        questions.push({ id: q.id, text: q.text });
      });
    });

    return {
      genders,
      questions
    };
  }
}

module.exports = AnalyticsEngine;