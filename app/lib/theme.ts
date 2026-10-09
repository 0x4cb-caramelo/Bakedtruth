// Purpose: the theme's storage key and the script that sets `data-theme` before the first paint. Dark is the default
// (the founder's choice, 2026-10-08); only the value "light" selects the light theme. Sprint -1, TP §3.6.

export const THEME_KEY = "brot-theme";

// Runs in <head>, before the CSS. Every access is in try/catch: private windows and blocked storage must still
// render the dark theme.
export const themeScript = `(function(){var t='dark';try{if(localStorage.getItem('${THEME_KEY}')==='light'){t='light';}}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;
