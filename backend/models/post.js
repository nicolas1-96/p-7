'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.post.belongsTo(models.user, {
        onDelete: 'cascade',
        hooks: true,
        foreignKey: {
          allowNull: false
        }
      }),
      models.post.hasMany(models.comment)
    }
      
  };
  post.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'post',
  });
  return post;
};