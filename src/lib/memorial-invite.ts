/** Invitations open the existing public memorial, without granting edit access. */
export function memorialInvitePath(slug: string) {
  return `/memorial/${encodeURIComponent(slug)}`;
}

export function memorialInviteUrl(slug: string) {
  return `https://rememfur.com${memorialInvitePath(slug)}`;
}

export function memorialInviteEmail(email: string, petName: string, slug: string, message: string) {
  const recipient = email.trim();
  if (!/^[^\s@,;?&#]+@[^\s@,;?&#]+\.[^\s@,;?&#]+$/.test(recipient) || /[\r\n]/.test(recipient)) {
    throw new Error("Enter one valid email address.");
  }
  const subject = `Remember ${petName} with me`;
  const body = [message.trim(), `Join me in remembering ${petName}.`, memorialInviteUrl(slug)].filter(Boolean).join("\n\n");
  return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}