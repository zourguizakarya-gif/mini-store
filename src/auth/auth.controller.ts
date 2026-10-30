import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto/signup.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


// ╔═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                                                       User signup                                                              
//                                         ╚════════════════════════════════════════╝

@Post('signup') 
Signup(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) signupDto: SignupDto) {
  console.log(signupDto);
  console.log(SignupDto);

 return this.authService.signup(signupDto);
}
// 
// ╚═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝


// ╔═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                                                          User Login                                                                    
//                                          ╚════════════════════════════════════════╝
@Post('signin') 
Login(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) loginDto: LoginDto) {
 return this.authService.signin(loginDto);
}

// ╚═════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

}
