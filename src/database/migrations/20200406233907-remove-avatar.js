module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('deliveryman', 'avatar_id');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliveryman', 'avatar_id', {
      type: Sequelize.STRING,
    });
  },
};
