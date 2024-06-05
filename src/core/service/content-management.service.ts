import { Injectable } from '@nestjs/common';
import { ContentEntity } from '../entity/content.entity';
import { MovieEntity } from '../entity/movie.entity';
import { VideoEntity } from '../entity/video.entity';
import { ThumbnailEntity } from '../entity/thumbnail.entity';
import { ContentRepository } from '@src/persistence/repository/content.repository';
import { ConfigService } from '@src/infra/module/config/service/config.service';

export interface CreateContentData {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  sizeInKb: number;
}

@Injectable()
export class ContentManagementService {
  constructor(private readonly contentRepository: ContentRepository) {}

  async createContent(
    createContentData: CreateContentData,
  ): Promise<ContentEntity> {
    const content = ContentEntity.createNew({
      description: createContentData.description,
      title: createContentData.title,
      media: MovieEntity.createNew({
        video: VideoEntity.CreateNew({
          url: createContentData.url,
          duration: 100,
          sizeInKb: createContentData.sizeInKb,
        }),
        thumbnail: ThumbnailEntity.createNew({
          url: createContentData.thumbnailUrl,
        }),
      }),
      type: 'MOVIE',
    });

    const contentSaved = await this.contentRepository.create(content);

    return contentSaved;
  }
}
