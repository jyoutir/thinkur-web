import "../styles/tokens.css";
import "../styles/nav.css";
import "../styles/hero.css";
import "../styles/demo.css";
import "../styles/sections.css";
import "../styles/effects.css";

import { initThemeToggle } from "./theme";
import { initDemo } from "./demo";
import { initCloudBackground } from "./cloud";
import { initFeatureCards, initDemoVideo } from "./features";
import {
  initSavingsCalculator,
  initDownloadButtons,
  initGitHubStars,
  initGitHubDownloads,
  initAppMarquee,
  initTestimonialMarquee,
  initScrollReveal,
  initTabEasterEgg,
} from "./ui";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initAppMarquee();
  initTestimonialMarquee();
  initFeatureCards();
  initSavingsCalculator();
  initDownloadButtons();
  initGitHubStars();
  initGitHubDownloads();
  initDemoVideo();
  initCloudBackground();
  initScrollReveal();
  initTabEasterEgg();
  initDemo();
});
