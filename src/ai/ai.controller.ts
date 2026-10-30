import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards, 
} from '@nestjs/common';

import { UsersGuard } from 'src/guards/users/users.guard';
import { Roles } from 'src/guards/roles.decorator/roles.decorator';
import { ChatService } from './chat/chat.service';
import { ChatDto } from './chat/dto/chat.dto';

import { RecommendationsService } from './recommendations/recommendations.service';
import { RecommendationDto } from './recommendations/dto/recommendation.dto';

import { ReviewAnalysisService } from './review-analysis/review-analysis.service';
import { ReviewAnalysisDto } from './review-analysis/dto/review-analysis.dto';

@UseGuards(UsersGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly chatService: ChatService,
    private readonly recommendationsService: RecommendationsService,
    private readonly reviewAnalysisService: ReviewAnalysisService,
  ) {}

  // ╔════════════════════════════════════════════ AI CHAT ═════════════════════════════════════════════╗

  //                                      Description: Provides AI chat assistance.
  //                                      Roles: User, Admin, Manager
  //                                      Method: POST /ai/chat

  //                                      User can ask the AI about available products.
  //                                      The AI uses relevant product data to generate a response.

  //                        ╚══════════════════════════════════════════════════════════════════╝

  // Public: only uses public product data.
  @Post('chat')
  @Roles(['user', 'admin', 'manager'])
  chat(@Body() dto: ChatDto) {
    return this.chatService.chat(dto);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ AI RECOMMENDATIONS ═════════════════════════════════════════╗

  //                                      Description: Generates product recommendations for the user.
  //                                      Roles: User
  //                                      Method: POST /ai/recommendations

  //                                      User receives product recommendations based on their previous orders.
  //                                      The user ID is taken from the verified JWT.

  //                        ╚══════════════════════════════════════════════════════════════════╝

  // User recommendations
  @Post('recommendations')
  @Roles(['user'])
  recommendations(
    @Req() req: any,
    @Body() dto: RecommendationDto,
  ) {
    return this.recommendationsService.recommend(
      req.user.sub,  // userId from the verified JWT
      dto,
    );
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝


  // ╔════════════════════════════════════════════ REVIEW ANALYSIS ════════════════════════════════════════════╗

  //                                      Description: Analyzes customer reviews for a product.
  //                                      Roles: Admin
  //                                      Method: POST /ai/review-analysis

  //                                      Admin can analyze product reviews using AI.
  //                                      The AI analyzes ratings and comments and returns a combined review analysis.

  //                        ╚══════════════════════════════════════════════════════════════════╝

  // Admin only: analyze reviews
  @Post('review-analysis')
  @Roles(['admin'])
  reviewAnalysis(@Body() dto: ReviewAnalysisDto) {
    return this.reviewAnalysisService.analyze(dto);
  }

  // ╚════════════════════════════════════════════════════════════════════════════════════════════════════════╝
}