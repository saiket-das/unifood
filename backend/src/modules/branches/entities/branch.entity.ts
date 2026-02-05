import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Branch {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field(() => [String])
  hostelTags: string[];

  @Field()
  restaurantId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
