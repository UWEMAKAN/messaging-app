import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities';
import { PasswordService } from '../../../services';
import { CreateUserDto, CreateUserResponse } from '../../../dtos';

export class CreateUserCommand implements ICommand {
  constructor(public readonly data: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {
    this.logger = new Logger(CreateUserCommandHandler.name);
  }

  async execute(command: CreateUserCommand): Promise<CreateUserResponse> {
    let user: User = null;
    try {
      user = await this.userRepository.findOne({
        where: { email: command.data.email },
        select: ['id'],
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (user) {
      throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
    }

    const { passwordHash, salt } = this.passwordService.hashPassword(
      command.data.password,
    );

    try {
      user = await this.userRepository.save({
        firstName: command.data.firstName,
        lastName: command.data.lastName,
        email: command.data.email,
        hashedPassword: passwordHash,
        passwordSalt: salt,
      });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return { userId: user.id };
  }
}
