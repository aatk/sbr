const DB = require('../../../../db/rls/DB')

module.exports = (sequelize, DataTypes) => {
    class Test extends DB {

        static associate(models) {
            //
        }

        static RLSRule() {
            let options = {}
            return options;
        }
    }

    Test.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        code: DataTypes.INTEGER,
        markdel: DataTypes.INTEGER,

        //INSERT YOU FIELDS HERE

        updatedAt: DataTypes.DATE,
        createdAt: DataTypes.DATE,
        createdUser: DataTypes.UUID,
        updatedUser: DataTypes.UUID,
    }, {
        sequelize,
        modelName: 'Test',
        schema: process.env.DB_SCHEMA,
        freezeTableName: true
    });
    return Test;
};
