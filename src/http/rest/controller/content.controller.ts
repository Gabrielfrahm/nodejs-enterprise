import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import path, { extname } from 'path';
import type { Request, Response } from 'express';
import fs from 'fs';
import { ContentManagementService } from '@src/core/service/content-management.service';
import { MediaPlayerService } from '@src/core/service/media-player.service';
import { CreateVideoResponseDto } from '@src/http/rest/dto/response/create-video-response.dto';
import { RestResponseInterceptor } from '@src/http/rest/interceptor/rest-response.interceptor';
import { VideoNotFoundException } from '@src/core/exception/video-not-found-exception';

@Controller()
export class ContentController {
  constructor(
    private readonly contentManagementService: ContentManagementService,
    private readonly mediaPlayerService: MediaPlayerService,
  ) {}

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'video',
          maxCount: 1,
        },
        {
          name: 'thumbnail',
          maxCount: 1,
        },
      ],
      {
        dest: './uploads',
        storage: diskStorage({
          destination: './uploads',
          filename: (_req, file, cb) => {
            return cb(
              null,
              `${Date.now()}-${randomUUID()}${extname(file.originalname)}`,
            );
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpeg') {
            return cb(
              new BadRequestException(
                'Invalid file type. Only video/mp4 and image/jpeg are supported.',
              ),
              false,
            );
          }
          return cb(null, true);
        },
      },
    ),
    new RestResponseInterceptor(CreateVideoResponseDto),
  )
  async uploadVideo(
    @Req() _req: Request,
    @Body()
    contentData: {
      title: string;
      description: string;
    },
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<CreateVideoResponseDto> {
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];

    if (!videoFile || !thumbnailFile) {
      throw new BadRequestException(
        'Both video and thumbnail files are required.',
      );
    }

    return this.contentManagementService.createContent({
      title: contentData.title,
      description: contentData.description,
      sizeInKb: videoFile.size,
      thumbnailUrl: thumbnailFile.path,
      url: videoFile.path,
    });
  }

  @Get('stream/:videoId')
  @Header('Content-Type', 'video/mp4')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const url = await this.mediaPlayerService.prepareStreaming(videoId);

      if (!url) {
        throw new NotFoundException(HttpStatus.NOT_FOUND);
      }

      const videoPath = path.join('.', url);
      const fileSize = fs.statSync(videoPath).size;

      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(HttpStatus.PARTIAL_CONTENT, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        file.pipe(res);
      } else {
        res.writeHead(HttpStatus.OK, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      if (error instanceof VideoNotFoundException) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: error.message,
          error: 'Not Found',
          statusCose: HttpStatus.NOT_FOUND,
        });
      }
      throw error;
    }
  }
}
