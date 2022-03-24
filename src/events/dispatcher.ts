type dispatchType = {
  type: string;
  detail?: object;
};

export const dispatch = ({ type, detail }: dispatchType): void => {
  const event = new CustomEvent(type, { detail });

  window.dispatchEvent(event);
};
