import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
 
import { Product } from './entities/product.entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ╔══════════════════════════════════ PRODUCT CREATE ═════════════════════════════════════════════════════╗

  //                         Create a new product.
  //                         Validates price and stock,
  //                         then saves the product in the database.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async createProduct(body: CreateProductDto) {

    // Price must be greater than 0
    if (body.price <= 0) {
      throw new ConflictException('Price must be greater than 0');
    }

    // Stock cannot be negative
    if (body.stock < 0) {
      throw new ConflictException('Stock cannot be negative');
    }

    const product = this.productRepository.create({
      name: body.name,
      description: body.description,
      price: body.price,
      stock: body.stock,
      category: body.category,
      isActive: body.isActive ?? true,
    });

    const savedProduct = await this.productRepository.save(product);

    return savedProduct;
  }


  // ╔══════════════════════════════════ PRODUCT FIND ALL ═══════════════════════════════════════════════════╗

  //                         Find all products.
  //                         Admin and Manager can see inactive products too.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async findAllProducts() {

    return await this.productRepository.find();
  }


  // ╔══════════════════════════════════ PRODUCT FIND ACTIVE ════════════════════════════════════════════════╗

  //                         Find only active products.
  //                         Used by normal users/store.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async findActiveProducts() {

    return await this.productRepository.find({
      where: {
        isActive: true,
      },
    });
  }


  // ╔══════════════════════════════════ PRODUCT FIND ONE ═══════════════════════════════════════════════════╗

  //                         Find one product by ID.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async findOneProduct(id: number) {

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }


  // ╔══════════════════════════════════ PRODUCT UPDATE ════════════════════════════════════════════════════╗

  //                         Update an existing product.
  //                         Only fields provided in the DTO are changed.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async updateProduct(id: number, body: UpdateProductDto) {

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check price
    if (body.price !== undefined && body.price <= 0) {
      throw new ConflictException('Price must be greater than 0');
    }

    // Check stock
    if (body.stock !== undefined && body.stock < 0) {
      throw new ConflictException('Stock cannot be negative');
    }

    const updateData: Partial<Product> = {};

    if (body.name !== undefined)
      updateData.name = body.name;

    if (body.description !== undefined)
      updateData.description = body.description;

    if (body.price !== undefined)
      updateData.price = body.price;

    if (body.stock !== undefined)
      updateData.stock = body.stock;

    if (body.category !== undefined)
      updateData.category = body.category;

    if (body.isActive !== undefined)
      updateData.isActive = body.isActive;

    Object.assign(product, updateData);// merge the updateData into the existing product entity

    const updatedProduct = await this.productRepository.save(product);

    return updatedProduct;
  }


  // ╔══════════════════════════════════ PRODUCT DELETE ═════════════════════════════════════════════════════╗

  //                         Deactivate a product instead of permanently
  //                         deleting it.
  //
  //                         This protects old orders that reference
  //                         this product.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async deleteProduct(id: number) {    

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isActive = false; // Soft delete by setting isActive to false

    await this.productRepository.save(product);

    return {
      message: 'Product deactivated successfully',
      product,
    };
  }
}