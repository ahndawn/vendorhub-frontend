// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';

const Profile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userToken = JSON.parse(localStorage.getItem('user')).token;
        const profileData = await userService.getProfile(userToken);
        setProfile(profileData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      {profile ? (
        <div>
          <h1>{profile.username}</h1>
         
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;