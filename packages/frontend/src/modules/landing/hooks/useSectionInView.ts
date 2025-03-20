import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "../constants";

export const useSectionInView = () => {
  const [currentSection, setCurrentSection] = useState<NAV_SECTIONS>(
    NAV_SECTIONS.HOME
  );

  const checkInView = () => {
    for (const section of Object.values(NAV_SECTIONS)) {
      const element = document.querySelector(`#${section}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom >= window.innerHeight / 2) {
          setCurrentSection(section);
          break;
        }
      }
    }
  };

  useEffect(() => {
    document
      .querySelector("#landing-root")
      ?.addEventListener("scroll", checkInView);
    return () => {
      document
        .querySelector("#landing-main")
        ?.removeEventListener("scroll", checkInView);
    };
  }, []);

  return currentSection;
};
