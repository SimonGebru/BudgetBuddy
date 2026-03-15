import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hjälpfunktion för att slå ihop CSS-klasser.
// clsx hanterar villkorliga klasser och twMerge ser till att
// Tailwind-klasser inte krockar (t.ex. p-2 vs p-4).
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
