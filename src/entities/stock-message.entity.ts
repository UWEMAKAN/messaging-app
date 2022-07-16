import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'stock_messages' })
export class StockMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;
}
