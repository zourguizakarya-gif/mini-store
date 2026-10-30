import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,   
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity/order.entity';
import { Product } from 'src/products/entities/product.entity/product.entity';
import { CreateOrderDto } from './dto/create-order.dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ╔══════════════════════════════════ ORDER CREATE ════════════════════════════════════════════════════════╗

  //                         Creates a new order.
  //
  //                         Checks product availability,
  //                         checks stock,
  //                         saves the current price,
  //                         calculates total,
  //                         and decreases product stock.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async createOrder(reqId: any, body: CreateOrderDto) {

    // 1. Find the product
    const product = await this.productRepository.findOne({
      where: {
        id: body.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Check if product is active
    if (!product.isActive) {
      throw new ConflictException(
        'This product is not available',
      );
    }

    // 3. Check quantity
    if (body.quantity <= 0) {
      throw new ConflictException(
        'Quantity must be greater than 0',
      );
    }

    // 4. Check stock
    if (product.stock < body.quantity) {
      throw new ConflictException(
        `Not enough stock. Available stock: ${product.stock}`,
      );
    }

    // 5. Save the price at the moment of purchase
    const priceAtPurchase = product.price;

    // 6. Calculate total
    const total = priceAtPurchase * body.quantity;

    // 7. Create order
    const order = this.orderRepository.create({
      userId: reqId,
      productId: product.id,
      quantity: body.quantity,
      priceAtPurchase,
      total,
      status: 'PENDING',
    });

    // 8. Decrease product stock
    product.stock -= body.quantity;

    // 9. Save product
    await this.productRepository.save(product);

    // 10. Save order
    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }


  // ╔══════════════════════════════════ FIND ALL ORDERS ═════════════════════════════════════════════════════╗

  //                         Returns all orders.
  //                         Used by Admin and Manager.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

     async findAllOrders() {
      return await this.orderRepository.find();
    }


  // ╔══════════════════════════════════ FIND MY ORDERS ═════════════════════════════════════════════════════╗

  //                         Returns orders belonging to the current user.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

    async findMyOrders(reqUseId: number) {
      const orders = await this.orderRepository.find({
        where: {
          userId: reqUseId,
        },
      });
       // check if the user has any orders
      if (orders.length === 0) {
        return {
          message: 'You have no orders yet. ç(°__°)',
          orders: [],
        };
      }

      return orders;
    }

  // ╔══════════════════════════════════ FIND ONE ORDER ══════════════════════════════════════════════════════╗

  //                         Admin/Manager can see any order.
  //                         User can see only his own order.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async findOneOrder(reqUser: any, id: number) {

    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // User can only see his own order
    //console.log('reqUser:', reqUser);
    //console.log(reqUser.role, reqUser.sub); 
    if (
      reqUser.role === 'user' &&
      order.userId !== reqUser.sub
    ) {
      throw new ForbiddenException(
        'You can only view your own orders',
      );
    }

    return order;
  }


  // ╔══════════════════════════════════ ORDER UPDATE  ═══════════════════════════════════════════════════════╗

  //                         Admin and Manager can update order status.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

        async updateOrder(
          id: number,
          body: UpdateOrderDto,
        ) {

          const order = await this.orderRepository.findOne({
            where: { id },
          });

          if (!order) {
            throw new NotFoundException('Order not found');
          }

          // Update only fields provided
          if (body.status !== undefined) {
            order.status = body.status;
          }

          const updatedOrder = await this.orderRepository.save(order);

          return updatedOrder;
        }


  // ╔══════════════════════════════════ ORDER CANCEL ═══════════════════════════════════════════════════════╗

  //                         User can cancel only his own PENDING order.
  //                         Admin and Manager can cancel orders.

  //                         When an order is cancelled,
  //                         its quantity is returned to product stock.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async cancelOrder(reqUser: any, id: number) {

    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // User can only cancel his own order
    if (
      reqUser.role === 'user' &&
      order.userId !== reqUser.sub
    ) { 
      throw new ForbiddenException(
        'You can only cancel your own order',
      );
    }

    // Only pending orders can be cancelled
    if (order.status !== 'PENDING') {
      throw new ConflictException(
        'Only pending orders can be cancelled',
      );
    }

    // Find product
    const product = await this.productRepository.findOne({
      where: {
        id: order.productId,
      },
    });

    if (product) {
      // Return quantity to stock
      product.stock += order.quantity;

      await this.productRepository.save(product);
    }

    // Change order status
    order.status = 'CANCELLED';

    const cancelledOrder =
      await this.orderRepository.save(order);

    return cancelledOrder;
  }


  // ╔══════════════════════════════════ ORDER DELETE ════════════════════════════════════════════════════════╗

  //                         Permanently deletes an order.
  //                         Only Admin can use this method.

  // ╚══════════════════════════════════════════════════════════════════════════════════════════════════════╝

  async deleteOrder(id: number) {

    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.remove(order);

    return {
      message: 'Order deleted successfully',
    };
  }
}