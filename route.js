let {
  basic,
  signup,
  emailVerify,
  otpPut,
  login,
  signupSeller,
  loginSeller,
  getAllUsers,
  getAllSeller,
  adminLogIn,
  deleteOneUser,
  deleteOneSeller,
  updateUserPassword,
  updateSellerPassword,
} = require("./controller/controller");

const AppRoutes = [
  {
    path: "/",
    method: "get",
    action: basic,
  },
  {
    path: "/user/signup",
    method: "post",
    action: signup,
  },
  {
    path: "/user/emailVerify",
    method: "post",
    action: emailVerify,
  },
  {
    path: "/user/otpPut",
    method: "post",
    action: otpPut,
  },
  {
    path: "/user/login",
    method: "post",
    action: login,
  },
  {
    path: "/seller/login",
    method: "post",
    action: loginSeller,
  },
  {
    path: "/admin/login",
    method: "post",
    action: adminLogIn,
  },
  {
    path: "/seller/signup",
    method: "post",
    action: signupSeller,
  },
  {
    path: "/seller/emailVerify",
    method: "post",
    action: emailVerify,
  },
  {
    path: "/sellers",
    method: "get",
    action: getAllSeller,
  },
  {
    path: "/users",
    method: "get",
    action: getAllUsers,
  },
  {
    path: "/user/delete",
    method: "delete",
    action: deleteOneUser,
  },
  {
    path: "/seller/delete",
    method: "delete",
    action: deleteOneSeller,
  },
  {
    path: "/user/changePassword",
    method: "patch",
    action: updateUserPassword,
  },
  {
    path: "/seller/changePassword",
    method: "patch",
    action: updateSellerPassword,
  },
];

module.exports = { AppRoutes };
