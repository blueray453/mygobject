import fs from "fs";
import path from "path";

export class JsonFileAdapter {
    constructor(dir = ".storage") {
        this.dir = dir;
        fs.mkdirSync(dir, { recursive: true });
    }

    file(key) {
        return path.join(this.dir, key + ".json");
    }

    getItem(key) {
        const f = this.file(key);
        return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
    }

    setItem(key, value) {
        fs.writeFileSync(this.file(key), value);
    }
}