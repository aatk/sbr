const {getDotEnv, envToObject} = require("./gl/services");
const $api = require("./gl/api");


class checkPackages {
    
    dotENVParams = undefined;
    
    constructor() {
        let dotENVContent = getDotEnv();
        this.dotENVParams = envToObject(dotENVContent);
    }
    
    checkPackage = async (packageName) => {
        let result = true;
        let headers = {}
        if (this.dotENVParams.HEADERS) headers = JSON.parse(this.dotENVParams.HEADERS);
        let url = `${this.dotENVParams.STORE}/appstore/check/${packageName}`;
        try {
            await $api.get(url, {headers: headers});
        }
        catch (e) {
            result = false;
            console.error("Данного пакета не существует ", packageName);
        }
        
        return result;
    }
    
    main = async (args) => {
        let packageName = args[1];
        await this.checkPackage(packageName);
    }
    
}



module.exports = checkPackages;
