class DBRepo {
    Model;
    constructor(Model) {
        this.Model = Model;
    }
    async Create({ data, options, }) {
        return await this.Model.create(data, options);
    }
    async UpdateOne({ filter, update, options, }) {
        return await this.Model.updateOne(filter, update, options);
    }
    async findOneAndUpdate({ filter, update, options, }) {
        return await this.Model.findOneAndUpdate(filter, update, options);
    }
    async findOne({ filter, projection, options, }) {
        return await this.Model.findOne(filter, projection, options);
    }
    async Find({ filter, projection, options, }) {
        return await this.Model.find(filter, projection, options);
    }
    async findById({ id, projection, options, }) {
        return await this.Model.findById(id, projection, options);
    }
    getDBDoc(data) {
        return new this.Model(data);
    }
    async Paginate({ filter, projection, options, Page = 1, Limit = 3, }) {
        const Skip = (Page - 1) * Limit;
        const Docs = await this.Model.find({ filter, options, projection })
            .skip(Skip)
            .limit(Limit);
        const TotalDocs = await this.Model.countDocuments(filter);
        return { Docs, TotalDocs, Page, TotalPages: Math.ceil(TotalDocs / Limit) };
    }
}
export default DBRepo;
