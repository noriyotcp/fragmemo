jest.mock("../electron/foo");
import foo from "../electron/foo";
const fooMock = foo as jest.Mock;

it("should return 42", () => {
  fooMock.mockImplementation((): number => 42);
  expect(foo()).toBe(42);
});

const myMockFn = jest
  .fn(() => "default")
  .mockImplementationOnce(() => "first call")
  .mockImplementationOnce(() => "second call");

it("should call default after third call", () => {
  expect(myMockFn()).toBe("first call");
  expect(myMockFn()).toBe("second call");
  expect(myMockFn()).toBe("default");
  expect(myMockFn()).toBe("default");
});
