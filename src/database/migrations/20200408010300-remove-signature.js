module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('delivery', 'signature_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('delivery', 'signature_id', {
      type: Sequelize.STRING,
    });
  },
};
