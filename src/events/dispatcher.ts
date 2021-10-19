export const dispatch = ({ type, message }: Record<string, string>): void => {
  const event = new CustomEvent(type, {
    detail: {
      message,
      type,
    },
  });

  window.dispatchEvent(event);
};
