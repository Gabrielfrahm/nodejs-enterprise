import { Module } from '@nestjs/common';

import { PrismaService } from '@src/persistence/prisma/prisma.service';
import { ContentController } from '@src/http/rest/controller/content.controller';
import { MediaPlayerService } from './core/service/media-player.service';
import { ContentManagementService } from './core/service/content-management.service';
import { ContentRepository } from './persistence/repository/content.repository';
import { VideoRepository } from './persistence/repository/video.repository';
import { MediaPlayerController } from './http/rest/controller/media-player.controller';
import { ConfigModule } from './infra/module/config/config.module';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ContentController, MediaPlayerController],
  providers: [
    PrismaService,
    MediaPlayerService,
    ContentManagementService,
    ContentRepository,
    VideoRepository,
  ],
})
export class AppModule {}
