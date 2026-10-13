type Member = { id: string; created_at: string; last_sign_in_at?: string };

export function authDestination(member: Member | null, redirect?: string, flow: "login" | "signup" = "login") {
  if (redirect?.startsWith("/") && !redirect.startsWith("//") && !redirect.includes("\\")) return redirect;
  if (!member) return "/welcome";
  // OAuth can create an account from the login screen. Its first session is
  // issued alongside creation; subsequent sessions belong to returning members.
  const firstSession = member.last_sign_in_at && Math.abs(Date.parse(member.last_sign_in_at) - Date.parse(member.created_at)) < 60_000;
  return firstSession || (flow === "signup" && !member.last_sign_in_at) ? "/welcome" : `/u/${member.id}`;
}