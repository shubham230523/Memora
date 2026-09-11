import React from 'react';
import { render, screen } from '@/testing/test-utils';
import Index from '../index';
import { Redirect } from 'expo-router';

// Mock expo-router Redirect
jest.mock('expo-router', () => ({
  Redirect: jest.fn(() => null),
}));

describe('Root Navigation', () => {
  it('redirects to tabs when authenticated', async () => {
    await render(<Index />);
    expect(Redirect).toHaveBeenCalled();
    const call = (Redirect as jest.Mock).mock.calls[0];
    expect(call[0].href).toBe('/(tabs)');
  });
});
