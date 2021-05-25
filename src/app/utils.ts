export const normalizeURL = (url: string): string => {
  if (url.startsWith('https://github.com')) {
    return url
      .replace('https://github.com', 'https://raw.githubusercontent.com')
      .split('/')
      .filter((item, index) => {
        return !(item === 'blob' && index === 5);
      })
      .join('/');
  }
  return url;
};
