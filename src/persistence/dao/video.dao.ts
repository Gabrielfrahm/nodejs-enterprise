import { CreateContentData } from '@src/core/service/content-management.service';
import { PrismaService } from '@src/persistence/prisma/prisma.service';
import { randomUUID } from 'crypto';

export class VideoDao {
  constructor(private readonly prismaService: PrismaService) {}

  async create(videoData: CreateContentData) {
    const { description, sizeInKb, thumbnailUrl, title, url } = videoData;
    return this.prismaService.video.create({
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
  }
}
