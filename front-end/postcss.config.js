import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, "..");
const require = createRequire(path.join(parentDir, "package.json"));

export default {
  plugins: {
    tailwindcss: require("tailwindcss"),
    autoprefixer: require("autoprefixer"),
  },
};
