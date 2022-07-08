import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

const randomString = (n: number) => {
  let name = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < n; i++) {
    name += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return name;
};

const randomEmail = () => {
  const name = randomString(8);
  const domain = randomString(5);
  return `${name}@${domain}.com`;
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await moduleFixture.close();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404)
      .expect({ statusCode: 404, message: 'Not Found' });
  });

  describe('/users', () => {
    it('/users (POST) 201 Created', () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };
      return request(app.getHttpServer()).post('/users').send(body).expect(201);
    });

    it('/users (POST) 400 Bad Request', () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(5),
      };
      return request(app.getHttpServer()).post('/users').send(body).expect(400);
    });
  });
});
