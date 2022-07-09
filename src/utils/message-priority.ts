import { MessagePriorities } from './enums';

const highPriorityKeywords = [
  'loan',
  'pay',
  'paid',
  'app',
  'borrow',
  'clear',
  'reject',
  'default',
  'approv',
  'cheque',
  'money',
  'credit',
  'debit',
];

export const getMessagePriority = (message: string): number => {
  const isPriority = highPriorityKeywords.some((v: string) =>
    message.includes(v),
  );
  return isPriority ? MessagePriorities.HIGH : MessagePriorities.LOW;
};
