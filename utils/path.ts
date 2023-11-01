import fs from "fs";
import path from "path";

export function getDir(dir: string) {
  const pathDir = path.join(process.cwd(), dir);

  const filename = fs.readdirSync(pathDir);

  return {
    pathDir,
    filename,
  };
}
