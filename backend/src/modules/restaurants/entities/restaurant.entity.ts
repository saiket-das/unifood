import { ObjectType, Field } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';

@ObjectType()
export class Restaurant {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field(() => [Branch], { nullable: true })
  branches?: Branch[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
