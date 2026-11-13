import { createContext, useState } from 'react';
const BreadcrumbCtx = createContext(null);

export function BreadcrumbProvider({ children }) {
  const [titles, setTitles] = useState({});

  const setTitle = (pathname, title) => {
    setTitles((prev) => {
      if (prev[pathname] === title) return prev;
      return { ...prev, [pathname]: title };
    });
  };

  return <BreadcrumbCtx.Provider value={{ titles, setTitle }}>{children}</BreadcrumbCtx.Provider>;
}
