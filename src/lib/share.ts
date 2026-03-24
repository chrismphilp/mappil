export async function shareChallengeLink(title: string, text: string, url: string): Promise<boolean> {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // On mobile, use native share sheet if available
  if (isMobile && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return false;
      }
      // Fallback to clipboard on error
    }
  }

  // On desktop or if share fails/is missing, copy directly to clipboard
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
