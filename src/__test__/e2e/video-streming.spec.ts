import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module';
import { ContentManagementService } from '@src/core/service/content-management.service';
import { ContentRepository } from '@src/persistence/repository/content.repository';
import { MovieRepository } from '@src/persistence/repository/movie.repository';
import { VideoRepository } from '@src/persistence/repository/video.repository';
import fs from 'fs';
import request from 'supertest';
import nock from 'nock';
describe('ContentController (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let videoRepository: VideoRepository;
  let contentRepository: ContentRepository;
  let movieRepository: MovieRepository;
  let contentManagementService: ContentManagementService;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    contentManagementService = module.get<ContentManagementService>(
      ContentManagementService,
    );
    videoRepository = module.get<VideoRepository>(VideoRepository);
    contentRepository = module.get<ContentRepository>(ContentRepository);
    movieRepository = module.get<MovieRepository>(MovieRepository);
  });

  beforeEach(async () => {
    jest
      .useFakeTimers({ advanceTimers: true })
      .setSystemTime(new Date('2024-01-01'));
  });

  afterEach(async () => {
    await videoRepository.deleteAll();
    await movieRepository.deleteAll();
    await contentRepository.deleteAll();
    nock.cleanAll();
  });

  afterAll(async () => {
    module.close();
    fs.rmSync('./uploads', { recursive: true, force: true });
  });

  describe('/video (POST)', () => {
    it('uploads a video', async () => {
      nock('https://api.themoviedb.org/3', {
        encodedQueryParams: true,
        reqheaders: {
          Authorization: (): boolean => true,
        },
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`/search/keyword`)
        .query({
          query: 'Test Video',
          page: '1',
        })
        .reply(200, {
          results: [
            {
              id: '1',
            },
          ],
        });

      nock('https://api.themoviedb.org/3', {
        encodedQueryParams: true,
        reqheaders: {
          Authorization: (): boolean => true,
        },
      })
        .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
        .get(`discover/movie`)
        .query({
          with_keywords: '1',
        })
        .reply(200, {
          results: [
            {
              vote_average: 8.5,
            },
          ],
        });
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/test.mp4',
        thumbnailUrl: 'uploads/test.jpg',
        sizeInKb: 1430145,
        duration: 100,
      };

      await request(app.getHttpServer())
        .post('/content/video')
        .attach('video', './test/fixtures/sample.mp4')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          expect(response.body).toMatchObject({
            title: video.title,
            description: video.description,
            url: expect.stringContaining('mp4'),
            // thumbnailUrl: expect.stringContaining('jpg'),
            // sizeInKb: video.sizeInKb,
            // duration: video.duration,
          });
        });
    });

    it('throws an error when the thumbnail is not provided', async () => {
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/test.mp4',
        thumbnailUrl: 'uploads/test.jpg',
        sizeInKb: 1430145,
        duration: 100,
      };

      await request(app.getHttpServer())
        .post('/content/video')
        .attach('video', './test/fixtures/sample.mp4')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          expect(response.body).toMatchObject({
            message: 'Both video and thumbnail files are required.',
            error: 'Bad Request',
            statusCode: 400,
          });
        });
    });

    it('does not allow non mp4 files', async () => {
      const video = {
        title: 'Test Video',
        description: 'This is a test video',
        videoUrl: 'uploads/test.mp4',
        thumbnailUrl: 'uploads/test.jpg',
        sizeInKb: 100,
        duration: 100,
      };

      await request(app.getHttpServer())
        .post('/content/video')
        .attach('video', './test/fixtures/sample.mp3')
        .attach('thumbnail', './test/fixtures/sample.jpg')
        .field('title', video.title)
        .field('description', video.description)
        .expect(HttpStatus.BAD_REQUEST)
        .expect({
          message:
            'Invalid file type. Only video/mp4 and image/jpeg are supported.',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
  });
  describe('/stream/:videoId', () => {
    it('streams a video', async () => {
      const createMovie = await contentManagementService.createMovie({
        title: 'Test Video',
        description: 'This is a test video',
        url: './test/fixtures/sample.mp4',
        thumbnailUrl: './test/fixtures/sample.jpg',
        sizeInKb: 1430145,
      });

      const fileSize = 1430145;
      const range = `bytes=0-${fileSize - 1}`;

      const response = await request(app.getHttpServer())
        .get(`/stream/${createMovie.movie.video.id}`)
        .set('Range', range)
        .expect(HttpStatus.PARTIAL_CONTENT);

      expect(response.headers['content-range']).toBe(
        `bytes 0-${fileSize - 1}/${fileSize}`,
      );
      expect(response.headers['accept-ranges']).toBe('bytes');
      expect(response.headers['content-length']).toBe(String(fileSize));
      expect(response.headers['content-type']).toBe('video/mp4');
    });

    it('returns 404 if the video is not found', async () => {
      await request(app.getHttpServer())
        .get('/stream/45705b56-a47f-4869-b736-8f6626c940f8')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
