/* eslint-disable @typescript-eslint/no-non-null-assertion */
const { myAPI } = window;

const openByMenuListener = async (fileData: any) => {
  // Give the browser a chance to paint
  await new Promise((r) => setTimeout(r, 0));

  const outlet = document.getElementById("outlet");
  const homeElement = outlet!.getElementsByTagName("home-element")[0];
  const homeElementRoot = homeElement.shadowRoot!;
  if (fileData.status === undefined) {
    return false;
  }

  if (!fileData.status) {
    alert(`ファイルが開けませんでした\n${fileData.message}`);
    return false;
  }

  const textarea = homeElementRoot.querySelector<HTMLTextAreaElement>("#text")!;
  textarea.value = fileData.text;
};

myAPI.openByMenu((_e: Event, fileData: object) => openByMenuListener(fileData));
