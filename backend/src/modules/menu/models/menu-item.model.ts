import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class MenuItemType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  pricingModel: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field({ nullable: true })
  unitType?: string;

  @Field(() => Float, { nullable: true })
  unitSize?: number;

  @Field(() => [CategoryType], { nullable: true })
  categories?: CategoryType[];

  @Field()
  restaurantId: string;

  @Field()
  createdAt: Date;
}
