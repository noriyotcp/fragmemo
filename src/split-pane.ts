import Split from "split.js";

Split(["#split-0", "#split-1"], {
  sizes: [25, 75],
  minSize: 200,
  gutterSize: 6,
  gutterAlign: "start",
  snapOffset: 0,
});
