const TestServiceClass = require('../services/Test.service');
const TestService = new TestServiceClass()

class TestController {

    static async get(req, res, next) {
        try {
            const {id} = req.params;
            let result = await TestService.get(id);
            res.json(result);
        } catch (e) {
            next(e)
        }
    }

    static async post(req, res, next) {
        try {
            const body = req.body;
            let result = await TestService.post(body);
            res.json(result);
        } catch (e) {
            next(e)
        }
    }

    static async put(req, res, next) {
        try {
            const {id} = req.params;
            const body = req.body;
            let result = await TestService.put(id, body);
            res.json(result);
        } catch (e) {
            next(e)
        }
    }

    static async del(req, res, next) {
        try {
            const {id} = req.params;
            let result = await TestService.del(id);
            res.json(result);
        } catch (e) {
            next(e)
        }
    }

}

module.exports = TestController;
