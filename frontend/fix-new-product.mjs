import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:/Users/Admin/Projects/VEYA/frontend/app/products/new/page.tsx';
let content = readFileSync(filePath, 'utf8');

// Target: After the Quantity section, add a closing </div> for the grid div
// The current pattern has:  .../>\n            </div>\n\n          <div>
// We need:                 .../>\n            </div>\n          </div>\n\n          <div>


              />
            </div>

          <div>
            <label className="mb-2 block font-semibold">Main image</label>`;

const targetAfter = `                className="w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-pink-500"
              />
            </div>

          <div>
            <label className="mb-2 block font-semibold">Main image</label>`;

if (content.includes(targetBefore)) {
  content = content.replace(targetBefore, targetAfter);
  writeFileSync(filePath, content, 'utf8');
  console.log('Fixed successfully!');
} else {
  console.log('Pattern not found. Debugging file content around the area...');
  const lines = content.split('\n');
  for (let i = 240; i < lines.length && i < 280; i++) {
    console.log(`${i}: ${JSON.stringify(lines[i])}`);
  }
}
