const fs = require('fs');

function fixApp() {
  const file = 'src/App.tsx';
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('VITE_API_URL')) {
    code = code.replace('import type { AgentMessage, RegionOption } from "../types";', 'import type { AgentMessage, RegionOption } from "../types";\n\nconst API_URL = import.meta.env.VITE_API_URL || "";');
    code = code.replace(/fetch\("\/api\//g, 'fetch(`${API_URL}/api/');
    fs.writeFileSync(file, code);
  }
}

fixApp();
