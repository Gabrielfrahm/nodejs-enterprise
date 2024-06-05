import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Content } from '@src/persistence/entity/content.entity';
import { DefaultTypeOrmRepository } from '@src/infra/module/typeorm/repository/default-typeorm.repository';

export class ContentRepository extends DefaultTypeOrmRepository<Content> {
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(Content, dataSource);
  }
}
