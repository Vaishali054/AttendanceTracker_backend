
const { userLoginInputSchema, userSignupInputSchema } =
 require('../validation/user');
const UserSignupData = userSignupInputSchema.parse; // Use `.parse` to infer the type
const UserLoginData = userLoginInputSchema.parse; // Use `.parse` to infer the type

module.exports = {
  UserSignupData,
  UserLoginData
};
