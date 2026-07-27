import fs from "fs";

const path = "c:/Users/Admin/Projects/VEYA/frontend/app/orders/[id]/page.tsx";
let c = fs.readFileSync(path, "utf8");

// Replace the corrupted section
const oldPart = `                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#D94680]">{formatCurrency(item.price)}</p>
                        <p className="mt-1 text-sm text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                        </div>
                      ))}
                    </div>
                </div>
            </section>`;

const newPart = `                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#D94680]">{formatCurrency(item.price)}</p>
                        <p className="mt-1 text-sm text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                  ))}
                </div>
            </section>`;

if (c.includes(oldPart)) {
  c = c.replace(oldPart, newPart);
  fs.writeFileSync(path, c, "utf8");
  console.log("✓ Fixed successfully. File size:", fs.statSync(path).size);
} else {
  console.log("✗ Old text not found!");
  // Debug: show context
  const idx = c.indexOf('formatCurrency(item.price * item.quantity)');
  if (idx > -1) {
    console.log("Context:", JSON.stringify(c.substring(idx, idx + 400)));
  }
}
