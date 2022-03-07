const { createStore, Store } = TinyBase;

const createFragmentStore = (): typeof Store => {
  const schema = {
    states: {
      content: { type: "string", default: "" },
      isEditing: { type: "boolean", default: false },
      langIdx: { type: "number", default: 0 },
    },
  };
  return createStore().setSchema(schema);
};

const createViewStateStore = (): typeof Store => {
  const schema = {
    // rowId: fragmentId
    states: {
      viewState: { type: "string", default: "" },
    },
  };
  return createStore().setSchema(schema);
};

export { createFragmentStore, createViewStateStore, Store };
