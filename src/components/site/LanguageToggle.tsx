import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

function setCookie(name: string, value: string) {
  // Google Translate reads this cookie for the target language
  const host = window.location.hostname;
  document.cookie = `${name}=${value};path=/`;
  document.cookie = `${name}=${value};path=/;domain=${host}`;
  const parts = host.split(".");
  if (parts.length > 1) {
    const root = "." + parts.slice(-2).join(".");
    document.cookie = `${name}=${value};path=/;domain=${root}`;
  }
}

export function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    // Inject hidden container + script once
    if (!document.getElementById("google_translate_element")) {
      const div = document.createElement("div");
      div.id = "google_translate_element";
      div.style.display = "none";
      document.body.appendChild(div);
    }
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi", autoDisplay: false },
          "google_translate_element"
        );
      };
    }
    if (!document.querySelector('script[data-gt="1"]')) {
      const s = document.createElement("script");
      s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      s.setAttribute("data-gt", "1");
      document.body.appendChild(s);
    }
    // Hide Google's top banner
    const style = document.createElement("style");
    style.textContent = `
      .goog-te-banner-frame, .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      font[style] { background: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    // Read current cookie
    const m = document.cookie.match(/googtrans=\/[a-z-]+\/([a-z-]+)/);
    if (m && m[1] === "hi") setLang("hi");
  }, []);

  function switchTo(target: "en" | "hi") {
    setLang(target);
    setCookie("googtrans", `/en/${target}`);
    // Reload so Google Translate applies cleanly
    window.location.reload();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchTo(lang === "en" ? "hi" : "en")}
      className="gap-1.5 notranslate"
      translate="no"
      aria-label="Change language"
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs font-semibold">{lang === "en" ? "हिंदी" : "English"}</span>
    </Button>
  );
}
