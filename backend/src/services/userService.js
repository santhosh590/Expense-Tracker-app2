import User from '../models/User.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (user) {
    return user;
  } else {
    throw new Error('User not found');
  }
};

export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);

  if (user) {
    user.name = data.name || user.name;
    user.email = data.email || user.email;
    if (data.password) {
      user.password = data.password;
    }

    const updatedUser = await user.save();
    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  } else {
    throw new Error('User not found');
  }
};
