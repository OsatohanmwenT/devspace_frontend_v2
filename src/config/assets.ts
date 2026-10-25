// Set NEXT_PUBLIC_ASSET_CDN (no trailing slash) to serve /assets from the CDN.
// Unset, assets come from this app's own public/ folder.
const cdnBase = process.env.NEXT_PUBLIC_ASSET_CDN ?? "";

export function assetUrl(path: string) {
  return `${cdnBase}/assets/${path}`;
}
