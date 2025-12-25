
import { AppContent } from './types';

export const encodeContentData = (data: AppContent): string => {
  try {
    const jsonString = JSON.stringify(data);
    // Use encoding compatible with URL and UTF-8
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (e) {
    console.error("Error encoding data", e);
    return "";
  }
};

export const decodeContentData = (encoded: string): AppContent | null => {
  try {
    // Basic check for empty string
    if (!encoded) return null;
    
    // Attempt decoding
    const jsonString = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error decoding data", e);
    // Fallback: If URL is truncated, it often breaks here. 
    // We return null to fallback to default content.
    return null;
  }
};

export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};
