import { PartialType } from '@nestjs/swagger';
import { CreateDailyMenuDto } from './create-daily-menu.dto';

export class UpdateDailyMenuDto extends PartialType(CreateDailyMenuDto) {}
