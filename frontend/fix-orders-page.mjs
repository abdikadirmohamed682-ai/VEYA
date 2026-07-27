import fs from "fs";

const path = "c:/Users/Admin/Projects/VEYA/frontend/app/orders/[id]/page.tsx";
let c = fs.readFileSync(path, "utf8");

// Show the problematic area
const idx = c.indexOf("formatCurrency(item.price * item.quantity)");
console.log("Context at issue:");
console.log(c.substring(idx, idx + 400));
console.log("\n---END CONTEXT---");
