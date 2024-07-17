import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class WebSocketsServer
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private socketServer: Server;

  handleConnection(client: Socket): any {
    console.log(client.id, 'connected');
  }

  handleDisconnect(client: any): any {
    console.log(client.id, 'disconnected');
  }

  sendStreamStarted(startedTime: number) {
    this.socketServer.emit('stream-started', {
      message: 'Stream started',
      startedAt: startedTime,
    });
  }

  sendStreamHasEnded() {
    this.socketServer.emit('stream-has-ended', { message: 'Stream was ended' });
  }
}
