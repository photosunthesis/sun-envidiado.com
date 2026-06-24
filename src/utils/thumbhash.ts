import sharp from "sharp";
import { rgbaToThumbHash, thumbHashToRGBA } from "thumbhash";

// Same image can be referenced by cover + body in one build; hash it once.
const cache = new Map<string, string>();

export async function thumbHashFromPath(fsPath: string): Promise<string> {
  const cached = cache.get(fsPath);
  if (cached) return cached;

  const { data, info } = await sharp(fsPath)
    .resize(100, 100, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hash = rgbaToThumbHash(info.width, info.height, new Uint8Array(data));
  const { w, h, rgba } = thumbHashToRGBA(hash);

  const png = await sharp(Buffer.from(rgba), {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  const uri = `data:image/png;base64,${png.toString("base64")}`;
  cache.set(fsPath, uri);
  return uri;
}
