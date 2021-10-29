function forEach(items, callback): void {
  for (let index = 0; index < items.length; index++) {
    callback(items[index]);
  }
}

const mockCallback = jest.fn((x) => 42 + x);
forEach([0, 1], mockCallback);

describe("forEach", () => {
  it("should be called twice", () => {
    expect(mockCallback.mock.calls.length).toBe(2);
  });

  it("The first argument of the first call to the function was 0", () => {
    expect(mockCallback.mock.calls[0][0]).toBe(0);
  });

  it("The first argument of the second call to the function was 1", () => {
    expect(mockCallback.mock.calls[1][0]).toBe(1);
  });

  it("The return value of the first call to the function was 42", () => {
    expect(mockCallback.mock.results[0].value).toBe(42);
  });
});
