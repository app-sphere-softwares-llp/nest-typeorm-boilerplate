import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import * as moment from 'moment';
import { APP_OTP_EXPIRY } from '@/shared/constants/app.constant';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

export class UtilsService {

  /**
   * convert entity to dto class instance
   * @param {{new(entity: E, options: any): T}} model
   * @param {E[] | E} entity
   * @param options
   * @returns {T[] | T}
   */
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E,
    options?: any,
  ): T;
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E[],
    options?: any,
  ): T[];
  public static toDto<T, E>(
    model: new (entity: E, options?: any) => T,
    entity: E | E[],
    options?: any,
  ): T | T[] {
    if (_.isArray(entity)) {
      return entity.map(u => new model(u, options));
    }

    return new model(entity, options);
  }

  /**
   * generate hash from password or string
   * @param {string} password
   * @returns {string}
   */
  static generateHash(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * generate random string
   * @param length
   */
  static generateRandomString(length: number): string {
    return Math.random()
      .toString(36)
      .replace(/[^a-zA-Z0-9]+/g, '')
      .substr(0, length);
  }

  /**
   * validate text with hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  static validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash || '');
  }

  /**
   * like query helper
   * @param {string} columnName
   * @param {string} keyword
   * @return {string}
   */
  static likeQueryHelper(columnName: string, keyword: string): string {
    return `${columnName} LIKE '%${keyword}%'`;
  }

  /**
   * generate utc date
   * @return date
   */
  static generateUtcDate(): Date {
    return moment.utc().toDate();
  }

  /**
   * generate random alphanumeric code up to given digit
   * @param digit
   * @returns number
   */
  static generateRandomCode = (digit = 6) => {
    return Math.floor(
      Math.pow(10, digit - 1) +
      Math.random() * (Math.pow(10, digit) - Math.pow(10, digit - 1) - 1),
    );
  };

  /**
   * check whether otp expired or not
   * @param date
   * @return boolean
   */
  static isOTPExpired = (date: Date): boolean => {
    return moment
      .utc(date)
      .add(APP_OTP_EXPIRY, 's')
      .isBefore(moment.utc());
  };

  /**
   * generates a unique guid
   * @example
   * generateGuid()
   * @returns {string}
   */
  static generateGuid = (): string => {
    return uuidv4();
  };

  /**
   * get extension name from filename
   * @example
   * getExtensionNameFromFileName('file.mp4')
   * @param {string} fileName
   * @returns {string}
   */
  static getExtensionNameFromFileName = (fileName: string): string => {
    return fileName.substr(fileName.lastIndexOf('.') + 1);
  };

  /**
   * generate fileName
   * generates a new file name from given original file name
   * @param {string} originalFileName
   * @returns {string}
   */
  static generateFileName = (originalFileName: string): string => {
    return `${UtilsService.generateGuid()}.${UtilsService.getExtensionNameFromFileName(originalFileName)}`;
  };

  /**
   * get File cdn url from Azure storage url
   */
  static getFileCdnUrl = (fileUrl: string, azureCdnUrl: string, azureContainer: string): string => {
    const fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
    return `${azureCdnUrl}${azureContainer}/${fileName}`;
  };

  /**
   * Convert a buffer to a stream
   *
   * @param buffer Buffer
   * @returns Readable
   */
  static bufferToStream = (buffer)  => {
    return new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      }
    });
  }
}
