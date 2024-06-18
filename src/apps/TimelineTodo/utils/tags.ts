export const tagsGroup: Record<string, string[]> = {
  productivity: ['reading', 'podcast', 'spor', 'plan', 'english'],
  work: ['kajabi', 'chat-app', 'nexizon'],
  bad: ['youtube', 'timeline-todo'],
};

export const tagsChildGroupMap: Record<string, string> = Object.entries(
  tagsGroup
).reduce(
  (acc, [key, values]) => ({
    ...acc,
    ...values.reduce((a, value) => ({ ...a, [value]: key }), {}),
  }),
  {}
);
