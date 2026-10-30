import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtModule } from 'node_modules/@nestjs/jwt/dist/jwt.module';
import { Product } from './entities/product.entity/product.entity';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';

@Module({
    imports:[
            TypeOrmModule.forFeature([Product]),// it from the product entity 
            JwtModule,// it from the auth 
  
    ],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
