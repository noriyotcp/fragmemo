import { dispatch } from "./events/dispatcher";
import { Store } from "stores";

const { myAPI } = window;
const queue: number[] = [];
// Run sleep function
const _sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function saveContentAsync(
  fragmentId: number,
  content: string,
  fragmentStore: typeof Store
): Promise<void> {
  queue.push(fragmentId);

  const currentFragmentId = queue.shift() as number;
  const nextFragmentId = queue[0];

  // Compare the current and next IDs (next ID could be undefined)
  // Save the content of current fragment, if the ID is different
  if (currentFragmentId === nextFragmentId) return;

  // Sleep by specified milliseconds
  await _sleep(2000);

  console.info(
    `_saveContentAsync: currentFragmentId: ${currentFragmentId} nextFragmentId: ${nextFragmentId} content: ${content}`
  );

  saveContent(currentFragmentId, content, fragmentStore);
}

function saveContent(
  fragmentId: number,
  content: string,
  fragmentStore: typeof Store
): void {
  myAPI
    .updateFragment({
      _id: fragmentId,
      properties: { content: content },
    })
    .then(() => {
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
    });
}

export { saveContentAsync, saveContent };
