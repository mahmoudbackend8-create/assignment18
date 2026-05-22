import type { UpdateOptions } from "mongodb";
import type {
  CreateOptions,
  Model,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  Types,
  UpdateQuery,
} from "mongoose";

abstract class DBRepo<T> {
  constructor(protected Model: Model<T>) {}
  public async Create({
    data,
    options,
  }: {
    data: any;
    options?: CreateOptions;
  }) {
    return await this.Model.create(data, options);
  }
  public async UpdateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: UpdateOptions;
  }) {
    return await this.Model.updateOne(filter, update, options);
  }
  public async findOneAndUpdate({
    filter,
    update,
    options,
  }: {
    filter?: QueryFilter<T>;
    update?: UpdateQuery<T>;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findOneAndUpdate(filter, update, options);
  }
  public async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findOne(filter, projection, options);
  }
  public async Find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.find(filter, projection, options);
  }
  public async findById({
    id,
    projection,
    options,
  }: {
    id: string | Types.ObjectId;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
  }) {
    return await this.Model.findById(id, projection, options);
  }
  getDBDoc(data: T) {
    return new this.Model(data);
  }

  async Paginate({
    filter,
    projection,
    options,
    Page = 1,
    Limit = 3,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
    Page?: number;
    Limit?: number;
  }) {
    const Skip = (Page - 1) * Limit;
    const Docs = await this.Model.find({ filter, options, projection })
      .skip(Skip)
      .limit(Limit);
    const TotalDocs = await this.Model.countDocuments(filter);
    return { Docs, TotalDocs, Page, TotalPages: Math.ceil(TotalDocs / Limit) };
  }

  async saveDBDoc(){
    
  }
}
export default DBRepo;
