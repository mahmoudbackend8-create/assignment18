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
    async findOne({ filter, projection, options, }) {
        return await this.Model.findOne(filter, projection, options);
    }
    async findById({ id, projection, options, }) {
        return await this.Model.findById(id, projection, options);
    }
}
export default DBRepo;
