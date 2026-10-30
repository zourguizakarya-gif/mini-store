import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Roles } from "../roles.decorator/roles.decorator";


@Injectable()
export class UsersGuard implements CanActivate { // A guard can add/change properties on the request object.
  constructor(
    private readonly reflector: Reflector,
    private readonly JwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext){
    // when smone use @Roles decorator up of the endpoint apiit will store the roles in the metadata of the handler
    const roles = this.reflector.get(Roles, context.getHandler());
    //console.log('roles',roles);
    // 1 it means it public endpoint and no need to check the role of the user
    if (!roles){return true;}
    // 2 not public endpoint so we need to check the role of the user
    const request = context.switchToHttp().getRequest(); // get request and it get the token dirct without contrroler
    const token = request.headers.authorization?.split(' ',2)[1]; // get authorization header
    //console.log('Authorization:', request.headers.authorization);
    //console.log('Token:', token);
    // 3 verify the token 
    if (!token) {throw new UnauthorizedException('No token provided');} // go singin and get the token
    // 4 get the payload of the token
    try {
      const payload = await this.JwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      request.user = payload; // change the req 
      // console.log(request.user)
            // request
            // ├── headers
            // ├── body
            // ├── params
            // ├── ...
            // └── user   ← added by Guard
            //     ├── id
            //     ├── email
            //     └── role
      if(roles.includes(payload.role.toLowerCase())){return true;} // if the role of the user is in the roles array return true
        else {throw new UnauthorizedException('You do not have permission to access this resource');} // if the role of the user is not in the roles array return false
    } catch (error) {
      throw error;
    }}

}