import mongoose from "mongoose";

const accountSchema = mongoose.Schema({
  agencia: {
    type: Number,
    required: true,
  },
  conta: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    min: 0,
    required: true,
  },
});

const accountModel = mongoose.model("account", accountSchema);

export { accountModel };
