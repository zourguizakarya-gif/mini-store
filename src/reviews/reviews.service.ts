import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'; 

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity/review.entity';
import { Product } from 'src/products/entities/product.entity/product.entity';

import { CreateReviewDto } from './dto/create-review.dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ╔════════════════════════════════════════════ REVIEW CREATION ════════════════════════════════════════════╗

  //                                      Description: Creates a new review.
  //
  //                                      The service first checks if the product exists.
  //                                      It then checks if the user has already reviewed
  //                                      the same product.
  //
  //                                      A user can review a product only once.
  //
  //                          ╚══════════════════════════════════════════════════════════════════╝

        async createReview(reqUser: any, body: CreateReviewDto) {

          // Check if the product exists.
          const product = await this.productRepository.findOne({
            where: {
              id: body.productId,
            },
          });

          if (!product) {
            throw new NotFoundException('Product not found');
          }

          // Check if the user already reviewed this product.
          const existingReview = await this.reviewRepository.findOne({
            where: {
              userId: reqUser.sub,
              productId: body.productId,
            },
          });

          if (existingReview) {
            throw new ConflictException(
              'You have already reviewed this product',
            );
          }

          // Create the review.
          const review = this.reviewRepository.create({
            userId: reqUser.sub,
            productId: body.productId,
            rating: body.rating,
            comment: body.comment,
          });

          return await this.reviewRepository.save(review);
        }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ALL REVIEWS ═══════════════════════════════════════════╗

  //                                      Description: Returns all reviews.
  //
  //                                      Admin and Manager can use this method
  //                                      to see all reviews in the system.
  //
  //                         ╚══════════════════════════════════════════════════════════════════╝

  async findAllReviews() {
    return await this.reviewRepository.find();
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND PRODUCT REVIEWS ═══════════════════════════════════════╗

  //                                      Description: Returns all reviews of a product.
  //
  //                                      The service first checks if the product exists,
  //                                      then returns all reviews belonging to that product.
  //
  //                              ╚══════════════════════════════════════════════════════════════════╝

  async findProductReviews(productId: number) {

    // Check if the product exists.
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
   // check if there are reviews for the product.
    const reviews = await this.reviewRepository.find({
      where: {
        productId,
      },
    });
    if (!reviews || reviews.length === 0) {
      throw new NotFoundException(
        'No reviews found for this product',
      );
    }
    return reviews;
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ONE REVIEW ═══════════════════════════════════════════╗

  //                                      Description: Returns one review by ID.
  //
  //                                      Admin and Manager can see any review.
  //                                      User can see only their own review.
  //
  //                        ╚══════════════════════════════════════════════════════════════════╝

  async findOneReview(reqUser: any, id: number) {

    const review = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // User can only see their own review.
    if (
      reqUser.role === 'user' &&
      review.userId !== reqUser.sub
    ) {
      throw new ForbiddenException(
        'You can only access your own review',
      );
    }

    return review;
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ REVIEW UPDATE ══════════════════════════════════════════════╗

  //                                      Description: Updates an existing review.
  //
  //                                      Users can update only their own reviews.
  //                                      The product of a review cannot be changed.
  //
  //                           ╚══════════════════════════════════════════════════════════════════╝

  async updateReview(
    reqUser: any,
    id: number,
    body: UpdateReviewDto,
  ) {

    const review = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if the review belongs to the current user.
     // console.log('reqUser:', reqUser.id);
    //  console.log('review.userId:', review.userId);
    if (review.userId !== reqUser.sub) {
      throw new ForbiddenException(
        'You can only update your own review',
      );
    }

    // Update rating if provided.
    if (body.rating !== undefined) {
      review.rating = body.rating;
    }

    // Update comment if provided.
    if (body.comment !== undefined) {
      review.comment = body.comment;
    }

    // A review cannot be moved to another product.
    if (body.productId !== undefined) {
      throw new ForbiddenException(
        'You cannot change the product of a review',
      );
    }

    return await this.reviewRepository.save(review);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ REVIEW DELETION ═════════════════════════════════════════════╗

  //                                      Description: Deletes an existing review.
  //
  //                                      Admin and Manager can delete any review.
  //                                      User can delete only their own review.
  //
  //                            ╚══════════════════════════════════════════════════════════════════╝

  async deleteReview(reqUser: any, id: number) {

    const review = await this.reviewRepository.findOne({
      where: {
        id,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // User can delete only their own review.
    if (
      reqUser.role === 'user' &&
      review.userId !== reqUser.sub
    ) {
      throw new ForbiddenException(
        'You can only delete your own review',
      );
    }

    await this.reviewRepository.remove(review);

    return {
      message: 'Review deleted successfully',
    };
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}