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

describe('Controllers (e2e)', () => {
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

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(404)
        .expect({ statusCode: 404, message: 'Not Found' });
    });
  });

  describe('UsersController', () => {
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

    it('/users/:userId (GET) 200 Ok', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };
      const user = await request(app.getHttpServer())
        .post('/users')
        .send(body)
        .expect(201);

      return await request(app.getHttpServer())
        .get(`/users/${user.body.userId}`)
        .expect(200);
    });

    it('/users/messages (POST) 200 Ok', async () => {
      const userBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const user = await request(app.getHttpServer())
        .post('/users')
        .send(userBody)
        .expect(201);

      const body = {
        body: 'I want to take a loan',
        userId: user.body.userId,
        type: 'TEXT',
      };

      const message = await request(app.getHttpServer())
        .post('/users/messages')
        .send(body)
        .expect(200);

      const {
        body: messageBody,
        id,
        userId,
        createdAt,
        type,
        priority,
      } = message.body;
      expect.assertions(6);
      expect(messageBody).toStrictEqual(body.body);
      expect(userId).toBe(body.userId);
      expect(type).toBe(body.type);
      expect(typeof createdAt).toBe('string');
      expect(typeof id).toBe('number');
      expect(priority).toBeUndefined();
    });

    it('/users/:userId/messages (GET) 200 Ok', async () => {
      const userBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const user = await request(app.getHttpServer())
        .post('/users')
        .send(userBody)
        .expect(201);

      const body = {
        body: 'I want to take a loan',
        userId: user.body.userId,
        type: 'TEXT',
      };

      const message = await request(app.getHttpServer())
        .post('/users/messages')
        .send(body)
        .expect(200);

      const messages = await request(app.getHttpServer())
        .get(`/users/${user.body.userId}/messages`)
        .send()
        .expect(200);
    });
  });

  describe('AgentsController', () => {
    it('/agents (POST) 201 Created', () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };
      return request(app.getHttpServer())
        .post('/agents')
        .send(body)
        .expect(201);
    });

    it('/agents (POST) 400 Bad Request', () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(5),
      };
      return request(app.getHttpServer())
        .post('/agents')
        .send(body)
        .expect(400);
    });

    it('/agents/messages (POST) 200 Ok', async () => {
      const userBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const user = await request(app.getHttpServer())
        .post('/users')
        .send(userBody)
        .expect(201);

      const agentBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const agent = await request(app.getHttpServer())
        .post('/agents')
        .send(agentBody)
        .expect(201);

      const body = {
        body: 'How may I help you?',
        userId: user.body.userId,
        agentId: agent.body.agentId,
        type: 'TEXT',
      };

      await request(app.getHttpServer())
        .post('/agents/messages')
        .send(body)
        .expect(200);
    });

    it('/agents/close-conversation (POST) 200 Ok', async () => {
      const agentBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const agent = await request(app.getHttpServer())
        .post('/agents')
        .send(agentBody)
        .expect(201);

      const userBody = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };

      const user = await request(app.getHttpServer())
        .post('/users')
        .send(userBody)
        .expect(201);

      const body = {
        body: 'How may I help you?',
        userId: user.body.userId,
        agentId: agent.body.agentId,
        type: 'TEXT',
      };

      await request(app.getHttpServer())
        .post('/agents/messages')
        .send(body)
        .expect(200);

      await request(app.getHttpServer())
        .post('/agents/close-conversation')
        .send({ agentId: body.agentId, userId: body.userId })
        .expect(200);
    });
  });

  describe('AuthController', () => {
    it('/auth/login/users (POST) 200 Ok', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };
      await request(app.getHttpServer()).post('/users').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/users')
        .send({ email: body.email, password: body.password })
        .expect(200);
    });

    it('/auth/login/users (POST) 400 Bad Request', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(6),
      };
      await request(app.getHttpServer()).post('/users').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/users')
        .send({ email: body.email, password: randomString(5) })
        .expect(400);
    });

    it('/auth/login/users (POST) 401 UnAuthorized', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(6),
      };
      await request(app.getHttpServer()).post('/users').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/users')
        .send({ email: randomEmail(), password: randomString(7) })
        .expect(401);
    });

    it('/auth/login/agents (POST) 200 Ok', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(8),
      };
      await request(app.getHttpServer()).post('/agents').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/agents')
        .send({ email: body.email, password: body.password })
        .expect(200);
    });

    it('/auth/login/agents (POST) 400 Bad Request', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(6),
      };
      await request(app.getHttpServer()).post('/agents').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/agents')
        .send({ email: body.email, password: randomString(5) })
        .expect(400);
    });

    it('/auth/login/agents (POST) 401 UnAuthorized', async () => {
      const body = {
        email: randomEmail(),
        firstName: randomString(7),
        lastName: randomString(5),
        password: randomString(6),
      };
      await request(app.getHttpServer()).post('/agents').send(body).expect(201);
      return request(app.getHttpServer())
        .post('/auth/login/agents')
        .send({ email: randomEmail(), password: randomString(7) })
        .expect(401);
    });
  });
});
