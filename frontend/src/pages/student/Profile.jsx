import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile } from "../../api/api";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const response = await getMyProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.message || "Unable to load profile.");
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  return (
    <div className="page-shell narrow-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Your registered student information.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/student")}>
          ← Dashboard
        </button>
      </div>

      {loading && <div className="state-card">Loading profile...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {profile && (
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-main">
            <h2>{profile.name}</h2>
            <span className="status-pill">Student</span>
          </div>

          <div className="profile-grid">
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>
            <div>
              <span>Age</span>
              <strong>{profile.age}</strong>
            </div>
            <div>
              <span>City</span>
              <strong>{profile.city}</strong>
            </div>
            <div>
              <span>Joined</span>
              <strong>
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
