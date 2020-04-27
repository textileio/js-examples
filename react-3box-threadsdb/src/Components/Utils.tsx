import React, { useState, useEffect } from "react";
import { Dimmer, Loader, SemanticICONS } from "semantic-ui-react";

export function iconFromMimeType(mimeType: string): SemanticICONS {
  // List of official MIME Types: http://www.iana.org/assignments/media-types/media-types.xhtml
  const iconClasses: Record<string, SemanticICONS> = {
    // Media
    image: "file image",
    audio: "file audio",
    video: "file video",
    // Documents
    "application/pdf": "file pdf",
    "application/msword": "file word",
    "application/vnd.ms-word": "file word",
    "application/vnd.oasis.opendocument.text": "file word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml":
      "file word",
    "application/vnd.ms-excel": "file excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml": "file excel",
    "application/vnd.oasis.opendocument.spreadsheet": "file excel",
    "application/vnd.ms-powerpoint": "file powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml":
      "file powerpoint",
    "application/vnd.oasis.opendocument.presentation": "file powerpoint",
    "text/plain": "file text",
    "text/html": "file code",
    "application/json": "file code",
    // Archives
    "application/gzip": "file archive",
    "application/zip": "file archive",
  };

  for (const key in iconClasses) {
    if (iconClasses.hasOwnProperty(key)) {
      if (mimeType.search(key) === 0) {
        // Found it
        return `${iconClasses[key]} outline` as SemanticICONS;
      }
    } else {
      return "file outline";
    }
  }
  return "file outline";
}

export const DelayedSpinner: React.FC<{ delay: number; message?: string }> = ({
  delay,
  message,
}) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), delay);

    return () => clearTimeout(timer);
  }, [delay, message]);

  return showSpinner && message !== undefined ? (
    <Dimmer active={showSpinner}>
      <Loader indeterminate>{message}</Loader>
    </Dimmer>
  ) : null;
};
