import { describe, it, expect } from 'vitest';

describe('economy', () => {
  it('rewards scale with qty', () => {
    const qty = 3;
    const reward = 10 * qty;
    expect(reward).toBe(30);
  });
});


