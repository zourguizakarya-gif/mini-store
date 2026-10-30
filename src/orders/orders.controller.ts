import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { UsersGuard } from 'src/guards/users/users.guard';
import { Roles } from 'src/guards/roles.decorator/roles.decorator';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto/update-order.dto';

@UseGuards(UsersGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly OrdersService: OrdersService) {}

  // ╔════════════════════════════════════════════ ORDER CREATION ═════════════════════════════════════════════╗

  //                                      Description: Creates a new order.
  //                                      Roles: User
  //                                      Method: POST /orders/create_order

  //                                      User can create an order for a product.
  //                                      Product stock will be decreased.

  //                        ╚══════════════════════════════════════════════════════════════════╝

        @Roles(['user'])
        @Post('create_order')
        createOrder(
          @Req() request: any,

          @Body(
            new ValidationPipe({
              whitelist: true,
              forbidNonWhitelisted: true,
              transform: true,
            }),
          )
          dto: CreateOrderDto,
        ) {
            // console.log('REQUEST USER:', request.user);
            //  console.log('USER ID:', request.user?.id);
          return this.OrdersService.createOrder(request.user.sub, dto);
        }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝

 
  // ╔════════════════════════════════════════════ FIND ALL ORDERS ═════════════════════════════════════════════╗

  //                                      Description: Returns all orders.
  //                                      Roles: Admin, Manager
  //                                      Method: GET /orders/find_all_orders

  //                                      Admin and Manager can see all orders.

  //                        ╚══════════════════════════════════════════════════════════════════╝

        @Roles(['admin', 'manager'])
        @Get('find_all_orders')
        findAllOrders() {
          return this.OrdersService.findAllOrders();
        }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND MY ORDERS ══════════════════════════════════════════════╗

  //                                      Description: Returns the current user's orders.
  //                                      Roles: User
  //                                      Method: GET /orders/my_orders

  //                                      User can see only his own orders.

  //                          ╚══════════════════════════════════════════════════════════════════╝

          @Roles(['user'])
          @Get('my_orders')
          findMyOrders(@Req() request: any) {
            return this.OrdersService.findMyOrders(request.user.sub);
          }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ONE ORDER ═════════════════════════════════════════════╗

  //                                      Description: Returns an order by ID.
  //                                      Roles: Admin, Manager, User
  //                                      Method: GET /orders/find_order/:id

  //                                      Admin/Manager can see any order.
  //                                      User can see only his own order.

  //                     ╚══════════════════════════════════════════════════════════════════╝

          @Roles(['admin', 'manager', 'user'])
          @Get('find_order/:id')
          findOneOrder(
            @Req() request: any,

            @Param('id', ParseIntPipe)
            id: number,
          ) {
            return this.OrdersService.findOneOrder(request.user, id);
          }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ ORDER UPDATE ═══════════════════════════════════════════════╗

  //                                      Description: Updates an order status.
  //                                      Roles: Admin, Manager
  //                                      Method: PATCH /orders/update_order/:id

  //                                      Admin and Manager can update order status.
  //                                      User cannot change order status.

  //                       ╚══════════════════════════════════════════════════════════════════╝

          @Roles(['admin', 'manager'])
          @Patch('update_order/:id')
          updateOrder(

            @Param('id', ParseIntPipe)
            id: number,

            @Body(
              new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
              }),
            )
            dto: UpdateOrderDto,
          ) {
            return this.OrdersService.updateOrder( id, dto);
          }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ ORDER CANCELLATION ══════════════════════════════════════════╗

  //                                      Description: Cancels an order.
  //                                      Roles: Admin, Manager, User
  //                                      Method: PATCH /orders/cancel_order/:id

  //                                      User can cancel only his own pending order.
  //                                      Admin and Manager can cancel orders.

  //                     ╚══════════════════════════════════════════════════════════════════╝

        @Roles(['admin', 'manager', 'user'])
        @Patch('cancel_order/:id')
        cancelOrder(
          @Req() request: any,

          @Param('id', ParseIntPipe)
          id: number,
        ) {
          return this.OrdersService.cancelOrder(request.user, id);
        }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ ORDER DELETION ═════════════════════════════════════════════╗

  //                                      Description: Deletes an order.
  //                                      Roles: Admin
  //                                      Method: DELETE /orders/delete_order/:id

  //                                      Only Admin can permanently delete an order.

  //                         ╚══════════════════════════════════════════════════════════════════╝

        @Roles(['admin'])
        @Delete('delete_order/:id')
        deleteOrder(
          @Param('id', ParseIntPipe)
          id: number,
        ) {
          return this.OrdersService.deleteOrder(id);
        }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}