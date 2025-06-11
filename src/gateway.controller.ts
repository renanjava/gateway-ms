/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Body,
  Controller,
  Get,
  OnModuleInit,
  Param,
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
        allowAutoTopicCreation: true,
      },
    },
  })
  private client: ClientKafka;
  async onModuleInit() {
    const requestPatterns = ['create-book', 'find-all-book', 'find-book'];

    requestPatterns.forEach(async (pattern) => {
      this.client.subscribeToResponseOf(pattern);
    });
    await this.client.connect();
  }

  @Post('book')
  createBook(@Body() createBookDto: any): Observable<any> {
    return this.client.send('create-book', createBookDto);
  }

  @Get('book')
  findAllBooks(): Observable<any[]> {
    return this.client.send('find-all-book', {});
  }

  @Get('book/:id')
  findBook(@Param('id') id: number): Observable<any> {
    return this.client.send('find-book', id);
  }
}
