import { randomUUID } from 'crypto';
import { BaseEntity, BaseEntityProps } from './base.entity';
import { ThumbnailEntity } from './thumbnail.entity';
import { VideoEntity } from './video.entity';

export interface MovieEntityProps extends BaseEntityProps {
  video: VideoEntity;
  thumbnail?: ThumbnailEntity;
}

export class MovieEntity extends BaseEntity {
  private video: MovieEntityProps['video'];
  private thumbnail: MovieEntityProps['thumbnail'];

  private constructor(data: MovieEntityProps) {
    super(data);
  }

  static createNew(
    data: Omit<MovieEntityProps, 'id' | 'createdAt' | 'updatedAt'>,
    id = randomUUID(),
  ): MovieEntity {
    return new MovieEntity({
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static createFrom(data: MovieEntityProps): MovieEntity {
    return new MovieEntity({
      id: data.id,
      video: data.video,
      thumbnail: data.thumbnail,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  serialize(): Record<string, unknown> {
    return {
      id: this.id,
      video: this.video.serialize(),
      thumbnail: this.thumbnail?.serialize(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  getVideo(): VideoEntity {
    return this.video;
  }

  getThumbnail(): ThumbnailEntity | undefined {
    return this.thumbnail;
  }

  addThumbnail(thumbnail: ThumbnailEntity) {
    this.thumbnail = thumbnail;
  }
}
