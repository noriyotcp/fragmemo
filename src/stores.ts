const { createStore, Store } = TinyBase;

class BaseStore {
  store: typeof Store;
  readonly TABLE_NAME = "states";
  schema = {};

  constructor() {
    this.store = createStore().setSchema(this.schema);
  }

  hasRow(rowId: string) {
    return this.store.hasRow(this.TABLE_NAME, `${rowId}`);
  }

  setRow(rowId: string, cells: object) {
    this.store.setRow(this.TABLE_NAME, `${rowId}`, cells);
  }

  setPartialRow(rowId: string, cells: object) {
    this.store.setPartialRow(this.TABLE_NAME, `${rowId}`, cells);
  }

  getRow(rowId: string) {
    return this.store.getRow(this.TABLE_NAME, `${rowId}`);
  }

  getCell(rowId: string, cell: string) {
    return this.store.getCell(this.TABLE_NAME, `${rowId}`, cell);
  }

  setCell(rowId: string, cell: string, value: string | boolean | number) {
    this.store.setCell(this.TABLE_NAME, `${rowId}`, cell, value);
  }
}

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

class ViewStateStore extends BaseStore {
  // rowId: fragmentId
  schema = {
    states: {
      viewState: { type: "string", default: "" },
    },
  };

  constructor() {
    super();
    this.store.addCellListener(
      null,
      null,
      null,
      (store, tableId, rowId, cellId) => {
        console.log(
          `${cellId} cell in ${rowId} row in ${tableId} table changed`
        );
        console.info("viewStateStore status:", this.store.getTable("states"));
      }
    );
  }
}

export { ViewStateStore, createFragmentStore };
