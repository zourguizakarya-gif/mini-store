import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity/user.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';

@Injectable()
export class UsersService {
constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    private readonly configService: ConfigService,

){

}

// ╔══════════════════════════════════  USER create ══════════════════════════════════════════════════════╗
                             
//                         create a new user account.
//                         Validates the provided data, hashes the password,
//                         and creates the user in the database.
      
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
    async createUser(body : CreateUserDto,reqRole:any){
        // check if email exist
        const existEmail = await this.userRepository.findOne({
            where: {email:body.email}
        });
        if (existEmail) {throw new ConflictException('Email already exists');}
        // first name last name email and the role and the password
        // hash th password with bycript
        const hashPassword = await bcrypt.hash(
            body.password,
            Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')),
        ) 
        // role add
        const role = reqRole === 'manager' ? 'user' : body.role;

        // create the user
        const user = await this.userRepository.create({
            firstName:body.firstName,
            lastName:body.lastName,
            email:body.email,
            password:hashPassword,
            role
        })
        // save the user in the database
          const savedUser = await this.userRepository.save(user)
        // return the user saved
        return {
           firstName:savedUser.firstName,
            lastName:savedUser.lastName,
            email:savedUser.email,
            password:savedUser.password,
            role:savedUser.role,
        }  
    }


// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                            
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

// ╔══════════════════════════════════  USER update ══════════════════════════════════════════════════════╗
                             
//                         update a new user account.
//                         Validates the provided data, hashes the password,
//                         and save the user in the database.
      
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
     
async updateUser(reqUser: any, id: number, body: UpdateUserDto) {
            // 1. Find the user by ID
            const oldData = await this.userRepository.findOne({
                where: { id },});

            if (!oldData) {
                throw new NotFoundException('User not found');
            }

            // 2. Define the fields that can be updated
            const updateData: Partial<User> = {};

            // 3. ADMIN: Can update any user and any permitted field
            if (reqUser.role === 'admin') {
                if (body.firstName !== undefined) // so not null or undefined
                    updateData.firstName = body.firstName;

                if (body.lastName !== undefined)
                    updateData.lastName = body.lastName;

                if (body.email !== undefined)
                    updateData.email = body.email;

                if (body.role !== undefined)
                    updateData.role = body.role;

                if (body.password !== undefined) {
                         const hashPassword = await bcrypt.hash(
                        body.password,
                        Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')),
                    );

                    updateData.password = hashPassword;
                }
            }

            // 4. MANAGER or USER: Can update only their own account
            else if (reqUser.role === 'manager' || reqUser.role === 'user') {

                // Verify that the requested account belongs to the token user
                if (oldData.email !== reqUser.email) { // the req is token and the olddata is from the id 
                    throw new ForbiddenException(
                        'You can only update your own account',
                    );
                }

                // Allow personal information changes, but not role changes
                if (body.firstName !== undefined)
                    updateData.firstName = body.firstName;

                if (body.lastName !== undefined)
                    updateData.lastName = body.lastName;

                if (body.email !== undefined)
                    updateData.email = body.email;

                if (body.password !== undefined) {
                      const hashPassword = await bcrypt.hash(
                    body.password,
                    Number(this.configService.get<string>('BCRYPT_SALT_ROUNDS')),
                );

                updateData.password = hashPassword;     
                            }

                // Reject attempts to change the role
                if (body.role !== undefined) {
                    throw new ForbiddenException(
                        'You cannot change your own role',
                    );
                }
            }

          

            // 6. Update the database
            Object.assign(oldData, updateData);

            const updatedUser = await this.userRepository.save(oldData);

            // 7. Return the updated user without the password
            const { password, ...result } = updatedUser;  // Take everything else except password and put it in result.
                                                         // ...data : means take all properties from data to anther object.
             return result;
        
        }   
    
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                             
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
// ╔══════════════════════════════════  USER delete ══════════════════════════════════════════════════════╗
                             
//                         delete with id user account.
//                         and show all users in the database.
      
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
                    async deleteUser(id: number) {
                const user = await this.userRepository.findOne({
                    where: { id },
                });

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                await this.userRepository.remove(user);

                // If we reach here, the delete succeeded
                const users = await this.userRepository.find();

                return users;
            }
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                            
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
// ╔══════════════════════════════════  USER find_all ════════════════════════════════════════════════════╗
                             
//                         find all user account in the database
      
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
    
    async findAllUsers() {
    return await this.userRepository.find();
}
        
    
// ╔══════════════════════════════════════════════════════════════════════════════════════════════════════╗
//                            
// ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝
}
