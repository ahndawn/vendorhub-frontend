import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Adjust the path as necessary

const useUserAuth = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated;
};

export default useUserAuth;