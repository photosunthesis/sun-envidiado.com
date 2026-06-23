import sharp from "sharp";
import { rgbaToThumbHash, thumbHashToRGBA } from "thumbhash";

export async function getThumbHashPlaceholder(fsPath: string): Promise<string> {
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

  return `data:image/png;base64,${png.toString("base64")}`;
}
