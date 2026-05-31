const paginate = (query, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

const calculateBandScore = (score, totalQuestions) => {
  const percentage = (score / totalQuestions) * 100;
  if (percentage >= 90) return 8.5;
  if (percentage >= 85) return 8.0;
  if (percentage >= 80) return 7.5;
  if (percentage >= 75) return 7.0;
  if (percentage >= 70) return 6.5;
  if (percentage >= 65) return 6.0;
  if (percentage >= 58) return 5.5;
  if (percentage >= 50) return 5.0;
  if (percentage >= 40) return 4.5;
  if (percentage >= 33) return 4.0;
  if (percentage >= 25) return 3.5;
  if (percentage >= 18) return 3.0;
  return 2.5;
};

const recommendCourse = (bandScore) => {
  if (bandScore < 3.0) return 1;
  if (bandScore < 4.5) return 2;
  if (bandScore < 5.5) return 3;
  if (bandScore < 6.5) return 4;
  return 5;
};

module.exports = { paginate, calculateBandScore, recommendCourse };
