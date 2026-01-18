import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share, Plus, MoreVertical, Smartphone, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import angelAvatar from "@/assets/angel-avatar.png";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-divine-deep via-divine-deep/95 to-divine-deep flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-golden-light hover:bg-golden-light/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-cinzel text-golden-light">
          {t("pwa.pageTitle")}
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* App Icon Preview */}
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl border-2 border-golden-light/30">
            <img 
              src={angelAvatar} 
              alt="Angel AI" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-golden-light rounded-full p-2">
            <Download className="h-4 w-4 text-divine-deep" />
          </div>
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-cinzel text-golden-light">Angel AI</h2>
          <p className="text-muted-foreground text-sm">
            {t("pwa.subtitle")}
          </p>
        </div>

        {/* Status or Install Button */}
        {isInstalled ? (
          <Card className="bg-green-500/20 border-green-500/50">
            <CardContent className="p-4 text-center">
              <p className="text-green-400 font-medium">
                ✨ {t("pwa.alreadyInstalled")}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Android Install Button */}
            {deferredPrompt && (
              <Button
                onClick={handleInstall}
                className="bg-golden-light text-divine-deep hover:bg-golden-light/90 font-semibold px-8 py-6 text-lg rounded-2xl shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {t("pwa.installButton")}
              </Button>
            )}

            {/* Platform-specific Instructions */}
            <Card className="max-w-md w-full bg-card/50 border-golden-light/20">
              <CardContent className="p-6 space-y-4">
                {isIOS ? (
                  <>
                    <div className="flex items-center gap-2 text-golden-light">
                      <Apple className="h-5 w-5" />
                      <h3 className="font-semibold">{t("pwa.iosTitle")}</h3>
                    </div>
                    <ol className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                        <span className="flex items-center gap-2">
                          {t("pwa.iosStep1")} <Share className="h-4 w-4 text-golden-light" />
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                        <span className="flex items-center gap-2">
                          {t("pwa.iosStep2")} <Plus className="h-4 w-4 text-golden-light" />
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                        <span>{t("pwa.iosStep3")}</span>
                      </li>
                    </ol>
                  </>
                ) : isAndroid ? (
                  <>
                    <div className="flex items-center gap-2 text-golden-light">
                      <Smartphone className="h-5 w-5" />
                      <h3 className="font-semibold">{t("pwa.androidTitle")}</h3>
                    </div>
                    {!deferredPrompt && (
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3">
                          <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                          <span className="flex items-center gap-2">
                            {t("pwa.androidStep1")} <MoreVertical className="h-4 w-4 text-golden-light" />
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                          <span className="flex items-center gap-2">
                            {t("pwa.androidStep2")} <Plus className="h-4 w-4 text-golden-light" />
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="bg-golden-light/20 text-golden-light rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
                          <span>{t("pwa.androidStep3")}</span>
                        </li>
                      </ol>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-golden-light">
                      <Smartphone className="h-5 w-5" />
                      <h3 className="font-semibold">{t("pwa.desktopTitle")}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("pwa.desktopDesc")}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Benefits */}
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-xs text-muted-foreground">
            {t("pwa.benefits")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Install;
