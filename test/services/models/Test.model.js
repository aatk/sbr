const {Sequelize, Test} = require('../../../../db/models');
const TestDto = require('../../db/dtos/Test.Dto');
const ApiError = require('../../../../exceptions/ApiError');

class TestModel {

    static async get(id) {
        return Test.findOne({where: {id: id}})
    }

    static async new(body) {
        const result = await Test.create(body)
        return result;
    }

    static async update(id, data) {
        await Test.update(data, {where: {id}})
        return {"result": true};
    }

    static async del(id) {
        await Test.destroy({where: {id}})
        return {"result": true};
    }
}

module.exports = TestModel;
