type dispatchType = {
  type: string;
  detail?: object;
};

const dispatch = ({ type, detail }: dispatchType): void => {
  const event = new CustomEvent(type, { detail });

  window.dispatchEvent(event);
};

export const activeFragment = (fragmentId: number): void => {
  dispatch({
    type: "active-fragment",
    detail: {
      activeFragmentId: fragmentId,
    },
  });
};
