import { Global, HttpModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@/shared/services/config.service';

require('winston-daily-rotate-file');

const providers = [
  ConfigService,
];

@Global()
@Module({
  providers,
  imports: [
    HttpModule.register({
      timeout: 0
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secretOrPrivateKey: configService.get('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [...providers, HttpModule, JwtModule],
})
export class SharedModule {
}
