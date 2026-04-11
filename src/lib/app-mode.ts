type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true ||
    document.referrer.startsWith("android-app://")
  );
}

export function getPostLogoutRedirectPath(): string {
  return isStandaloneApp() ? "/login" : "/";
}