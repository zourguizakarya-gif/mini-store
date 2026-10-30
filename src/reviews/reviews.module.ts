import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { JwtModule } from 'node_modules/@nestjs/jwt/dist/jwt.module';
import { TypeOrmModule } from 'node_modules/@nestjs/typeorm/dist/typeorm.module';
import { Product } from 'src/products/entities/product.entity/product.entity';
import { Review } from './entities/review.entity/review.entity';

@Module({
   imports:[
              TypeOrmModule.forFeature([Product, Review]),// it from the product entity
                JwtModule,// it from the auth 
    
      ],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
