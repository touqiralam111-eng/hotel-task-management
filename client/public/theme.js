// Force light theme on page load
(function() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const theme = savedTheme;
  
  let appliedTheme = theme;
  if (theme === 'system') {
    appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', appliedTheme);
  if (appliedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();