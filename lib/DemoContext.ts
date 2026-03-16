import { createContext, useContext } from 'react';

export const DemoContext = createContext({
  isDemo: true,
  exitDemo: () => {},
  enterDemo: () => {},
  enterAuth: () => {},
  signOut: () => {},
});
export const useDemo = () => useContext(DemoContext);
