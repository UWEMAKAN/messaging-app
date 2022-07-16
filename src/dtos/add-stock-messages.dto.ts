/* eslint-disable @typescript-eslint/ban-types */
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export class AddStockMessagesDto {
  /**
   * List of stock messages
   */
  @ArrayMaxSize(10)
  @ArrayMinSize(1)
  @IsArray({ always: true })
  @ContainsStockMessages({
    message: `must contain only objects like { "id": number, "text": string } and id and text must both be unique`,
  })
  public readonly messages: StockMessageDto[];
}

export class StockMessageDto {
  /**
   * Quick response message
   * @example 'How may I be of service?'
   */
  @IsString()
  @IsNotEmpty()
  public readonly text: string;

  /**
   * Id of the message to be created or updated
   * @example 1
   */
  @IsInt()
  @Min(1)
  @Max(10)
  public readonly id: number;
}

export function ContainsStockMessages(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'containsStockMessages',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          const ids = [];
          const texts = [];
          for (const message of value) {
            if (
              !message.id ||
              ids.includes(message.id) ||
              message.id < 1 ||
              message.id > 10 ||
              !message.text ||
              texts.includes(message.text.toLowerCase())
            ) {
              return false;
            }
            ids.push(message.id);
            texts.push(message.text.toLowerCase());
          }
          return true;
        },
      },
    });
  };
}
