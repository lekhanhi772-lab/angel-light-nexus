import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import angelAvatar from "@/assets/angel-avatar.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already dismissed or installed
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    if (dismissed || isStandalone) {
      return;
    }

    // Check if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (isMobile) {
        // Show prompt after a delay
        setTimeout(() => setShow(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show after delay since there's no beforeinstallprompt
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS && isMobile) {
      setTimeout(() => setShow(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
      }
      setDeferredPrompt(null);
    } else {
      // For iOS or when no prompt available, navigate to install page
      navigate("/install");
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card/95 backdrop-blur-lg border border-golden-light/30 rounded-2xl p-4 shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-golden-light/30 flex-shrink-0">
            <img 
              src={angelAvatar} 
              alt="Angel AI" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-golden-light text-sm">
              {t("pwa.promptTitle")}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {t("pwa.promptSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-muted-foreground hover:text-foreground"
          >
            {t("pwa.later")}
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 bg-golden-light text-divine-deep hover:bg-golden-light/90"
          >
            {deferredPrompt ? (
              <>
                <Download className="h-4 w-4 mr-1" />
                {t("pwa.install")}
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-1" />
                {t("pwa.howTo")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
