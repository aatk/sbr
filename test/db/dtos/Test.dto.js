class TestDto {
    constructor(data) {
        if (data && typeof data === 'object') {
            if (typeof data.id !== 'undefined') {
                this.id = data.id;
            }
            if (typeof data.code !== 'undefined') {
                this.code = data.code;
            }
        }
    }

}

module.exports = TestDto
