import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ZeebeModule, ZeebeServer } from '@payk/nestjs-zeebe';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppService } from './app.service';

@Module({
    imports: [
        ZeebeModule.forRoot({ options: { longPoll: 30000 } }),
        WinstonModule.forRoot({
            transports: [new winston.transports.Console()],
        }),
        AppService,
    ],
    controllers: [AppController],
    providers: [ZeebeServer, AppService],
})
export class AppModule {}
