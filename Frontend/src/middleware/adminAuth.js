export const adminAuth = (to, from, next) => {
  const employee = JSON.parse(localStorage.getItem('employee'));
  
  if (!employee) {
    next({ name: 'AdminLogin' });
  } else {
    next();
  }
};
