import { readFileSync, writeFileSync } from "fs";

const filePath = "c:/Users/Admin/Projects/VEYA/frontend/app/products/new/page.tsx";
let content = readFileSync(filePath, "utf8");

// Split into lines and find the problematic section
const lines = content.split("\n");
let modified = false;

// Find the pattern: </div> (after Quantity input) followed by blank line followed by <div> (Main image)
for (let i = 0; i < lines.length - 3; i++) {
  if (
    lines[i].trim() === "</div>" &&
    lines[i + 1].trim() === "" &&
    lines[i + 3].includes("Main image")
  ) {
    console.log("Found at lines", i, i + 1, i + 2);
    console.log("Line " + i + ":", JSON.stringify(lines[i]));
    console.log("Line " + (i + 1) + ":", JSON.stringify(lines[i + 1]));
    console.log("Line " + (i + 2) + ":", JSON.stringify(lines[i + 2]));
    
    // Insert a </div> after the closing </div> of Quantity section
    // lines[i] = "            </div>" - this closes the Quantity div
    // We need another </div> to close the grid div
    lines.splice(i + 1, 0, "          </div>");
    modified = true;
    console.log("Inserted closing grid div after line", i);
    break;
  }
}

if (modified) {
  writeFileSync(filePath, lines.join("\n"), "utf8");
  console.log("File updated successfully!");
} else {
  console.log("Pattern not found. Checking lines 265-272:");
  for (let i = 265; i < lines.length && i < 275; i++) {
    console.log(i + ": " + JSON.stringify(lines[i]));
  }
}
