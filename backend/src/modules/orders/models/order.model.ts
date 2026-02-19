import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { MenuItemType } from '../../menu/models/menu-item.model';

registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class OrderStudentType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;
}

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  subtotal: number;

  @Field(() => MenuItemType, { nullable: true })
  menuItem?: MenuItemType;

  @Field()
  isMeasured: boolean;

  @Field(() => Float, { nullable: true })
  finalQuantity?: number;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalPrice: number;

  @Field(() => PaymentMethod)
  paymentMethod: PaymentMethod;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field(() => [OrderItemType], { nullable: true })
  items?: OrderItemType[];

  @Field(() => OrderStudentType, { nullable: true })
  student?: OrderStudentType;

  @Field()
  branchId: string;

  @Field()
  createdAt: Date;
}
