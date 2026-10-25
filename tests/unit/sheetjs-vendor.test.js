import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

describe("vendored SheetJS", () => {
  it("pins the expected parser version", () => {
    expect(XLSX.version).toBe("0.20.3");
  });

  it("loads the local browser bundle at the pinned version", async () => {
    const browserBundle = await readFile(
      new URL("../../dashboard-assets/vendor/xlsx-0.20.3.min.js", import.meta.url),
      "utf8",
    );
    const browserContext = {};
    vm.runInNewContext(browserBundle, browserContext, { timeout: 5000 });
    expect(browserContext.XLSX.version).toBe("0.20.3");
  });

  it("keeps the official package checksum stable", async () => {
    const packageBytes = await readFile(new URL("../../vendor/xlsx-0.20.3.tgz", import.meta.url));
    const checksum = createHash("sha256").update(packageBytes).digest("hex");
    expect(checksum).toBe("8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8");
  });
});
