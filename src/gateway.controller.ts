/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Body,
  Controller,
  Delete,
  Get,
  OnModuleInit,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Controller('gateway')
export class GatewayController implements OnModuleInit {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'gateway',
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'gateway-consumer',
      },
    },
  })
  private client: ClientKafka;
  async onModuleInit() {
    const requestPatterns = [
      'create-book',
      'find-all-book',
      'find-book',
      'update-book',
      'delete-book',
      'update-book-status',
    ];

    requestPatterns.forEach(async (pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
    await this.client.connect();
  }

  @Post('book')
  createBook(@Body() body: any): Observable<any> {
    return this.client.send('create-book', { body });
  }

  @Get('book')
  findAllBooks(): Observable<any[]> {
    return this.client.send('find-all-book', {});
  }

  @Get('book/:id')
  findBook(@Param('id') id: string): Observable<any[]> {
    return this.client.send('find-book', { id });
  }

  @Patch('book/:id')
  updateBook(@Param('id') id: string, @Body() body: any): Observable<any> {
    return this.client.send('update-book', { id, body });
  }

  @Patch('book/:id/status')
  updateBookStatus(@Param('id') id: string): Observable<any> {
    return this.client.send('update-book-status', { id });
  }

  @Delete('book/:id')
  deleteBook(@Param('id') id: string): Observable<any> {
    return this.client.send('delete-book', { id });
  }
}
