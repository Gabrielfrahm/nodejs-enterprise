import { TvShow } from './tv-show.entity';
import { Thumbnail } from './thumbnail.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { Video } from './video.entity';
import { DefaultEntity } from '@src/infra/module/typeorm/entity/default.entity';

@Entity('Episode')
export class Episode extends DefaultEntity<Episode> {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  season: number;

  @Column()
  number: number;

  @ManyToOne(() => TvShow, (tvShow) => tvShow.episodes)
  tvShow: TvShow;

  @OneToOne(() => Thumbnail)
  @JoinColumn()
  thumbnail: Thumbnail;

  @OneToOne(() => Video, (video) => video.episode)
  video: Video;
}
