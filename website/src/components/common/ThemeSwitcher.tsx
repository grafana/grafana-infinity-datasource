import React, { useEffect } from 'react';

const DEFAULT_THEME = 'light';

export const toggleTheme = () => {
  const isLightTheme = () => document.getElementsByTagName('html')[0].classList.contains('light-theme');
  document.getElementsByTagName('html')[0].classList.toggle('light-theme');
  document.getElementsByTagName('html')[0].classList.toggle('dark-theme');
  document.getElementsByTagName('html')[0].setAttribute('style', `color-scheme : ${isLightTheme() ? 'dark' : 'light'};`);
};

export const ThemeSwitcher = () => {
  useEffect(() => {
    document.getElementsByTagName('html')[0].classList.add(`${DEFAULT_THEME}-theme`);
    document.getElementsByTagName('html')[0].setAttribute('style', `color-scheme : ${DEFAULT_THEME};`);
  }, []);
  return (
    <button onClick={toggleTheme} title="Switch theme">
      <i className="fas fa-sun" />
      <span className="lg:hidden ml-2">Switch Theme</span>
    </button>
  );
};
