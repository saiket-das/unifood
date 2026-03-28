import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { MenuResolver } from './menu.resolver';

@Module({
  controllers: [MenuController],
  providers: [MenuService, MenuResolver],
  exports: [MenuService],
})
export class MenuModule {}
