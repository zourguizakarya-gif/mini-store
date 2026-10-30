import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  productId: number;

  @Column('int')
  quantity: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
  })
  priceAtPurchase: number;

  @Column('decimal', {
    precision: 12,
    scale: 2,
  })
  total: number;

  @Column({
    default: 'PENDING', // Default status is 'PENDING'
                        // Other possible statuses: 'COMPLETED', 'CANCELLED', etc.
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

