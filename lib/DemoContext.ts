import { createContext, useContext } from 'react';

export const DemoContext = createContext({ isDemo: false, exitDemo: () => {} });
export const useDemo = () => useContext(DemoContext);
