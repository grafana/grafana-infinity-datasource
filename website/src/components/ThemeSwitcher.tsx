import React, { useEffect } from 'react';

export const ThemeSwitcher = () => {
  useEffect(() => {
    document.getElementsByTagName('html')[0].classList.add('dark-theme');
    document.getElementsByTagName('html')[0].setAttribute('style', 'color-scheme : dark;');
  }, []);
  return (
    <span>
      <i
        className={`fas fa-moon`}
        onClick={() => {
          const isLightTheme = document.getElementsByTagName('html')[0].classList.contains('light-theme');
          document.getElementsByTagName('html')[0].classList.toggle('light-theme');
          document.getElementsByTagName('html')[0].classList.toggle('dark-theme');
          document.getElementsByTagName('html')[0].setAttribute('style', `color-scheme : ${isLightTheme ? 'dark' : 'light'};`);
        }}
      ></i>
      <span className="lg:hidden ml-2">Switch Theme</span>
    </span>
  );
};
