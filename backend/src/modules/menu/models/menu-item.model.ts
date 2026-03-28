import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class MenuItemVariantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  unitType: string;

  @Field(() => Float, { nullable: true })
  unitValue?: number;

  @Field({ nullable: true })
  unitLabel?: string;

  @Field(() => Float)
  price: number;

  @Field()
  isAvailable: boolean;

  @Field()
  createdAt: Date;
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
  photo?: string;

  @Field()
  isActive: boolean;

  @Field()
  isVeg: boolean;

  @Field()
  isSpicy: boolean;

  @Field(() => Int, { nullable: true })
  preparationTime?: number;

  @Field(() => [CategoryType], { nullable: true })
  categories?: CategoryType[];

  @Field(() => [MenuItemVariantType], { nullable: true })
  variants?: MenuItemVariantType[];

  @Field()
  restaurantId: string;

  @Field()
  createdAt: Date;
}
