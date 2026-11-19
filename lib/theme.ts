/** Runs in <head> before paint so the saved theme never flashes. */
export const themeScript = `(function(){try{var t=localStorage.getItem("mv-theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})();`;
