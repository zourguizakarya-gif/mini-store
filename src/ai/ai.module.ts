import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { ChatService } from './chat/chat.service';
import { RecommendationsService } from './recommendations/recommendations.service';
import { ReviewAnalysisService } from './review-analysis/review-analysis.service';
import { Product } from 'src/products/entities/product.entity/product.entity';
import { Order } from 'src/orders/entities/order.entity/order.entity';
import { Review } from 'src/reviews/entities/review.entity/review.entity';
import { JwtModule } from 'node_modules/@nestjs/jwt/dist/jwt.module';

@Module({
  imports: [
    // the config module is aready imported in the app.module.ts 
    ConfigModule, // lets the services read OPENAI_API_KEY and AI_MODEL 
    // Reuses your EXISTING entities and your EXISTING database connection.
    TypeOrmModule.forFeature([Product, Order, Review]),
                  JwtModule,// it from the auth 
    
  ],
  controllers: [AiController],
  providers: [ChatService, RecommendationsService, ReviewAnalysisService],
})
export class AiModule {}
