import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { StringValue } from 'ms';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity/user.entity';

@Module({
  imports: [ // need to back to it
      TypeOrmModule.forFeature([User]),
 
    JwtModule.registerAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: configService.getOrThrow<string>(
            'JWT_EXPIRES_IN',
          ) as StringValue,
        },
      }),
    }),
  ],
  exports: [JwtModule],
  controllers: [AuthController],
  providers: [AuthService],

})
export class AuthModule {}