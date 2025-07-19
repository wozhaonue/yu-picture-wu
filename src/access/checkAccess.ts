import ACCESS_ENUM from "./accessEnum";
/**
 * 检查权限（判断当前登录用户是否具有某种权限）
 *@param loginUser 当前登录用户
 *@param needAccess 需要的权限
 *@returns boolean 是否具有某种权限
 */

 const checkAccess = (loginUser:any,needAccess = ACCESS_ENUM.NOT_LOGIN) => {
   // 获取当前登录用户的权限（如果没有登录，则默认为未登录）
   const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN;
   // 如果需要的权限为未登录
   if(needAccess === ACCESS_ENUM.NOT_LOGIN){
     return true;
   }
   // 如果需要的权限为用户
   if(needAccess === ACCESS_ENUM.USER){
     return loginUserAccess !== ACCESS_ENUM.NOT_LOGIN;
   }
   // 如果需要的权限为管理员
   if(needAccess === ACCESS_ENUM.ADMIN){
     return loginUserAccess === ACCESS_ENUM.ADMIN;
   }
   return true;
 }

 export default checkAccess;
