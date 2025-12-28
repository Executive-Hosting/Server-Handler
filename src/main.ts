import * as fs from "fs";

if (!fs.existsSync("data")) {
  fs.mkdirSync("data/backups", { recursive: true });
}
