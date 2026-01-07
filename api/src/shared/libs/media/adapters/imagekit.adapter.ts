import type { CDNAdapter, CDNConfig, ImageTransforms } from '../types';

export interface ImageKitConfig extends CDNConfig {}

export class ImageKitCDNAdapter implements CDNAdapter {
  private baseUrl: string;
  private pathPrefix: string;

  constructor(config: ImageKitConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.pathPrefix = config.pathPrefix ?? '';
  }

  getTransformUrl(storagePath: string, transforms?: ImageTransforms): string {
    const url = this.buildBaseUrl(storagePath);

    if (!transforms || Object.keys(transforms).length === 0) {
      return url;
    }

    const params = this.buildTransformParams(transforms);
    return `${url}?tr=${params}`;
  }

  getOriginalUrl(storagePath: string): string {
    return this.buildBaseUrl(storagePath);
  }

  private buildBaseUrl(storagePath: string): string {
    const cleanPath = storagePath.replace(/^\//, '');
    return `${this.baseUrl}${this.pathPrefix}/${cleanPath}`;
  }

  private buildTransformParams(transforms: ImageTransforms): string {
    const parts: string[] = [];

    if (transforms.width) parts.push(`w-${transforms.width}`);
    if (transforms.height) parts.push(`h-${transforms.height}`);
    if (transforms.fit) parts.push(`c-${this.mapFit(transforms.fit)}`);
    if (transforms.cropMode) parts.push(`cm-${transforms.cropMode}`);
    if (transforms.focus) parts.push(`fo-${transforms.focus}`);
    if (transforms.format) {
      parts.push(transforms.format === 'auto' ? 'f-auto' : `f-${transforms.format}`);
    }
    if (transforms.quality) parts.push(`q-${transforms.quality}`);
    if (transforms.blur) parts.push(`bl-${transforms.blur}`);

    return parts.join(',');
  }

  private mapFit(fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'): string {
    const fitMap: Record<string, string> = {
      cover: 'maintain_ratio',
      contain: 'at_max',
      fill: 'force',
      inside: 'at_max',
      outside: 'at_least',
    };
    return fitMap[fit] ?? 'maintain_ratio';
  }
}
