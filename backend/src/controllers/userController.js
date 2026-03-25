import asyncHandler from 'express-async-handler';
import { getUserProfile as getProfileService, updateUserProfile as updateProfileService } from '../services/userService.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userProfile = await getProfileService(req.user._id);
    res.json(userProfile);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await updateProfileService(req.user._id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});
