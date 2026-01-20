import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Reservation = sequelize.define("Reservation", {
  room_id: { type: DataTypes.INTEGER, allowNull: false },
  room_name: { type: DataTypes.STRING },

  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },

  checkin: { type: DataTypes.DATEONLY, allowNull: false },
  checkout: { type: DataTypes.DATEONLY, allowNull: false },

  nights: { type: DataTypes.INTEGER }, // 🔥 utile admin
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // 🔥 TOTAL À PAYER

  payment_status: {
    type: DataTypes.STRING,
    defaultValue: "unpaid", // unpaid | partial | paid
  },

  advance_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },

  message: { type: DataTypes.TEXT },

  status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending | confirmed | cancelled
  },
});

export default Reservation;
