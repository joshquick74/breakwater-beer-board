import { useEffect } from "react";

export function useDynamicFonts(...fonts: (string | undefined)[]) {
  useEffect(() => {
    fonts.forEach((fontName) => {
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
    });
  }, [fonts.join(",")]);
}
