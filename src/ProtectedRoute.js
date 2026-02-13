import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

const ACCESS_VERIFY_STYLE = { textAlign: 'center', padding: '2rem' };

function ProtectedRoute({ user, appLoading, profile, profileComplete, requiredRole, children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setAuthorization = (authorized) => {
      if (!isMounted) return;
      setIsAuthorized(authorized);
      setIsChecking(false);
    };

    const verifyAccess = async () => {
      if (appLoading) {
        return;
      }

      if (!user) {
        setAuthorization(false);
        return;
      }

      if (profileComplete === false) {
        setAuthorization(false);
        return;
      }

      if (profile?.role) {
        setAuthorization(profile.role === requiredRole);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setAuthorization(!error && data?.role === requiredRole);
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [user, appLoading, profile, profileComplete, requiredRole]);

  if (appLoading || isChecking) {
    return <p style={ACCESS_VERIFY_STYLE}>Verifying access...</p>;
  }

  if (!isAuthorized) {
    if (user && profileComplete === false) {
      return <Navigate to="/complete-profile" replace />;
    }

    return <Navigate to={user ? "/dashboard" : "/login"} replace />;
  }

  return children;
}

export default ProtectedRoute;
