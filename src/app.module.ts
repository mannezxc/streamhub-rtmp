import { Module } from '@nestjs/common';
import { StreamModule } from './stream/stream.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [StreamModule, ConfigModule.forRoot()],
})
export class AppModule {}
