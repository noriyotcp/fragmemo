import Split from "split.js";

Split(["#split-0", "#split-1"], {
  sizes: [25, 75],
  // home-element width is 301.75px for the screen min width 400px
  // so the offset width is 400 - 301.75 = 98.25
  minSize: 98,
  gutterSize: 6,
  gutterAlign: "start",
  snapOffset: 0,
});
