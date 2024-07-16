import { Module } from '@nestjs/common';
import { StreamModule } from './stream/stream.module';
import {PrismaService} from "./prisma.service";
import { SocketsModule } from './sockets/sockets.module';

@Module({
  imports: [StreamModule, SocketsModule]
})
export class AppModule {}
