import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpErrorFilter, LoggingInterceptor, ValidationPipe } from './utils';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { entities } from './entities';
import { services } from './services';
import { commandHandlers } from './application';
import { controllers } from './controllers';

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
  controllers: [...controllers, AppController],
  providers: [
    ...commandHandlers,
    ...services,
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
