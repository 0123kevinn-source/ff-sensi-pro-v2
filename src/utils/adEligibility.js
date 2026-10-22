const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu;

export function countEditorialWords(text) {
  return text.match(WORD_PATTERN)?.length ?? 0;
}

export function canRenderAd({
  contentWordCount,
  pageStatus,
  hasConsent,
  slotId,
  isPublisherPage = true,
  minimumWords = 300,
}) {
  return (
    isPublisherPage === true &&
    pageStatus === "ready" &&
    hasConsent === true &&
    Number.isInteger(contentWordCount) &&
    contentWordCount >= minimumWords &&
    typeof slotId === "string" &&
    /^\d{6,}$/.test(slotId)
  );
}
