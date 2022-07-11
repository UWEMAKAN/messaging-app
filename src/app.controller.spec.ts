import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('all', () => {
    it('should throw 404 Not Found', async () => {
      try {
        await appController.all();
        expect.assertions(1);
        expect(appController.all).toThrowError(new Error('Not Found'));
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException('Not Found', HttpStatus.NOT_FOUND),
        );
      }
    });
  });
});
