/**
 * GHI CHÚ QUAN TRỌNG:
 * Các trọng số Battle Score và định mức phần thưởng dưới đây là "giá trị tạm thời
 * phục vụ bản Demo / Competition MVP" theo đúng tinh thần mục 8.2 SRS.
 * Sau này có thể dễ dàng hiệu chỉnh trong mã nguồn mà không ảnh hưởng UI.
 */

// 1. Trọng số 4 tiêu chí đánh giá giọng nói AI (tổng = 1.0)
export const SCORING_WEIGHTS = {
  accuracy: 0.35, // Độ chính xác phát âm (35%)
  fluency: 0.25, // Độ lưu loát, tốc độ nhịp thở (25%)
  completeness: 0.2, // Tỷ lệ đọc đủ số từ (20%)
  prosody: 0.2, // Ngữ điệu tự nhiên en-US (20%)
} as const

// 2. Thang điểm ngẫu nhiên của mô phỏng AI (0 - 100)
export const SCORE_RANGE = {
  min: 70,
  max: 95,
} as const

// 3. Định mức cộng thưởng XP và Coins (Ledger Rewards)
export const REWARDS = {
  soloPractice: {
    xp: 50,
    coins: 15,
  },
  battleWin: {
    xp: 100,
    coins: 30,
  },
  battleDraw: {
    xp: 50,
    coins: 15,
  },
  battleLose: {
    xp: 25,
    coins: 5,
  },
} as const

/**
 * Công thức tính Battle Score (SRS 8.2):
 * Tổng điểm có trọng số, làm tròn đến số nguyên gần nhất (0 - 100).
 */
export function calculateBattleScore(
  accuracy: number,
  fluency: number,
  completeness: number,
  prosody: number
): number {
  const score =
    accuracy * SCORING_WEIGHTS.accuracy +
    fluency * SCORING_WEIGHTS.fluency +
    completeness * SCORING_WEIGHTS.completeness +
    prosody * SCORING_WEIGHTS.prosody
  return Math.round(score)
}
