import { Global, Module } from '@nestjs/common';
import { WebSocketsServer } from './sockets.events';

@Global()
@Module({
  providers: [WebSocketsServer],
  exports: [WebSocketsServer],
})
export class SocketsModule {}
