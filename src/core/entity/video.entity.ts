import { randomUUID } from 'crypto';
import { BaseEntity, BaseEntityProps } from './base.entity';

export type NewVideoEntity = Omit<
  VideoEntityProps,
  'id' | 'createdAt' | 'updatedAt'
>;

export interface VideoEntityProps extends BaseEntityProps {
  url: string;
  sizeInKb: number;
  duration: number;
}

export class VideoEntity extends BaseEntity {
  private url: VideoEntityProps['url'];
  private sizeInKb: VideoEntityProps['sizeInKb'];
  private duration: VideoEntityProps['duration'];

  private constructor(data: VideoEntityProps) {
    super(data);
  }

  static CreateNew(data: NewVideoEntity, id = randomUUID()): VideoEntity {
    return new VideoEntity({
      id,
      url: data.url,
      sizeInKb: data.sizeInKb,
      duration: data.duration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static CreateFrom(data: VideoEntityProps): VideoEntity {
    return new VideoEntity({
      id: data.id,
      url: data.url,
      sizeInKb: data.sizeInKb,
      duration: data.duration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static getMaxFileSize(): number {
    const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1 gb
    return MAX_FILE_SIZE;
  }

  static getMaxThumbnailSize(): number {
    const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10 mb
    return MAX_FILE_SIZE;
  }

  serialize() {
    return {
      id: this.id,
      url: this.url,
      sizeInKb: this.sizeInKb,
      duration: this.duration,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  gerDuration(): number {
    return this.duration;
  }

  getSizeInKb(): number {
    return this.sizeInKb;
  }

  getUrl(): string {
    return this.url;
  }
}
