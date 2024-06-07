import { ConfigException } from '../exception/config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    database: {
      host: process.env.DATABASE_HOST,
      database: process.env.DATABASE_NAME,
      password: process.env.DATABASE_PASSWORD,
      port: process.env.DATABASE_PORT,
      url: process.env.DATABASE_URL,
      username: process.env.DATABASE_USERNAME,
    },
    movieDB: {
      apiToken: process.env.MOVIE_API_TOKEN,
      url: process.env.MOVIE_BASE_URL,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `invalid application configuration: ${result.error.message}`,
  );
};
