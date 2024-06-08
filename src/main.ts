import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  const port = 3000;
  await app.listen(port);
  console.log('Hi There! App is running on port', port);
}
bootstrap();
