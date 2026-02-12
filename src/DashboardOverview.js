import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardOverview.css';

function DashboardOverview({ user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <>
      {/* Main content area is now empty as per user request */}
    </>
  );
}

export default DashboardOverview;
