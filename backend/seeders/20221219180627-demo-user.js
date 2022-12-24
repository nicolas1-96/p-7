'use strict';

/** @type {import('sequelize-cli').Migration} */
    module.exports = {
      up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [{
          firstName: 'John',
          name: 'Doe',
          email: 'test@test.com',
          password:  "Niko1234",
          isAdmin: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      },
      down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('Users', null, {});
      }
    };
