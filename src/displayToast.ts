import { dispatch } from "./events/dispatcher";

function displayToast(message: string, options?: object) {
  dispatch({
    type: "display-toast-stack",
    detail: {
      message,
      ...options,
    },
  });
}

export { displayToast };
