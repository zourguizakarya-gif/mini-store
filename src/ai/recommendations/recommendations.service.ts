import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThan, Not, Repository } from 'typeorm';
import OpenAI from 'openai';

import { RecommendationDto } from './dto/recommendation.dto';
import { Product } from 'src/products/entities/product.entity/product.entity';
import { Order } from 'src/orders/entities/order.entity/order.entity';

interface ProductForAi {
  id: number;
  name: string;
  description: string;
  price: number;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService, 
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing. Add it to your .env file.');
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    this.model = this.configService.get<string>('AI_MODEL') ?? 'openai/gpt-oss-20b';
  }



  // `userId` comes from the verified JWT (see the controller), never from the body.
  async recommend(userId: number, dto: RecommendationDto) {
    const max = dto.maxRecommendations ?? 5;

    // 1 + 2. Orders of THIS user and the products inside them.
    const purchased = await this.getPurchasedProducts(userId); 
    // the  purchased it array of products that user bought before "without test the status of the oreders"
    if (purchased.length === 0) {
      return {
        recommendations: [],
        message: 'You have no purchase history yet, so there is nothing to base recommendations on.',
      };
    }

    // 3. Products the user can still buy (in stock, not bought before).
    const candidates = await this.getCandidateProducts(purchased.map((p) => p.id));
    if (candidates.length === 0) {
      return {
        recommendations: [],
        message: 'There are no new products available to recommend right now.',
      };
    }

    // 4 + 5. Ask the AI which candidates fit best.
    const aiPicks = await this.askAi(purchased, candidates, max);

    // 6. Build the final answer from DATABASE values. The AI only gives us
    // IDs and reasons; names and prices always come from PostgreSQL.
    const candidateById = new Map(candidates.map((p) => [p.id, p])); // get id and products p from candidates
    const recommendations = aiPicks // take the productsid and the reason 
      .filter((pick) => candidateById.has(pick.productId)) // check if the id in the pick from ai  are in the candidates
      .slice(0, max) // number of recomandtions
      .map((pick) => {
        const product = candidateById.get(pick.productId)!; // this will put the products value using the candidateById"candidate"
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          reason: pick.reason,
        };
      });

    return { recommendations };
  }



 // get the  products from the database start from userid to user_id_oreders to oredrs_id_products to products_id_products
  private async getPurchasedProducts(userId: number): Promise<ProductForAi[]> {
  try {
    // get the last 20 orders of this user, most recent first
    const orders = await this.orderRepository.find({
      where: { userId },
      order: { id: 'DESC' },// descending order by id (most recent first)
      take: 20,
    });
    
    // get from the orders the unique product IDs
    const productIds = [...new Set( //  new Set() — remove duplicates
                                    // ... : convert the Set back into an array
      orders.map((order) => order.productId),
    )];

    if (productIds.length === 0) {
      return [];
    }
    // get the products from the database that match those IDs
    const products = await this.productRepository.find({
      where: {
        id: In(productIds), // Find products whose IDs are included in the productIds array.
      },                    // in it use for arry 
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
      },
    });
    // return the products with formatting for AI it like 
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: (p.description ?? '').slice(0, 200),
      price: Number(p.price),
    }));
  } catch (error) {
    this.logger.error('Database error while loading orders', error);
    throw new InternalServerErrorException(
      'Could not load your order history.',
    );
  }
}

  private async getCandidateProducts(excludeIds: number[]): Promise<ProductForAi[]> {
    try {
      const products = await this.productRepository.find({
        where: {
          stock: MoreThan(0), // Only include products that are in stock (stock > 0).
            
          ...(excludeIds.length > 0 ? { id: Not(In(excludeIds)) } : {}),
        }, 
        select: { id: true, name: true, description: true, price: true },
        take: 30,
      });
       // An expression is code that produces a value.
       // id → the property name (key).
       // - Not(In([2, 5])) → the property's value (an expression).
       /**
        Objects — copies their properties.
        ...{ id: 5 }
        Expressions that produce objects — like your ternary:
        ...(condition ? { id: 5 } : {})
        =========================================================

        A property in JavaScript is a piece of an object made of a key (name) and a value.
        const product = {
                  id: 5,
                  name: "Laptop",
                };

        id → property name (key).
        5 → property value.
        name → property name (key).
        "Laptop" → property value.
        */

      // return the products in a format that AI can understand 
      // this products are not purchased by the user and are in stock more then 0 
      return products.map((p) => ({
        id: p.id,
        name: p.name,
        description: (p.description ?? '').slice(0, 200),
        price: Number(p.price),
      }));
    } catch (error) {
      this.logger.error('Database error while loading products', error);
      throw new InternalServerErrorException('Could not load products right now.');
    }
  }

  private async askAi(
  purchased: ProductForAi[],
  candidates: ProductForAi[],
  max: number,
): Promise<{ productId: number; reason: string }[]> {
  const systemPrompt = `You are a product recommendation engine for an online store.

Rules:
- Recommend up to ${max} products ONLY from <candidate_products>.
- Base your choices on what the customer bought before (<purchase_history>).
- NEVER invent products or IDs. Use the exact "id" values from <candidate_products>.
- Reply with JSON only, no extra text, in exactly this shape:
{"recommendations":[{"productId":123,"reason":"one short sentence"}]}`;

  const userContent =
   // purchased — products the customer bought before, so the AI can understand their interests.
    `<purchase_history>\n${JSON.stringify(purchased)}\n</purchase_history>\n\n` +
    // candidates — products the store could recommend now, so the AI chooses new products from this list.
    `<candidate_products>\n${JSON.stringify(candidates)}\n</candidate_products>`;

  try {
    const response = await this.client.responses.create({
      model: this.model,

      instructions: systemPrompt,

      input: userContent,
    });
    
    // put the response from the AI into a variable
    const text = response.output_text;
    // extract the JSON from the text, which may have extra text around it
    const parsed = this.extractJson(text);

    const list = Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
        /*
              JavaScript does this in order:
        1. parsed?.recommendations → checks whether parsed is null or undefined. If so, it returns undefined safely.
        2. Array.isArray(...) → checks whether recommendations is an array.
        3. ? parsed.recommendations : [] → if it is an array, return it; otherwise, return an empty array [].
        Important: It doesn't check whether the array is empty. An empty array [] is still an array, so it will return [].

        In short: If recommendations is an array, return it. Otherwise, return an empty array.
      */

    return list
      .filter((r: any) => Number.isInteger(r?.productId))
      .map((r: any) => ({
        productId: r.productId as number,
        reason: String(r.reason ?? '').slice(0, 300),
      }));
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    this.logger.error('AI API error in recommendations', error);

    throw new ServiceUnavailableException(
      'Recommendations are temporarily unavailable. Please try again later.',
    );
  }
}

  // The AI sometimes wraps JSON in extra text. Grab everything between { and }.
  private extractJson(text: string): any {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
