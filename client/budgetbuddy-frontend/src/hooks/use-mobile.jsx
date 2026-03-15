import * as React from "react";

// Breakpoint som avgör när layouten ska räknas som mobil.
const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    // matchMedia låter oss lyssna på förändringar i viewport-bredd.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Uppdaterar state när viewport ändras
    mql.addEventListener("change", onChange);

    // Sätter initialt värde när komponenten mountas
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup när komponenten unmountas
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Säkerställer att hooken alltid returnerar en boolean
  return !!isMobile;
}