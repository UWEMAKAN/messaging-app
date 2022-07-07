import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    TypeOrmModule.forRoot(
      ((configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [...entities],
        synchronize: false,
        migrationsTableName: configService.get<string>('DB_MIGRATION_TABLE'),
      }))(new ConfigService()),
    ),
    TypeOrmModule.forFeature([...entities]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
