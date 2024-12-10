import Cookies from "js-cookie";
import { useEffect, useState } from "react";

// Authentication Hook
const useUserAuth = () => {
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    const getUserFromCookie = () => {
      try {
        const userCookie = Cookies.get("user");
        if (userCookie) {
          const cleanedUserCookie = userCookie.startsWith("j:")
            ? userCookie.slice(2)
            : userCookie;
          const user = JSON.parse(cleanedUserCookie);
          return user._id;
        }
      } catch (error) {
        console.error("Invalid user cookie:", error);
      }
      return undefined;
    };

    setUserId(getUserFromCookie());
  }, []);

  return { userId };
};

export default useUserAuth;
