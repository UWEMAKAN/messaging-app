import { Controller, All, HttpException, HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  @All('*')
  async all() {
    throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  }
}
