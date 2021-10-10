const { myAPI } = window;

document.addEventListener("DOMContentLoaded", (): void => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
  myAPI.setupStorage().then((msg: string) => {
    textarea.value = msg;
  });
});

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
document
  .querySelector<HTMLButtonElement>("#btn-save")!
  .addEventListener("click", () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
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

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const textarea = document.querySelector<HTMLTextAreaElement>("#text")!;
  textarea.value = fileData.text;
};

myAPI.openByMenu((_e: Event, fileData: object) => openByMenuListener(fileData));
