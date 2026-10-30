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

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto/update-product.dto';

@UseGuards(UsersGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly ProductsService: ProductsService) {}

  // ╔════════════════════════════════════════════ PRODUCT CREATION ═══════════════════════════════════════════╗

  //                                      Description: Creates a new product.
  //                                      Roles: Admin, Manager
  //                                      Method: POST /products/create_product
  //
  //                                      Admin and Manager can create products.
  //
  //                        ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager'])
  @Post('create_product')
  createProduct(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: CreateProductDto,
  ) {
    return this.ProductsService.createProduct(dto);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ALL PRODUCTS ═══════════════════════════════════════════╗

  //                                      Description: Returns all products.
  //                                      Roles: Admin, Manager
  //                                      Method: GET /products/find_all_products
  //
  //                                      Admin and Manager can see all products,
  //                                      including inactive products.
  //
  //                        ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager'])
  @Get('find_all_products')
  findAllProducts() {
    return this.ProductsService.findAllProducts();
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ACTIVE PRODUCTS ═══════════════════════════════════════╗

  //                                      Description: Returns all active products.
  //                                      Roles: Admin, Manager, User
  //                                      Method: GET /products/find_active_products
  //
  //                                      Users can see only products that are active.
  //
  //                        ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager', 'user'])
  @Get('find_active_products')
  findActiveProducts() {
    return this.ProductsService.findActiveProducts();
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ONE PRODUCT ═══════════════════════════════════════════╗

  //                                      Description: Returns one product by ID.
  //                                      Roles: Admin, Manager, User
  //                                      Method: GET /products/find_product/:id
  //
  //                                      ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager', 'user'])
  @Get('find_product/:id')
  findOneProduct(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.ProductsService.findOneProduct(id);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ PRODUCT UPDATE ═════════════════════════════════════════════╗

  //                                      Description: Updates an existing product.
  //                                      Roles: Admin, Manager
  //                                      Method: PATCH /products/update_product/:id
  //
  //                                      Admin and Manager can update product information,
  //                                      including price, stock and active status.
  //
  //                                      ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager'])
  @Patch('update_product/:id')
  updateProduct(
    @Param('id', ParseIntPipe)
    id: number,

    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: UpdateProductDto,
  ) {
    return this.ProductsService.updateProduct(id, dto);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ PRODUCT DELETION ══════════════════════════════════════════╗

  //                                      Description: Deletes an existing product.
  //                                      Roles: Admin
  //                                      Method: DELETE /products/delete_product/:id
  //
  //                                      Only Admin can delete a product.
  //                                      If the product has existing orders,
  //                                      the service should use soft delete
  //                                      by setting isActive to false.
  //
  //                                      ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin'])
  @Delete('delete_product/:id')
  deleteProduct(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.ProductsService.deleteProduct(id);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}