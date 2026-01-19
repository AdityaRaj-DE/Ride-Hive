const userModel = require("../models/user");

module.exports.findOrCreateUserByMobile = async ({ mobileNumber }) => {
  let user = await userModel.findOne({ mobileNumber });

  if (!user) {
    user = await userModel.create({
      mobileNumber,
      isVerified: false,
      roles: { rider: true, driver: false },
      activeRole: "rider",
      onboarding: { rider: false, driver: false },
    });    
  }

  return user;
};
