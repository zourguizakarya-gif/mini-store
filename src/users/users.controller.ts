import { Body, Controller, Post, ValidationPipe,Headers, Patch, Param, Delete, Get, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { UsersGuard } from 'src/guards/users/users.guard';
import { Roles } from 'src/guards/roles.decorator/roles.decorator';
import { UsersService } from './users.service';




@UseGuards(UsersGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

//  ╔═══════════════════════════════════════════ USER CREATION ════════════════════════════════════════════╗
                        
//                                          Description: Creates a new user.
//                                          Roles: Admin, Manager "can add anly user as role"
//                                          Method: POST /users
                        
//                                 ╚═════════════════════════════════════════════════════════════╝
    
    @Roles(['admin','manager'])    
    @Post('create_user')
    createUser(
    @Req() request: any,
    @Body(
        new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,        
        transform: true,
            }),
        )
        dto: CreateUserDto,
        ) {
        

    return this.UsersService.createUser(dto,request.user.role);
    }
                               
// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════════ USER UPDATE ═══════════════════════════════════════════════╗

//                                          Description: Updates an existing user.

//                                          Roles: Admin, Manager , User

//                                          Method: PATCH /users/:id

//                          ╚═════════════════════════════════════════════════════════════╝
@Roles(['admin','manager','user'])    
@Patch('update_user/:id')
updateUser(
  
  @Req() request: any,
  @Param('id',ParseIntPipe) id: number,
  @Body(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
       }),
  )
  dto: UpdateUserDto,
   
) {

   return this.UsersService.updateUser(request.user, id, dto);

}

// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝

// ╔════════════════════════════════════════════ FIND ALL USERS ════════════════════════════════════════════╗

//                                          Description: Returns all users.

//                                          Roles: Admin, Manager

//                                          Method: GET /users

//                          ╚═════════════════════════════════════════════════════════════╝
@Roles(['admin','manage'])    
@Get('find_all_users')
findAllUsers(


) {

  return this.UsersService.findAllUsers();
}

// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
// ╔════════════════════════════════════════════ USER DELETION ═════════════════════════════════════════════╗

//                                          Description: Deletes an existing user.

//                                          Roles: Admin, Manager

//                                          Method: DELETE /users/:id

//                          ╚═════════════════════════════════════════════════════════════╝
    @Roles(['admin','manager'])    
    @Delete('delete_user/:id')
    deleteUser(


      @Param('id') id: number,

    ) {

      return this.UsersService.deleteUser(id);

}

// ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}
