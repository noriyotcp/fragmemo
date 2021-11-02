import { add } from "../main-process/add";

describe("add", () => {
  it("should return 2 when it gives 1,1", () => {
    const result = add(1, 1);
    expect(result).toBe(2);
  });
});
