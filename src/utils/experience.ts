export const CAREER_START = "2019-03-01";

export function yearsOfExperience(now = new Date()): number {
  const localCareerStart = new Date(`${CAREER_START}T00:00`);
  const beforeAnniversary =
    now.getMonth() < localCareerStart.getMonth() ||
    (now.getMonth() === localCareerStart.getMonth() &&
      now.getDate() < localCareerStart.getDate());
  return (
    now.getFullYear() -
    localCareerStart.getFullYear() -
    (beforeAnniversary ? 1 : 0)
  );
}
