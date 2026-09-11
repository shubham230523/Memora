import React from 'react';
import { render, fireEvent, screen } from '@/testing/test-utils';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders correctly with label', async () => {
    await render(<TextInput label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('calls onChangeText when text changes', async () => {
    const onChangeText = jest.fn();
    await render(<TextInput placeholder="Type here" onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByPlaceholderText('Type here'), 'hello');
    expect(onChangeText).toHaveBeenCalledWith('hello');
  });

  it('shows error message when error prop is provided', async () => {
    await render(<TextInput error="Required field" />);
    expect(screen.getByText('Required field')).toBeTruthy();
  });
});
