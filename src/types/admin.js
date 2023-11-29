
const { adminLoginInputSchema, adminSignupInputSchema } =
 require('../validation/admin');
const AdminSignupData = adminSignupInputSchema.parse; // Use `.parse` to infer the type
const AdminLoginData = adminLoginInputSchema.parse; // Use `.parse` to infer the type

module.exports = {
  AdminSignupData,
  AdminLoginData
};
