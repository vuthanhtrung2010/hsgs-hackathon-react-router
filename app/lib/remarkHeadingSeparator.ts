import type { Root } from "mdast";

export default function remarkHeadingSeparator() {
  return (tree: Root) => {
    const newChildren: Root["children"][number][] = [];
    for (const node of tree.children) {
      newChildren.push(node);
      if (node.type === "heading" && [1, 2, 3].includes(node.depth)) {
        newChildren.push({ type: "thematicBreak" }); // renders as <hr>
      }
    }
    tree.children = newChildren;
  };
}
