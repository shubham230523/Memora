import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Add providers here (e.g., ThemeProvider, QueryClientProvider)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
};

const customRender = async (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => await render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';
export { customRender as render };
