/**
 * Centralized Application Event Constants
 * Defines authoritative CustomEvent names used across modular lifecycle scripts.
 */

window.PortfolioEvents = Object.freeze({
  HERO_REVEALED: 'hero:revealed',
  LOADER_COMPLETE: 'loader:complete',
  SECTION_ENTER: 'portfolio:section_enter',
  SECTION_EXIT: 'portfolio:section_exit',
  TELEMETRY: 'portfolio:telemetry'
});
