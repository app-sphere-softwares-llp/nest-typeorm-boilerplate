import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { SnakeNamingStrategy } from '@/snake-naming.strategy';
import { UserSubscriber } from '@/shared/entity-subscribers/user-subscriber';
import { MailerOptions } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

export class ConfigService {
  constructor() {
    const nodeEnv = this.nodeEnv;

    dotenv.config({
      path: `.${nodeEnv}.env`,
    });

    // Replace \\n with \n to support multiline strings in AWS
    for (const envName of Object.keys(process.env)) {
      process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
    }
  }

  /**
   * check if environment is development
   * @return {boolean}
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === 'dev';
  }

  /**
   * check if environment is production
   * @return {boolean}
   */
  get isProduction(): boolean {
    return this.nodeEnv === 'prod';
  }

  public get(key: string): string {
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  /**
   * get running node env
   * @return {string}
   */
  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'dev';
  }

  /**
   * get fallback language for i18n
   * @return {string}
   */
  get fallbackLanguage(): string {
    return this.get('FALLBACK_LANGUAGE').toLowerCase();
  }

  /**
   * get typeorm config
   * @return {TypeOrmModuleOptions}
   */
  get typeOrmConfig(): TypeOrmModuleOptions {
    let entities = [__dirname + '/../../modules/**/*.entity{.ts,.js}'];
    let migrations = [__dirname + '/../../migrations/*{.ts,.js}'];

    if ((module as any).hot) {
      const entityContext = (require as any).context(
        './../../modules',
        true,
        /\.entity\.ts$/,
      );
      entities = entityContext.keys().map((id) => {
        const entityModule = entityContext(id);
        const [entity] = Object.values(entityModule);
        return entity;
      });
      const migrationContext = (require as any).context(
        './../../migrations',
        false,
        /\.ts$/,
      );
      migrations = migrationContext.keys().map((id) => {
        const migrationModule = migrationContext(id);
        const [migration] = Object.values(migrationModule);
        return migration;
      });
    }
    return {
      entities,
      migrations,
      keepConnectionAlive: true,
      type: 'mysql',
      host: this.get('DB_HOST'),
      port: this.getNumber('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_DATABASE'),
      subscribers: [UserSubscriber],
      migrationsRun: true,
      logging: this.isDevelopment,
      namingStrategy: new SnakeNamingStrategy(),
      // maxQueryExecutionTime:
    };
  }

  /**
   * get nest mailer config
   * @return {MailerOptions}
   */
  get nestMailerConfig(): MailerOptions {
    return {
      defaults: {
        from: this.get('EMAIL_FROM'),
      },
      template: {
        dir: path.join(__dirname, '..', '..', 'email-templates'),
        adapter: new EjsAdapter(),
        options: {
          strict: true,
        },
      },
      transport: {
        host: this.get('EMAIL_HOST'),
        port: this.get('EMAIL_PORT'),
        secure: true, // upgrade later with STARTTLS
        auth: {
          user: this.get('EMAIL_USERNAME'),
          pass: this.get('EMAIL_PASSWORD'),
        },
      },
    };
  }

  /**
   * get azure storage url
   * @returns {string}
   */
  get azureStorageUrl(): string {
    return this.get('AZURE_STORAGE_URL');
  }

  /**
   * get azure cdn url
   * @returns {string}
   */
  get azureCdnUrl(): string {
    return this.get('AZURE_CDN_URL');
  }

  /**
   * get azure cdn url
   * @returns {string}
   */
  get azureContainerName(): string {
    return this.get('AZURE_STORAGE_CONTAINER');
  }
}
