describe("mockReturnValue", () => {
  const myMock = jest.fn();
  myMock.mockReturnValueOnce(10).mockReturnValueOnce("x").mockReturnValue(true);

  it("calls myMock()", () => {
    expect(myMock()).toBe(10);
    expect(myMock()).toBe("x");
    expect(myMock()).toBe(true);
  });
});

describe("filterTestFn", () => {
  const filterTestFn = jest.fn();
  filterTestFn.mockReturnValueOnce(true).mockReturnValueOnce(false);

  const result = [1, 2, 3].filter(filterTestFn);

  it("should be result equal 1", () => {
    expect(result).toEqual([1]);
  });

  it("should be the first calls return 1", () => {
    expect(filterTestFn.mock.calls[0][0]).toBe(1);
  });

  it("should be the second calls return 2", () => {
    expect(filterTestFn.mock.calls[1][0]).toBe(2);
  });

  it("should be the third calls return 3", () => {
    expect(filterTestFn.mock.calls[2][0]).toBe(3);
  });
});
