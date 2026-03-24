export async function shareChallengeLink(title: string, text: string, url: string): Promise<boolean> {
  if (navigator.share) {
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
      console.error('Error sharing:', err);
      // Fallback to clipboard if share failed for other reasons
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}
