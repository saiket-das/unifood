import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
@WebSocketGateway()
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const branchId = client.handshake.query.branchId as string;

    if (userId) {
      client.join(`user:${userId}`);
    }
    if (branchId) {
      client.join(`branch:${branchId}`);
    }
    console.log(`Client connected: ${client.id}, userId: ${userId}, branchId: ${branchId}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyBranch(branchId: string, event: string, data: any) {
    this.server.to(`branch:${branchId}`).emit(event, data);
  }

  notifyStudent(studentId: string, event: string, data: any) {
    this.server.to(`user:${studentId}`).emit(event, data);
  }
}
