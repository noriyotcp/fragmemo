import { scanDirectories } from "../electron/scanStorage";
import { resolve } from "path";

describe("Scan storage", () => {
  describe("Scan directories", () => {
    it("should scan storage", async () => {
      const path = resolve(__dirname, "../test-fragmemo");
      const directories = await scanDirectories(path);
      expect(directories.length).toBe(1);
      expect(directories[0].name).toBe("snippet-1");
    });
  });
});
