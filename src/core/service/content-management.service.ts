import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/persistence/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { ContentEntity } from '../entity/content.entity';
import { MovieEntity } from '../entity/movie.entity';
import { VideoEntity } from '../entity/video.entity';
import { ThumbnailEntity } from '../entity/thumbnail.entity';

export interface CreateContentData {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  sizeInKb: number;
}

@Injectable()
export class ContentManagementService {
  constructor(private readonly prismaService: PrismaService) {}

  async createContent(createContentData: CreateContentData) {
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

    const { title, description, url, thumbnailUrl, sizeInKb } =
      createContentData;

    const createdVideo = await this.prismaService.video.create({
      data: {
        id: randomUUID(),
        title: title,
        description: description,
        url: url,
        thumbnailUrl: thumbnailUrl,
        sizeInKb: sizeInKb,
        duration: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return createdVideo;
  }
}
