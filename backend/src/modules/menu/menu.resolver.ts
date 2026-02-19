import { Resolver, Query, Args } from '@nestjs/graphql';
import { MenuItemType } from './models/menu-item.model';
import { MenuService } from './menu.service';

@Resolver(() => MenuItemType)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  private toMenuItemType(item: any): MenuItemType {
    return {
      ...item,
      price: item.price ? Number(item.price) : undefined,
      unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
    };
  }

  @Query(() => [MenuItemType], { name: 'searchFoods', description: 'Search menu items by name' })
  async searchFoods(
    @Args('query', { type: () => String }) query: string,
  ): Promise<MenuItemType[]> {
    const items = await this.menuService.searchMenuItems(query);
    return items.map(this.toMenuItemType);
  }

  @Query(() => [MenuItemType], { name: 'menuItems', description: 'Get all menu items for a restaurant' })
  async menuItems(
    @Args('restaurantId', { type: () => String }) restaurantId: string,
  ): Promise<MenuItemType[]> {
    const items = await this.menuService.getMenuItemsByRestaurant(restaurantId);
    return items.map(this.toMenuItemType);
  }
}
