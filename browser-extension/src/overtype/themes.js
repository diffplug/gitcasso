/**
 * Built-in themes for OverType editor
 * Each theme provides a complete color palette for the editor
 */

/**
 * Solar theme - Light, warm and bright
 */
export const solar = {
  name: "solar",
  colors: {
    bgPrimary: "#faf0ca", // Lemon Chiffon - main background
    bgSecondary: "#ffffff", // White - editor background
    text: "#0d3b66", // Yale Blue - main text
    h1: "#f95738", // Tomato - h1 headers
    h2: "#ee964b", // Sandy Brown - h2 headers
    h3: "#3d8a51", // Forest green - h3 headers
    strong: "#ee964b", // Sandy Brown - bold text
    em: "#f95738", // Tomato - italic text
    link: "#0d3b66", // Yale Blue - links
    code: "#0d3b66", // Yale Blue - inline code
    codeBg: "rgba(244, 211, 94, 0.4)", // Naples Yellow with transparency
    blockquote: "#5a7a9b", // Muted blue - blockquotes
    hr: "#5a7a9b", // Muted blue - horizontal rules
    syntaxMarker: "rgba(13, 59, 102, 0.52)", // Yale Blue with transparency
    cursor: "#f95738", // Tomato - cursor
    selection: "rgba(244, 211, 94, 0.4)", // Naples Yellow with transparency
    listMarker: "#ee964b", // Sandy Brown - list markers
    // Toolbar colors
    toolbarBg: "#ffffff", // White - toolbar background
    toolbarBorder: "rgba(13, 59, 102, 0.15)", // Yale Blue border
    toolbarIcon: "#0d3b66", // Yale Blue - icon color
    toolbarHover: "#f5f5f5", // Light gray - hover background
    toolbarActive: "#faf0ca", // Lemon Chiffon - active button background
  },
};

/**
 * Cave theme - Dark ocean depths
 */
export const cave = {
  name: "cave",
  colors: {
    bgPrimary: "#141E26", // Deep ocean - main background
    bgSecondary: "#1D2D3E", // Darker charcoal - editor background
    text: "#c5dde8", // Light blue-gray - main text
    h1: "#d4a5ff", // Rich lavender - h1 headers
    h2: "#f6ae2d", // Hunyadi Yellow - h2 headers
    h3: "#9fcfec", // Brighter blue - h3 headers
    strong: "#f6ae2d", // Hunyadi Yellow - bold text
    em: "#9fcfec", // Brighter blue - italic text
    link: "#9fcfec", // Brighter blue - links
    code: "#c5dde8", // Light blue-gray - inline code
    codeBg: "#1a232b", // Very dark blue - code background
    blockquote: "#9fcfec", // Brighter blue - same as italic
    hr: "#c5dde8", // Light blue-gray - horizontal rules
    syntaxMarker: "rgba(159, 207, 236, 0.73)", // Brighter blue semi-transparent
    cursor: "#f26419", // Orange Pantone - cursor
    selection: "rgba(51, 101, 138, 0.4)", // Lapis Lazuli with transparency
    listMarker: "#f6ae2d", // Hunyadi Yellow - list markers
    // Toolbar colors for dark theme
    toolbarBg: "#1D2D3E", // Darker charcoal - toolbar background
    toolbarBorder: "rgba(197, 221, 232, 0.1)", // Light blue-gray border
    toolbarIcon: "#c5dde8", // Light blue-gray - icon color
    toolbarHover: "#243546", // Slightly lighter charcoal - hover background
    toolbarActive: "#2a3f52", // Even lighter - active button background
  },
};

/**
 * Default themes registry
 */
export const themes = {
  solar,
  cave,
  // Aliases for backward compatibility
  light: solar,
  dark: cave,
};

/**
 * Get theme by name or return custom theme object
 * @param {string|Object} theme - Theme name or custom theme object
 * @returns {Object} Theme configuration
 */
export function getTheme(theme) {
  if (typeof theme === "string") {
    const themeObj = themes[theme] || themes.solar;
    // Preserve the requested theme name (important for 'light' and 'dark' aliases)
    return { ...themeObj, name: theme };
  }
  return theme;
}

/**
 * Apply theme colors to CSS variables
 * @param {Object} colors - Theme colors object
 * @returns {string} CSS custom properties string
 */
export function themeToCSSVars(colors) {
  const vars = [];
  for (const [key, value] of Object.entries(colors)) {
    // Convert camelCase to kebab-case
    const varName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    vars.push(`--${varName}: ${value};`);
  }
  return vars.join("\n");
}

/**
 * Merge custom colors with base theme
 * @param {Object} baseTheme - Base theme object
 * @param {Object} customColors - Custom color overrides
 * @returns {Object} Merged theme object
 */
export function mergeTheme(baseTheme, customColors = {}) {
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      ...customColors,
    },
  };
}
