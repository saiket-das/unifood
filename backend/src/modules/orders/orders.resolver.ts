import { Resolver, Query, Args } from '@nestjs/graphql';
import { OrderType } from './models/order.model';
import { OrdersService } from './orders.service';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderType], { name: 'ordersByBranch', description: 'Get all orders for a branch' })
  async ordersByBranch(
    @Args('userId', { type: () => String }) userId: string,
    @Args('role', { type: () => String }) role: string,
    @Args('branchId', { type: () => String }) branchId: string,
  ): Promise<OrderType[]> {
    const orders = await this.ordersService.getOrdersByBranch(userId, role, branchId);
    return orders.map((o) => ({
      ...o,
      totalPrice: Number(o.totalPrice),
      items: o.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        menuItem: item.menuItem
          ? {
              ...item.menuItem,
              price: item.menuItem.price ? Number(item.menuItem.price) : undefined,
              unitPrice: item.menuItem.unitPrice ? Number(item.menuItem.unitPrice) : undefined,
            }
          : undefined,
      })),
    }));
  }
}
