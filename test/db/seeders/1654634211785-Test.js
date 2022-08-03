'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        // 0 - 00000000-0000-0000-0000-000000000000
        await queryInterface.bulkInsert('Test', [
            // {
            //     id: '00000000-0000-0000-0000-000000000000', // 2
            //     markdel: 0,
            //
            //     //INSERT YOU FIELDS HERE
            //
            //     createdUser: '00000000-0000-0000-0000-000000000000',
            //     updatedUser: '00000000-0000-0000-0000-000000000000',
            // }
            ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Test', null, {});
    }
};
