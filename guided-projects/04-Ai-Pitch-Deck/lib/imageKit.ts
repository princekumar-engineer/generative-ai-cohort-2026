import ImageKit, { toFile } from "@imagekit/nodejs";

let imagekitClient: ImageKit | null = null;

function getImageKit(): ImageKit {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not set");
  }

  imagekitClient ??= new ImageKit({ privateKey });
  return imagekitClient;
}