/* eslint-disable @typescript-eslint/no-non-null-assertion */
const { myAPI } = window;
let homeElement: ShadowRoot;

document.addEventListener("DOMContentLoaded", (): void => {
  homeElement = document.getElementsByTagName("home-element")[0].shadowRoot!;
  const textarea = homeElement.querySelector<HTMLTextAreaElement>("#text")!;
  myAPI.setupStorage().then((msg: string) => {
    textarea.value = msg;
  });

  homeElement
    .querySelector<HTMLButtonElement>("#btn-save")!
    .addEventListener("click", () => {
      const textarea = homeElement.querySelector<HTMLTextAreaElement>("#text")!;
      myAPI.fileSaveAs(textarea.value);
    });

  const openByMenuListener = (fileData: any) => {
    if (fileData.status === undefined) {
      return false;
    }

    if (!fileData.status) {
      alert(`ファイルが開けませんでした\n${fileData.message}`);
      return false;
    }

    const textarea = homeElement.querySelector<HTMLTextAreaElement>("#text")!;
    textarea.value = fileData.text;
  };
});

myAPI.openByMenu((_e: Event, fileData: object) => openByMenuListener(fileData));
