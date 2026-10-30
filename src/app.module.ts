import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { DatabaseModule } from './database/database.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [ ConfigModule.forRoot({
      isGlobal: true,
    }),
   DatabaseModule , AdminModule, AuthModule, UsersModule, ProductsModule, OrdersModule, ReviewsModule,AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
