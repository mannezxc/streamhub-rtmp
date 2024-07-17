import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [StreamService, PrismaService],
  controllers: [StreamController],
})
export class StreamModule {}
