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

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto/update-review.dto';

@UseGuards(UsersGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly ReviewsService: ReviewsService) {}

  // ╔════════════════════════════════════════════ REVIEW CREATION ════════════════════════════════════════════╗

  //                                      Description: Creates a new review.
  //                                      Roles: User
  //                                      Method: POST /reviews/create_review
  //
  //                                      Users can create a review for a product.
  //                                      A user can review the same product only once.
  //
  //                           ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['user'])
  @Post('create_review')
  createReview(
    @Req() request: any,

    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: CreateReviewDto,
  ) {
    return this.ReviewsService.createReview(request.user, dto);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ALL REVIEWS ═══════════════════════════════════════════╗

  //                                      Description: Returns all reviews.
  //                                      Roles: Admin, Manager
  //                                      Method: GET /reviews/find_all_reviews
  //
  //                                      Admin and Manager can see all reviews.
  //
  //                        ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager'])
  @Get('find_all_reviews')
  findAllReviews() {
    return this.ReviewsService.findAllReviews();
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND PRODUCT REVIEWS ═══════════════════════════════════════╗

  //                                      Description: Returns all reviews of a product.
  //                                      Roles: Admin, Manager, User
  //                                      Method: GET /reviews/find_product_reviews/:productId
  //
  //                                      All users can see reviews belonging to a product.
  //
  //                              ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager', 'user'])
  @Get('find_product_reviews/:productId')
  findProductReviews(
    @Param('productId', ParseIntPipe)
    productId: number,
  ) {
    return this.ReviewsService.findProductReviews(productId);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ FIND ONE REVIEW ════════════════════════════════════════════╗

  //                                      Description: Returns one review by ID.
  //                                      Roles: Admin, Manager, User
  //                                      Method: GET /reviews/find_review/:id
  //
  //                                      Admin and Manager can see any review.
  //                                      Users can see only their own review.
  //
  //                         ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager', 'user'])
  @Get('find_review/:id')
  findOneReview(
    @Req() request: any,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.ReviewsService.findOneReview(request.user, id);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ REVIEW UPDATE ══════════════════════════════════════════════╗

  //                                      Description: Updates an existing review.
  //                                      Roles: User
  //                                      Method: PATCH /reviews/update_review/:id
  //
  //                                      Users can update only their own reviews.
  //
  //                          ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['user'])
  @Patch('update_review/:id')
  updateReview(
    @Req() request: any,

    @Param('id', ParseIntPipe)
    id: number,

    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    dto: UpdateReviewDto,
  ) {
    return this.ReviewsService.updateReview(
      request.user,
      id,
      dto,
    ); 
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ REVIEW DELETION ═════════════════════════════════════════════╗

  //                                      Description: Deletes an existing review.
  //                                      Roles: Admin, Manager, User
  //                                      Method: DELETE /reviews/delete_review/:id
  //
  //                                      Admin and Manager can delete any review.
  //                                      Users can delete only their own review.
  //
  //                           ╚══════════════════════════════════════════════════════════════════╝

  @Roles(['admin', 'manager', 'user'])
  @Delete('delete_review/:id')
  deleteReview(
    @Req() request: any,

    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.ReviewsService.deleteReview(
      request.user,
      id,
    );
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}