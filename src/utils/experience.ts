// One place for when the career started; every "N+ years" on the site counts
// from here.
export const CAREER_START = "2019-03-01";

export function yearsOfExperience(now = new Date()): number {
  // A bare date parses as UTC and can land on the previous local day, so a
  // time is added to keep it local.
  const start = new Date(`${CAREER_START}T00:00`);
  const beforeAnniversary =
    now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate());
  return now.getFullYear() - start.getFullYear() - (beforeAnniversary ? 1 : 0);
}
