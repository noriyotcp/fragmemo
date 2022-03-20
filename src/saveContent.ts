import { dispatch } from "./events/dispatcher";
import { Store } from "stores";

const { myAPI } = window;
const queue: number[] = [];
// Run sleep function
const _sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function saveContentAsync(
  fragmentId: number | undefined,
  content: string,
  fragmentStore: typeof Store
): Promise<void> {
  if (fragmentId === undefined) return;

  queue.push(fragmentId);
  // Sleep by specified milliseconds
  await _sleep(3000);
  _saveContentAsync(content, fragmentStore);
}

function _saveContentAsync(content: string, fragmentStore: typeof Store): void {
  const currentFragmentId = queue.shift();
  const nextFragmentId = queue[0];
  // Compare the current and next IDs (next ID could be undefined)
  // Save the content of current fragment, if the ID is different
  if (currentFragmentId && currentFragmentId !== nextFragmentId) {
    saveContent(currentFragmentId, fragmentStore, content);
  }
}

function saveContent(
  fragmentId: number,
  fragmentStore: typeof Store,
  content: string
): void {
  myAPI
    .updateFragment({
      _id: fragmentId,
      properties: { content: content },
    })
    .then(({ status }) => {
      console.log("myAPI.updateFragment", status);
      if (status) {
        fragmentStore.setPartialRow("states", `${fragmentId}`, {
          content: content,
          isEditing: false,
        });
        dispatch({
          type: "content-editing-state-changed",
          detail: {
            _id: fragmentId,
            fragmentStore: fragmentStore,
          },
        });
        // change the order of snippets list
        dispatch({
          type: "update-snippets",
          detail: {
            message: "Snippets updated",
          },
        });
      }
    });
}

export { saveContentAsync };
