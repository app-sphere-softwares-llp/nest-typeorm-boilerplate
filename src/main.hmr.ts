import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

import { AppModule } from '@/app.module';
import { ConfigService } from '@/shared/services/config.service';
import { SharedModule } from '@/shared/shared.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare const module: any;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.use(helmet());
  app.use(morgan('combined'));

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const configService = app.select(SharedModule).get(ConfigService);

  if (['dev'].includes(configService.nodeEnv)) {
    const options = new DocumentBuilder()
      .setTitle('API')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('documentation', app, document);
  }

  const port = configService.getNumber('PORT');
  await app.listen(port);

  console.info(`server running on port ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
