export const MEDIA_ENTITY = {
  GAME: 'GAME',
  PRODUCT: 'PRODUCT',
} as const;

export const MEDIA_KIND = {
  COVER: 'COVER',
  HERO: 'HERO',
  GALLERY: 'GALLERY',
  TRAILER_THUMBNAIL: 'TRAILER_THUMBNAIL',
} as const;

export type MediaEntityType = typeof MEDIA_ENTITY[keyof typeof MEDIA_ENTITY];
export type MediaKind = typeof MEDIA_KIND[keyof typeof MEDIA_KIND];

export interface MediaAssetLike {
  id: string;
  entityType: string;
  entityId: string;
  kind: string;
  url: string;
  altText: string;
  source: string | null;
  sourceUrl: string | null;
  attribution: string | null;
  license: string | null;
  sortOrder: number;
}

export function isSupportedMediaKind(value: string): value is MediaKind {
  return Object.values(MEDIA_KIND).includes(value as MediaKind);
}

export function mediaAltText(asset: Pick<MediaAssetLike, 'altText'>, fallback: string) {
  return asset.altText.trim() || fallback;
}

export function sortMediaAssets<T extends Pick<MediaAssetLike, 'sortOrder'>>(assets: T[]) {
  return [...assets].sort((a, b) => a.sortOrder - b.sortOrder);
}
