import { Module } from '@nestjs/common';
import { StreamModule } from './stream/stream.module';
import {PrismaService} from "./prisma.service";
import { ConfigModule } from "@nestjs/config";
import { SocketsModule } from './sockets/sockets.module';

@Module({
  imports: [StreamModule, SocketsModule, ConfigModule.forRoot()]
})
export class AppModule {}
