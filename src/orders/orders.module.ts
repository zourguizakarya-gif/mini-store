import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtModule } from 'node_modules/@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';
import { Product } from 'src/products/entities/product.entity/product.entity';
import { Order } from './entities/order.entity/order.entity';

@Module({
   imports:[
              TypeOrmModule.forFeature([Order, Product]),// it from the product entity
              JwtModule,// it from the auth 
    
      ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
