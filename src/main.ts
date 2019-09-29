// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZeebeServer } from '@payk/nestjs-zeebe';
import { WINSTON_MODULE_NEST_PROVIDER } from '@payk/nestjs-winston';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const microservice = app.connectMicroservice({
        strategy: app.get(ZeebeServer),
    });
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    await app.startAllMicroservicesAsync();

    await app.listen(3000);
}
bootstrap();
