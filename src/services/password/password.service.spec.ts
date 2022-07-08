import * as crypto from 'crypto';
import { PasswordService } from './password.service';

describe(PasswordService.name, () => {
  const service = new PasswordService();

  beforeEach(async () => {
    jest.spyOn(crypto, 'createHash');
    jest.spyOn(crypto, 'createHmac');
    jest.spyOn(crypto, 'randomBytes');
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('PasswordService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return password hash and salt', () => {
    const password = 'Password';
    const { passwordHash, salt } = service.hashPassword(password);
    expect.assertions(5);
    expect(crypto.randomBytes).toBeCalledTimes(1);
    expect(crypto.createHash).toBeCalledTimes(1);
    expect(crypto.createHmac).toBeCalledTimes(1);
    expect(typeof passwordHash).toBe('string');
    expect(typeof salt).toBe('string');
  });
});
