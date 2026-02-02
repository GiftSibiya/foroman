import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SessionUser } from "../types/Types";
import { jwtDecode } from "jwt-decode";
import useAuthStore from "../stores/data/AuthStore";

type FetchFunction = (sessionUser: SessionUser) => void;

// Helper function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  const decoded: { exp: number } = jwtDecode(token);
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

export const useFetchData = (fetchFunction: FetchFunction) => {
  const { sessionUser } = useAuthStore();
  const navigate = useNavigate();
  const fetchFunctionRef = useRef(fetchFunction);
  const lastFetchedUserIdRef = useRef<string | number | null>(null);

  // Update ref when function changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    if (sessionUser) {
      if (isTokenExpired(sessionUser.accessToken)) {
        console.error("Session token is expired");
        navigate("/"); // Redirect to login page
        lastFetchedUserIdRef.current = null; // Reset on token expiry
      } else {
        // Only fetch if we haven't fetched for this user yet
        const currentUserId = sessionUser.id;
        // Convert to string for consistent comparison
        const currentUserIdString = String(currentUserId);
        if (lastFetchedUserIdRef.current !== currentUserIdString) {
          fetchFunctionRef.current(sessionUser);
          lastFetchedUserIdRef.current = currentUserIdString;
        }
      }
    } else {
      navigate("/");
      console.error("No session user found");
      lastFetchedUserIdRef.current = null; // Reset when no session
    }
  }, [sessionUser, navigate]);
};
