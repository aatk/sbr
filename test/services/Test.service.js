const TestModel = require("./models/Test.model");
const Extensions = require("../../../config/extensions");
const TestDto = require("../db/dtos/Test.dto");

class TestService extends Extensions {

    async get(id) {
        let result = await TestModel.get(id);
        return Object(new TestDto(result));
    }

    async post(body) {
        let data = Object(new TestDto(body));
        let result = await TestModel.new(data);
        return result;
    }

    async put(id, body) {
        let data = Object(new TestDto(body));
        let result = await TestModel.update(id, data);
        return result;
    }

    async del(id) {
        let result = await TestModel.del(id);
        return result;
    }

}

module.exports = TestService;
