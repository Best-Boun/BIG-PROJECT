/**
 * คำนวณ % match ระหว่าง seeker skills กับ job skills
 * @param {Array} seekerSkills - [{ skillId, yearsExp }, ...]
 * @param {Array} jobSkills - [{ skillId, requiredLevel, weight, required }, ...]
 * @returns {number} score 0-100
 */
export function calcMatchScore(seekerSkills, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!seekerSkills || seekerSkills.length === 0) return 0;

  const levelMap = { Beginner: 1, Intermediate: 2, Advanced: 3 };

  const getUserLevel = (yearsExp) => {
    if (yearsExp >= 3) return 3;
    if (yearsExp >= 1) return 2;
    return 1;
  };

  // Map skillId → yearsExp
  const seekerMap = {};
  seekerSkills.forEach(s => {
    if (s.skillId) seekerMap[s.skillId] = s.yearsExp || 0;
  });

  let weightedScore = 0;
  let totalWeight = 0;

  jobSkills.forEach(({ skillId, requiredLevel, weight = 2, required = true }) => {
    const w = weight || 2;
    totalWeight += w;

    const yearsExp = seekerMap[skillId];

    if (yearsExp === undefined) {
      // ไม่มี skill นี้เลย
      const penalty = required ? -0.5 : 0;
      weightedScore += penalty * w;
      return;
    }

    // มี skill → คำนวณ Level Gap
    const userLevel = getUserLevel(yearsExp);
    const reqLevel = levelMap[requiredLevel] || 2;
    const gap = reqLevel - userLevel;

    let score;
    if (gap <= 0) {
      score = 1.0;      // user level >= required → full score
    } else if (gap === 1) {
      score = 0.6;      // ต่ำกว่า 1 level
    } else if (gap === 2) {
      score = 0.3;      // ต่ำกว่า 2 level
    } else {
      score = 0;        // ต่ำกว่า 3 level
    }

    weightedScore += score * w;
  });

  // clamp 0-100
  const raw = (weightedScore / totalWeight) * 100;
  return Math.max(0, Math.round(raw));
}