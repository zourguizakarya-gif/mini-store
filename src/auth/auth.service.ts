import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto/signup.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
// ╔══════════════════════════════════  USER REGISTRATION ════════════════════════════════════════════════╗
                             
//                         Registers a new user account.
//                         Validates the provided data, hashes the password,
//                         and creates the user in the database.
      
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

   
export class AuthService {
constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,  

) {}
    async signup(signupDto: SignupDto) {
        // it checks if the email already exists in the database
        const existingUser = await this.userRepository.findOne({ where: { email: signupDto.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // get the rounds for hashing from the config service
        const rounds = Number( this.configService.get<string>('BCRYPT_SALT_ROUNDS'));

        // hash the password
        const hashedPassword = await bcrypt.hash(signupDto.password, rounds);
        // create a new user entity
        const newUser = this.userRepository.create({
            firstName: signupDto.firstName,
            lastName: signupDto.lastName,
            email: signupDto.email,
            password: hashedPassword,
        });
        // save the new user to the database
        await this.userRepository.save(newUser);

        // generate a JWT token for the new user
        const payload = { 
            sub: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName, 
            email: newUser.email,
            password: newUser.password,
            role: newUser.role
        };

        const accessToken = this.jwtService.sign(payload);

        return { 
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            password: newUser.password,
            role: newUser.role,
            accessToken: accessToken
         };

    }
// ╔═════════════════════════════════════════════════════════════════════════════════════════════╗
//                            
// ╚═════════════════════════════════════════════════════════════════════════════════════════════╝

// ╔══════════════════════════════════════  USER LOGIN  ═════════════════════════════════════════╗

//                          Authenticates an existing user account.

//                          Validates the provided credentials, checks the password,

//                          and generates an authentication token.

// ╚═════════════════════════════════════════════════════════════════════════════════════════════╝
   

   
    async signin(loginDto: LoginDto) {
        
        // check email exist
        const user = await this.userRepository.findOne({
            where: {email: loginDto.email},
        });

        if(!user){
            return { message: 'Invalid email or password' };
        }
         // it will bcrypt the password and compare it with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(
        loginDto.password,
        user.password,
        ); 
        // exception if the password does not match 
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid email or password');
        } 
    
        // create paylod
        const payload = {
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
        };
        // create the token
        const token = this.jwtService.sign(payload);
        return {access_token: token,};
    
    }
// ╔═════════════════════════════════════════════════════════════════════════════════════════════════╗  

// ╚═════════════════════════════════════════════════════════════════════════════════════════════════╝



    }   