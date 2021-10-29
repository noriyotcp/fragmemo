import defaultExport, { bar, foo } from "../electron/foo-bar-baz";

jest.mock("../electron/foo-bar-baz", () => {
  const originalModule = jest.requireActual("../electron/foo-bar-baz");

  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => "mocked baz"),
    foo: "mocked foo",
  };
});

test("should do a partial mock", () => {
  const defaultExportResult = defaultExport();
  expect(defaultExportResult).toBe("mocked baz");
  expect(defaultExport).toHaveBeenCalledTimes(1);

  expect(foo).toBe("mocked foo");
  expect(bar()).toBe("bar");
});
