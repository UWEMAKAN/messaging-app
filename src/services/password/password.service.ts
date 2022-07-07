import { Injectable, Logger } from '@nestjs/common';
import { createHash, createHmac, randomBytes } from 'crypto';

@Injectable()
export class PasswordService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(PasswordService.name);
  }

  hashPassword(password: string) {
    const nonce = randomBytes((Math.random() * 1000) / 2);
    const hash = createHash('sha256');
    const salt = hash.update(nonce).digest().toString('base64');
    const hmac = createHmac('sha256', salt);
    const passwordHash = hmac.update(password).digest().toString('base64');

    return { passwordHash, salt };
  }
}
