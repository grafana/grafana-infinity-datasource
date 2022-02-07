import React from 'react';

export const toggleTheme = () => {
  const isLightTheme = () => document.getElementsByTagName('html')[0].classList.contains('light-theme');
  document.getElementsByTagName('html')[0].classList.toggle('light-theme');
  document.getElementsByTagName('html')[0].classList.toggle('dark-theme');
  document.getElementsByTagName('html')[0].setAttribute('style', `color-scheme : ${isLightTheme() ? 'dark' : 'light'};`);
};

export const ThemeSwitcher = () => {
  return (
    <button onClick={toggleTheme} title="Switch theme">
      <i className="fas fa-sun" />
      <span className="lg:hidden ml-2">Switch Theme</span>
    </button>
  );
};
