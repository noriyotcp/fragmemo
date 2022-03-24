import { dispatch } from "./events/dispatcher";

function displayToast(message: string) {
  dispatch({
    type: "display-toast-stack",
    detail: {
      message,
    },
  });
}

export { displayToast };
