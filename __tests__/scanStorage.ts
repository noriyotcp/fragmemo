import { scanDirectories, scanFiles } from "../main-process/scanStorage";
import { resolve } from "path";

describe("Scan storage", () => {
  describe("Scan directories", () => {
    it("should scan directories", async () => {
      const path = resolve(__dirname, "../test-fragmemo");
      const directories = await scanDirectories(path);
      expect(directories.length).toBe(1);
      expect(directories[0].name).toBe("snippet-1");
    });
  });

  describe("Scan files", () => {
    it("should scan files", async () => {
      const path = resolve(__dirname, "../test-fragmemo", "snippet-1");
      const files = await scanFiles(path);
      expect(files.length).toBe(2);
      expect(files[0].name).toBe("test.js");
      expect(files[1].name).toBe("test.ts");
    });
  });
});
