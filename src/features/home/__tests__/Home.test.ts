import { useHomeStore } from '../HomeStore';

describe('HomeStore', () => {
  it('initializes with default stats', () => {
    const state = useHomeStore.getState();
    expect(state.stats.totalItems).toBe(0);
  });

  it('updates stats after fetching', async () => {
    await useHomeStore.getState().fetchHomeData();
    expect(useHomeStore.getState().stats.totalItems).toBeGreaterThan(0);
  });
});
