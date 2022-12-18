'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.comment.belongsTo(models.user, {
        onDelete: 'cascade',
        hooks: true,
        foreignKey: {
          allowNull: false
        }
      }),
      models.comment.belongsTo(models.post, {
        onDelete: 'cascade',
        hooks: true,
        foreignKey: {
          allowNull: false
        }
      })
     
    }
  };
  comment.init({
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'comment',
  });
  return comment;
};