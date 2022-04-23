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

export const displayToast = (message: string, options?: object): void => {
  dispatch({
    type: "display-toast-stack",
    detail: {
      message,
      ...options,
    },
  });
};
