// Utility: compute earned achievements from surveys array

export const ACHIEVEMENTS = [
  { id: "first_survey", title: "First Survey", icon: "🎯", description: "Completed your first field survey" },
  { id: "ten_surveys", title: "10 Surveys", icon: "🏆", description: "Completed 10 surveys" },
  { id: "perfect_week", title: "Perfect Week", icon: "⭐", description: "5+ surveys in a single week" },
  { id: "speed_inspector", title: "Speed Inspector", icon: "⚡", description: "3+ surveys in one day" },
  { id: "high_priority_pro", title: "High Priority Pro", icon: "🔥", description: "10 high-priority surveys completed" },
  { id: "photo_master", title: "Photo Master", icon: "📸", description: "Attached photos to 5 surveys" },
];

function getWeekKey(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d.setDate(diff));
  return `${mon.getFullYear()}-W${Math.ceil(mon.getDate() / 7)}`;
}

export function getAchievements(surveys) {
  const total = surveys.length;
  const highPriority = surveys.filter(s => s.priority === "High").length;
  const withPhotos = surveys.filter(s => s.photos && s.photos.length > 0).length;

  // Count by week
  const weekMap = {};
  surveys.forEach(s => {
    const dateVal = s.createdAt || s.date;
    if (dateVal) {
      const k = getWeekKey(dateVal);
      weekMap[k] = (weekMap[k] || 0) + 1;
    }
  });
  const hasPerfectWeek = Object.values(weekMap).some(v => v >= 5);

  // Count by day
  const dayMap = {};
  surveys.forEach(s => {
    const dateVal = s.createdAt || s.date;
    if (dateVal) {
      const k = new Date(dateVal).toDateString();
      dayMap[k] = (dayMap[k] || 0) + 1;
    }
  });
  const hasSpeedDay = Object.values(dayMap).some(v => v >= 3);

  return ACHIEVEMENTS.map(a => ({
    ...a,
    earned:
      a.id === "first_survey" ? total >= 1 :
      a.id === "ten_surveys" ? total >= 10 :
      a.id === "perfect_week" ? hasPerfectWeek :
      a.id === "speed_inspector" ? hasSpeedDay :
      a.id === "high_priority_pro" ? highPriority >= 10 :
      a.id === "photo_master" ? withPhotos >= 5 :
      false,
  }));
}

export function getStreak(surveys) {
  if (!surveys.length) return 0;
  const days = [...new Set(surveys.map(s => {
    const dVal = s.createdAt || s.date;
    return dVal ? new Date(dVal).toDateString() : null;
  }).filter(Boolean))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const dayStr of days) {
    const d = new Date(dayStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      current = d;
    } else {
      break;
    }
  }
  return streak;
}

export function getWeeklyCount(surveys) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return surveys.filter(s => {
    const dVal = s.createdAt || s.date;
    return dVal ? new Date(dVal) >= startOfWeek : false;
  }).length;
}
