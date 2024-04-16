import { Module } from '@nestjs/common';

import { PrismaService } from '@src/persistence/prisma/prisma.service';
import { ContentController } from '@src/http/rest/controller/content.controller';
import { MediaPlayerService } from './core/service/media-player.service';
import { ContentManagementService } from './core/service/content-management.service';

@Module({
  imports: [],
  controllers: [ContentController],
  providers: [PrismaService, MediaPlayerService, ContentManagementService],
})
export class AppModule {}
