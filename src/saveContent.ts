import { Store } from "stores";
import { contentEditingStateChanged } from "./events/global-dispatchers";

const { myAPI } = window;
const queue: number[] = [];
// Run sleep function
const _sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface SaveContentParams {
  fragmentId: number;
  content: string;
  fragmentStore: typeof Store;
  afterDelay: number;
}

async function saveContentAsync(params: SaveContentParams): Promise<void> {
  const { fragmentId, content, fragmentStore, afterDelay } = params;

  queue.push(fragmentId);

  const currentFragmentId = queue.shift() as number;
  const nextFragmentId = queue[0];
  // Compare the current and next IDs (next ID could be undefined)
  // Save the content of current fragment, if the ID is different
  if (currentFragmentId === nextFragmentId) return;

  // Sleep by specified milliseconds
  await _sleep(afterDelay);

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
      contentEditingStateChanged(fragmentId, fragmentStore);
    });
}

export { saveContentAsync, saveContent };
