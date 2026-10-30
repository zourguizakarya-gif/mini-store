import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
          TypeOrmModule.forFeature([User]),
          JwtModule,// it from the auth 

  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
