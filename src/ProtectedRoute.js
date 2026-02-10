import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

function ProtectedRoute({ user, appLoading, requiredRole, children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't do anything until the app has finished its initial session load.
    if (appLoading) {
      return;
    }

    // App is done loading, now we can perform our checks.
    if (!user) {
      // If there's no user object, authorization fails. Stop checking.
      setIsAuthorized(false);
      setIsChecking(false);
      return;
    }

    // If we have a user object, fetch their profile to check for the required role.
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        // Check if the fetched role matches the required role.
        if (error || data?.role !== requiredRole) {
          setIsAuthorized(false);
        } else {
          // If the role matches, authorization succeeds.
          setIsAuthorized(true);
        }
        // In any case, we are done checking.
        setIsChecking(false);
      });
  }, [user, appLoading, requiredRole]);

  // While we are checking, show a loading message.
  if (isChecking) {
    return <p style={{ textAlign: 'center', padding: '2rem' }}>Verifying access...</p>;
  }

  // After checking, if the user is not authorized, we redirect.
  if (!isAuthorized) {
    // If there was a user, but they had the wrong role, send them to the dashboard.
    // If there was no user at all, send them to the login page.
    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
  }

  // If all checks have passed and the user is authorized, render the protected content.
  return children;
}

export default ProtectedRoute;
