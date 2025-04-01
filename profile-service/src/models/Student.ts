import { DataTypes, Model, Sequelize } from 'sequelize';
import sequelize from '../config/database';

interface StudentAttributes {
  id: string;
  name: string;
  email: string;
}

interface StudentCreationAttributes extends Omit<StudentAttributes, 'id'> {}

class Student extends Model<StudentAttributes, StudentCreationAttributes> {
  public id!: string;
  public name!: string;
  public email!: string;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    }
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: false
  }
);

export default Student; 