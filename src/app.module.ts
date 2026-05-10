import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { DailyMenusModule } from './daily-menus/daily-menus.module';
import { AppController } from './app.controller';
import { NotificationsModule } from './notifications/notifications.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { PublicModule } from './public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuItemsModule,
    TablesModule,
    OrdersModule,
    DashboardModule,
    CloudinaryModule,
    UploadModule,
    DailyMenusModule,
    NotificationsModule,
    AnnouncementsModule,
    PublicModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
