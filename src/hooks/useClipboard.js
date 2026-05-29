import {useState} from "react";

export function useClipboard() {
    const [copied, setCopied] = useState(null);

   const copy = (text, key) => {
        navigator.clipboard.writeText(String(text)
   );
        setCopied(key);

        setTimeout(() => setCopied(null), 1500);
    };

    return {copied, copy};
}