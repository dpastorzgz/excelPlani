import { describe, expect, it, vi } from "vitest";

import {
  composeDashboardSvg,
  copyPngOrDownload,
  escapeXml,
  exportDashboard,
  rasterizeSvgToPng,
} from "../../dashboard-assets/presentation-exporter.js";

const snapshot = {
  sheetName: "Proyecto <Norte>",
  filters: { controlDate: "2026-05-15", assignees: ["Ana & Luis"], dateFrom: null, dateTo: null },
  metrics: { total: 1, completed: 0, completionRatio: 0, delayed: 1 },
  derivedTasks: [{
    name: '<script>alert("x")</script>', assignee: "Ana", plannedStart: "2026-05-01", plannedEnd: "2026-05-20",
    milestone: false, classification: { delayed: true },
  }],
};

describe("presentation exporter", () => {
  it("escapes workbook text and composes a self-contained 1920x1080 SVG without controls", () => {
    expect(escapeXml(`<&"'>`)).toBe("&lt;&amp;&quot;&apos;&gt;");
    const svg = composeDashboardSvg(snapshot);
    expect(svg).toContain('width="1920" height="1080"');
    expect(svg).toContain("Proyecto &lt;Norte&gt;");
    expect(svg).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(svg).not.toContain("<button");
    expect(svg).not.toMatch(/(?:href|src)=["']https?:\/\//u);
  });

  it("rasterizes with exact PNG dimensions and revokes the source URL", async () => {
    const context = { fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: "" };
    const canvas = { width: 0, height: 0, getContext: () => context, toBlob: (callback) => callback(new Blob(["png"], { type: "image/png" })) };
    const document = { createElement: vi.fn(() => canvas) };
    const URLImpl = { createObjectURL: vi.fn(() => "blob:svg"), revokeObjectURL: vi.fn() };
    class ImageMock {
      set src(value) { this.source = value; this.onload(); }
    }
    const blob = await rasterizeSvgToPng("<svg/>", { document, URLImpl, ImageCtor: ImageMock, BlobCtor: Blob });
    expect(blob.type).toBe("image/png");
    expect(canvas).toMatchObject({ width: 1920, height: 1080 });
    expect(context.drawImage).toHaveBeenCalledWith(expect.any(ImageMock), 0, 0, 1920, 1080);
    expect(URLImpl.revokeObjectURL).toHaveBeenCalledWith("blob:svg");
  });

  it("copies PNG when clipboard permission is available", async () => {
    const write = vi.fn(async () => {});
    class ClipboardItemMock { constructor(data) { this.data = data; } }
    const blob = new Blob(["same"], { type: "image/png" });
    const result = await copyPngOrDownload(blob, {
      filename: "dashboard.png", navigator: { clipboard: { write } }, ClipboardItemCtor: ClipboardItemMock,
    });
    expect(result.method).toBe("clipboard");
    expect(write.mock.calls[0][0][0].data["image/png"]).toBe(blob);
  });

  it("downloads the exact same Blob after clipboard rejection", async () => {
    const click = vi.fn();
    const remove = vi.fn();
    const anchor = { click, remove, hidden: false, href: "", download: "" };
    const document = { createElement: vi.fn(() => anchor), body: { append: vi.fn() } };
    const URLImpl = { createObjectURL: vi.fn(() => "blob:png"), revokeObjectURL: vi.fn() };
    class ClipboardItemMock { constructor(data) { this.data = data; } }
    const blob = new Blob(["same"], { type: "image/png" });
    const result = await copyPngOrDownload(blob, {
      filename: "dashboard.png",
      navigator: { clipboard: { write: vi.fn(async () => { throw new Error("denied"); }) } },
      ClipboardItemCtor: ClipboardItemMock,
      document,
      URLImpl,
    });
    expect(result.method).toBe("download");
    expect(URLImpl.createObjectURL).toHaveBeenCalledWith(blob);
    expect(anchor.download).toBe("dashboard.png");
    expect(click).toHaveBeenCalledOnce();
  });

  it("exports using an injected rasterizer and date-safe filename", async () => {
    const blob = new Blob(["png"], { type: "image/png" });
    const rasterize = vi.fn(async () => blob);
    const document = { createElement: () => ({ click() {}, remove() {} }), body: { append() {} } };
    const URLImpl = { createObjectURL: () => "blob:png", revokeObjectURL() {} };
    const result = await exportDashboard(snapshot, { rasterize, navigator: {}, document, URLImpl });
    expect(result.message).toContain("dashboard-2026-05-15.png");
    expect(rasterize).toHaveBeenCalledWith(expect.stringContaining("Proyecto"), expect.any(Object));
  });

  it("describes empty ratios and truncates long task lists for a slide", () => {
    const svg = composeDashboardSvg({
      filters: {},
      metrics: { total: 13, completed: 0, completionRatio: null, delayed: 0 },
      derivedTasks: Array.from({ length: 13 }, (_, index) => ({
        name: `Tarea ${index}`, assignee: "", plannedStart: null, plannedEnd: null, milestone: index === 0,
      })),
    });
    expect(svg).toContain(">—</text>");
    expect(svg).toContain("+ 1 tareas adicionales");
    expect(svg).toContain("Sin asignar");
  });

  it("revokes temporary URLs when image loading or canvas output fails", async () => {
    const URLImpl = { createObjectURL: vi.fn(() => "blob:svg"), revokeObjectURL: vi.fn() };
    class BrokenImage { set src(_value) { this.onerror(); } }
    await expect(rasterizeSvgToPng("<svg/>", {
      document: {}, URLImpl, ImageCtor: BrokenImage, BlobCtor: Blob,
    })).rejects.toThrow("rasterizar");
    expect(URLImpl.revokeObjectURL).toHaveBeenCalledWith("blob:svg");

    class LoadedImage { set src(_value) { this.onload(); } }
    const canvas = { getContext: () => ({ fillRect() {}, drawImage() {} }), toBlob: (callback) => callback(null) };
    await expect(rasterizeSvgToPng("<svg/>", {
      document: { createElement: () => canvas }, URLImpl, ImageCtor: LoadedImage, BlobCtor: Blob,
    })).rejects.toThrow("generar el PNG");
  });
});
