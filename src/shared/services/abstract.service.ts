import { EntityManager, FindConditions, getConnection, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';
import { PageOptionsDto } from '@/shared/dto/PageOptionsDto';
import { PageMetaDto } from '@/shared/dto/PageMetaDto';
import { FindOneOptions } from 'typeorm';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';

export class AbstractService<TRepository extends Repository<Entity>, Entity> {
  constructor(protected readonly repository: TRepository) {
  }

  /**
   * find record by id
   * @param {number | string} id
   * @param {FindOneOptions<Entity>} options
   * @return {any}
   */
  findById(id: number | string, options?: FindOneOptions<Entity>) {
    if (options) {
      return this.repository.findOne(id, options);
    } else {
      return this.repository.findOne(id);
    }
  }

  /**
   * find record or create a record
   * @param {<Entity>} criteria
   * @param {Partial<Entity>} record
   * @return {Promise<[Entity, boolean]>}
   */
  async findOrCreate(
    criteria: FindConditions<Entity>,
    record: Partial<Entity>,
  ): Promise<[Entity, boolean]> {
    const existing = await this.repository.findOne(criteria);
    if (existing) {
      return [existing, false];
    }

    const newEntry = await this.createRecord(record);
    return [newEntry, true];
  }

  findOne(options?: FindOneOptions<Entity> | FindConditions<Entity>): Promise<Entity> {
    return this.repository.findOne(options);
  }

  find(options?: FindManyOptions<Entity> | FindConditions<Entity>): Promise<Entity[]> {
    return this.repository.find(options);
  }

  /**
   * get all paginated data
   * @param {<Entity>} queryBuilder
   * @param {PageOptionsDto} pageOptionsDto
   * @return {Promise<{pageMetaDto: PageMetaDto, items: any[]}>}
   */
  async getAllPaginated(queryBuilder: SelectQueryBuilder<Entity>, pageOptionsDto: PageOptionsDto) {
    const [items, itemsCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: itemsCount,
    });

    return { items, pageMetaDto };
  }

  /**
   * create new record
   * @param {Partial<Entity>} record
   * @return {any}
   */
  createRecord(record: Partial<Entity>) {
    const doc = this.repository.create(record as Entity);
    return this.repository.save(doc);
  }

  /**
   * create multiple records
   * @param {Partial<Entity[]>} records
   * @return {any}
   */
  createMultipleRecords(records: Partial<Entity[]>) {
    const docs = this.repository.create(records as Entity[]);
    return this.repository.save(docs);
  }

  /**
   * update record by id
   * @param {number | string} id
   * @param {Partial<Entity>} record
   * @return {any}
   */
  updateById(id: number | string, record: Partial<Entity>): Promise<UpdateResult> {
    return this.repository.update(id, record as Entity);
  }

  /**
   * update multiple records
   * @param {<Entity>} criteria
   * @param {Partial<Entity>} record
   * @return {any}
   */
  updateMultiple(criteria: FindConditions<Entity>, record: Partial<Entity>) {
    return this.repository.update(criteria, record as Entity);
  }

  /**
   * delete record by id
   * it performs soft delete
   * @param {number | string} id
   * @return {any}
   */
  deleteById(id: number | string) {
    return this.repository.softDelete(id);
  }

  /**
   * delete multiple records
   * @param {<Entity>} criteria
   * @return {any}
   */
  delete(criteria: FindConditions<Entity>) {
    return this.repository.softDelete(criteria);
  }

  /**
   * restores deleted record
   * @return {any}
   * @param id
   */
  restoreById(id: number | string) {
    return this.repository.restore(id);
  }

  /**
   * restores deleted record
   * @param {<Entity>} criteria
   * @return {any}
   */
  restore(criteria: FindConditions<Entity>) {
    return this.repository.softDelete(criteria);
  }

  /**
   * call a stored procedure
   * @param {string} spName
   * @param {any[]} parameters
   * @example
   * callSp('insertSp', [5, 'Test', 2])
   * @return {Promise<any>}
   */
  async callSp(spName: string, parameters: any[]) {
    let paramsMapStr = '';
    parameters.forEach((param, index) => {
      paramsMapStr += (typeof param === 'string') ? '\'' + param + '\'' : param;

      if (index !== parameters.length - 1) {
        paramsMapStr += ',';
      }
    });
    return await this.repository.query(`CALL ${spName}(${paramsMapStr})`);
  }

  /**
   * get repository
   * @return {TRepository}
   */
  getRepo() {
    return this.repository;
  }

  /**
   * create query builder
   * creates a query builder instance and returns it
   * @param {string} alias
   * @return {any}
   */
  createQueryBuilder(alias = '') {
    return this.repository.createQueryBuilder(alias);
  }

  /**
   * with transaction wrapper
   * wraps a function in transaction
   * @param {Function} txnFn
   * @return {Promise<any>}
   */
  async withTransaction(txnFn: Function) {
    return getConnection().transaction(async (transactionalEntityManager: EntityManager) => {
      try {
        return await txnFn(transactionalEntityManager);
      } catch (e) {
        throw e;
      }
    });
  }

}
