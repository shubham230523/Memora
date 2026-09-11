import React from 'react';
import { render, fireEvent, screen } from '@/testing/test-utils';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly with title', async () => {
    await render(<Button title="Test Button" onPress={() => {}} />);
    expect(screen.getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when clicked', async () => {
    const onPress = jest.fn();
    await render(<Button title="Click Me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', async () => {
    await render(<Button title="Loading" onPress={() => {}} loading />);
    expect(screen.getByTestId('button-loading')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', async () => {
    const onPress = jest.fn();
    await render(<Button title="Disabled" onPress={onPress} disabled />);
    fireEvent.press(screen.getByTestId('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
