import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity/user.entity';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private configService: ConfigService,
  ) {}

  async onModuleInit() {
      console.log('🔥 ADMIN SERVICE IS RUNNING');
    await this.createFirstAdmin();

  }

  private async createFirstAdmin() {
    // Check if an admin already exists
   console.log('BEFORE QUERY');

    const adminExists = await this.usersRepository.findOne({
      where: { role: 'admin' },
    });
    // console.log('AFTER QUERY', adminExists);


    if (adminExists) {
      await console.log('Admin already exists.');
      return;
    }
// console.log('1 - query finished');

    // Get admin information from .env
    const firstName = this.configService.get<string>('ADMIN_FIRST_NAME');
    const lastName = this.configService.get<string>('ADMIN_LAST_NAME');
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

// console.log('2 - env loaded');
// console.log('firstName:', firstName);
// console.log('lastName:', lastName);
// console.log('email:', email);
// console.log('password exists:', !!password);
    if (!email || !password) {
      console.log('ADMIN_EMAIL or ADMIN_PASSWORD is missing.');
      return;
    }

    // Hash password
   
    const rounds = Number(
    this.configService.get<string>('BCRYPT_SALT_ROUNDS'),);
     const hashedPassword = await bcrypt.hash(password, rounds);
     console.log('4 - password hashed');

     const admin = this.usersRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    await this.usersRepository.save(admin);

    console.log(`First admin created: ${email}`);
  }
}