import { Text } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';

const TestComponent = () => {
  const { theme, mode, setMode } = useTheme();
  return (
    <>
      <Text testID="theme-mode">{mode}</Text>
      <Text testID="is-dark">{theme.isDark ? 'dark' : 'light'}</Text>
      <Text
        testID="set-dark"
        onPress={() => setMode('dark')}
      >
        Set Dark
      </Text>
    </>
  );
};

describe('ThemeProvider', () => {
  it('provides default system mode', async () => {
    await render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-mode').props.children).toBe('system');
  });

  it('switches to dark mode', async () => {
    await render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('set-dark'));
    });

    expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    expect(screen.getByTestId('is-dark').props.children).toBe('dark');
  });
});
