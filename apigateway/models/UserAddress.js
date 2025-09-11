import mongoose from 'mongoose';

const UserAddressSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier', // placeholder if you add suppliers later
  },
  country: {
    type: String,
    required: true, 
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  label: {
    type: String,
    trim: true
  },
  zipcode: {
    type: String,
    trim: true
  },
  town: {
    type: String,
    trim: true
  },
  laneNo: {
    type: String,
    trim: true
  },
  buildingNo: {
    type: String,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  roomNo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual field to alias `_id` as `addressID`
UserAddressSchema.virtual('addressID').get(function () {
  return this._id.toHexString();
});

UserAddressSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

const UserAddress = mongoose.model('UserAddress', UserAddressSchema);

export default UserAddress;
