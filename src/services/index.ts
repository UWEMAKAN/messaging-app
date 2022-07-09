import { ConnectionService } from './connection/connection.service';
import { PasswordService } from './password/password.service';

export * from './password/password.service';
export * from './connection/connection.service';

export const services = [ConnectionService, PasswordService];
