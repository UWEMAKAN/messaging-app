import { getMessagePriority } from './message-priority';

describe('MessagePriority', () => {
  it('should return 1 for high priority messages', () => {
    const message = 'I want to take a loan';
    const priority = getMessagePriority(message);
    expect.assertions(1);
    expect(priority).toBe(1);
  });
  test('should return 2 for low priority messages', () => {
    const message = 'Good morning';
    const priority = getMessagePriority(message);
    expect.assertions(1);
    expect(priority).toBe(2);
  });
});
