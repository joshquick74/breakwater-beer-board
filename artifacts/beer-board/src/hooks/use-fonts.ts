import { useEffect } from "react";

export function useDynamicFonts(headerFont?: string, bodyFont?: string) {
  useEffect(() => {
    const loadFont = (fontName: string) => {
      if (!fontName) return;
      const formatted = fontName.replace(/ /g, "+");
      const id = `font-${formatted}`;
      
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${formatted}:wght@400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    };

    loadFont(headerFont || "");
    loadFont(bodyFont || "");
  }, [headerFont, bodyFont]);
}
