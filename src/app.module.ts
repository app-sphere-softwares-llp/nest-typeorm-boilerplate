import './boilerplate.polyfill';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import * as path from 'path';

import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { ConfigService } from '@/shared/services/config.service';
import { SharedModule } from '@/shared/shared.module';
import { APP_FILTER } from '@nestjs/core';
import { GenericExceptionFilter } from '@/shared/filters/generic-exception.filter';
import { MailerModule } from '@nestjs-modules/mailer';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { BookModule } from '@/modules/book/book.module';
import { OtpModule } from '@/modules/otp/otp.module';

@Module({
  imports: [
    AuthModule,
    OtpModule,
    UserModule,
    BookModule,
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ConfigService) => configService.typeOrmConfig,
      inject: [ConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.fallbackLanguage,
        parserOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: configService.isDevelopment,
        },
      }),
      imports: [SharedModule],
      parser: I18nJsonParser,
      inject: [ConfigService],
    }),
    // MailerModule.forRootAsync({
    //   useFactory: (configService: ConfigService) =>
    //     configService.nestMailerConfig,
    //   imports: [SharedModule],
    //   inject: [ConfigService],
    // }),
    WinstonModule.forRoot({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'DD-MMM-YYYY hh:mm:ss a',
        }),
        winston.format.prettyPrint(),
        winston.format.align(),
        winston.format.errors({ stack: true }),
      ),
      transports: [
        // new (winston.transports as any).DailyRotateFile({
        //   filename: 'error-%DATE%.log',
        //   datePattern: 'DD-MM-YYYY-hh-MM',
        //   maxFiles: '10d',
        //   zippedArchive: true
        // }),
        new winston.transports.File({
          tailable: true,
          maxFiles: 2,
          filename: './error.log',
        }),
      ],
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GenericExceptionFilter,
    },
  ],
})
export class AppModule {
}
