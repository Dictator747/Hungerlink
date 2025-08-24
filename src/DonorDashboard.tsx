import React, { useState, useEffect } from 'react';
import { Plus, Eye, Clock, MapPin, Camera, Upload, CheckCircle, AlertTriangle, X, ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import Toast from './Toast';

interface DonorDashboardProps {
  user: any;
  onLogout: () => void;
}

interface Donation {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  photo?: string;
  status: 'available' | 'claimed' | 'completed';
  aiQuality?: 'fresh' | 'check' | 'not-suitable';
  claimedBy?: string;
  createdAt: string;
}

interface Request {
  id: string;
  foodNeeded: string;
  quantity: string;
  location: string;
  distance: string;
  requesterName: string;
  requesterType: 'ngo' | 'individual';
  status: 'open' | 'accepted' | 'fulfilled';
  createdAt: string;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'donate' | 'requests'>('dashboard');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // Donation form state
  const [donationForm, setDonationForm] = useState({
    foodType: '',
    quantity: '',
    expiryTime: '',
    location: user?.location?.address || '',
    photo: null as File | null
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  useEffect(() => {
    loadDonations();
    loadRequests();
  }, []);

  const loadDonations = async () => {
    // Mock data - replace with actual API call
    const mockDonations: Donation[] = [
      {
        id: '1',
        foodType: 'Vegetable Biryani',
        quantity: '40 plates',
        expiryTime: 'Today 6:30 PM',
        location: 'Green Bowl Cafe, MG Road',
        status: 'completed',
        aiQuality: 'fresh',
        claimedBy: 'Hope Shelter',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        foodType: 'Mixed Vegetables',
        quantity: '25 portions',
        expiryTime: 'Today 8:00 PM',
        location: 'Green Bowl Cafe, MG Road',
        status: 'available',
        aiQuality: 'fresh',
        createdAt: '2024-01-15T14:20:00Z'
      }
    ];
    setDonations(mockDonations);
  };

  const loadRequests = async () => {
    // Mock data - replace with actual API call
    const mockRequests: Request[] = [
      {
        id: '1',
        foodNeeded: 'Rice or Chapati',
        quantity: '50 meals',
        location: 'Hope Shelter, Brigade Road',
        distance: '2.1 km',
        requesterName: 'Hope Shelter',
        requesterType: 'ngo',
        status: 'open',
        createdAt: '2024-01-15T12:00:00Z'
      },
      {
        id: '2',
        foodNeeded: 'Any vegetarian food',
        quantity: '20 meals',
        location: 'Whitefield Area',
        distance: '5.3 km',
        requesterName: 'Priya Family',
        requesterType: 'individual',
        status: 'open',
        createdAt: '2024-01-15T13:15:00Z'
      }
    ];
    setRequests(mockRequests);
  };

  const handleDonationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDonationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setDonationForm(prev => ({
      ...prev,
      photo: file
    }));
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = `GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      setDonationForm(prev => ({
        ...prev,
        location: mockAddress
      }));
    } catch (error) {
      setToast({
        show: true,
        message: 'Unable to get location. Please enter manually.',
        type: 'error'
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsProcessingAI(true);

    try {
      // Simulate AI processing
      setToast({
        show: true,
        message: '🔍 Checking food quality with AI...',
        type: 'success'
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock AI quality check
      const aiQualities: ('fresh' | 'check' | 'not-suitable')[] = ['fresh', 'fresh', 'check'];
      const randomQuality = aiQualities[Math.floor(Math.random() * aiQualities.length)];

      const newDonation: Donation = {
        id: Date.now().toString(),
        foodType: donationForm.foodType,
        quantity: donationForm.quantity,
        expiryTime: donationForm.expiryTime,
        location: donationForm.location,
        photo: donationForm.photo ? URL.createObjectURL(donationForm.photo) : undefined,
        status: 'available',
        aiQuality: randomQuality,
        createdAt: new Date().toISOString()
      };

      setDonations(prev => [newDonation, ...prev]);

      let qualityMessage = '';
      if (randomQuality === 'fresh') {
        qualityMessage = '✅ Fresh quality detected!';
      } else if (randomQuality === 'check') {
        qualityMessage = '⚠️ Please check food quality before serving.';
      } else {
        qualityMessage = '❌ Food may not be suitable for donation.';
      }

      setToast({
        show: true,
        message: `🎉 Donation posted successfully. ${qualityMessage}`,
        type: 'success'
      });

      // Reset form
      setDonationForm({
        foodType: '',
        quantity: '',
        expiryTime: '',
        location: user?.location?.address || '',
        photo: null
      });

      setCurrentView('dashboard');

    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to post donation. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setIsProcessingAI(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' as const }
            : req
        )
      );

      const request = requests.find(r => r.id === requestId);
      setToast({
        show: true,
        message: `✅ You accepted ${request?.requesterName}'s request.`,
        type: 'success'
      });

    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to accept request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, aiQuality?: string) => {
    if (aiQuality) {
      if (aiQuality === 'fresh') return <span className="status-badge fresh">✅ Fresh</span>;
      if (aiQuality === 'check') return <span className="status-badge check">⚠️ Check</span>;
      if (aiQuality === 'not-suitable') return <span className="status-badge not-suitable">❌ Not Suitable</span>;
    }
    
    if (status === 'available') return <span className="status-badge available">Available</span>;
    if (status === 'claimed') return <span className="status-badge claimed">Claimed</span>;
    if (status === 'completed') return <span className="status-badge completed">Completed</span>;
    if (status === 'open') return <span className="status-badge open">Open</span>;
    if (status === 'accepted') return <span className="status-badge accepted">Accepted</span>;
    if (status === 'fulfilled') return <span className="status-badge fulfilled">Fulfilled</span>;
    
    return null;
  };

  if (currentView === 'donate') {
    return (
      <div className="dashboard-container">
        <Toast 
          message={toast.message}
          isVisible={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          type={toast.type}
        />

        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <button onClick={() => setCurrentView('dashboard')} className="back-button">
              <ArrowLeft />
            </button>
            <Logo />
          </div>

          <div className="dashboard-card">
            <h2 className="dashboard-title">🥘 Donate Food</h2>
            
            <form onSubmit={handleDonationSubmit} className="donation-form">
              <div className="form-group">
                <input
                  type="text"
                  name="foodType"
                  placeholder="Food type (e.g., Vegetable Biryani)"
                  value={donationForm.foodType}
                  onChange={handleDonationInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="quantity"
                  placeholder="Quantity (e.g., 40 plates)"
                  value={donationForm.quantity}
                  onChange={handleDonationInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="expiryTime"
                  placeholder="Expiry time (e.g., Today 6:30 PM)"
                  value={donationForm.expiryTime}
                  onChange={handleDonationInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <div className="location-group">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={donationForm.location}
                    onChange={handleDonationInputChange}
                    className="form-input location-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="location-btn"
                    title="Use my GPS location"
                  >
                    {isGettingLocation ? (
                      <div className="spinner"></div>
                    ) : (
                      <MapPin />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="file-upload-label">
                  <input
                    type="file"
                    onChange={handlePhotoChange}
                    className="file-upload-input"
                    accept="image/*"
                  />
                  {donationForm.photo ? (
                    <>
                      <CheckCircle />
                      <span className="file-upload-text selected">
                        {donationForm.photo.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera />
                      <span className="file-upload-text">Upload photo</span>
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isProcessingAI ? '🔍 Checking with AI...' : isLoading ? 'Posting...' : 'Post Donation'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'requests') {
    return (
      <div className="dashboard-container">
        <Toast 
          message={toast.message}
          isVisible={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          type={toast.type}
        />

        <div className="dashboard-wrapper">
          <div className="dashboard-header">
            <button onClick={() => setCurrentView('dashboard')} className="back-button">
              <ArrowLeft />
            </button>
            <Logo />
          </div>

          <div className="dashboard-card">
            <h2 className="dashboard-title">📋 Food Requests</h2>
            
            <div className="requests-list">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <p>No food requests available at the moment.</p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h3 className="request-title">{request.foodNeeded}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="request-details">
                      <p className="request-quantity">{request.quantity}</p>
                      <p className="request-location">
                        <MapPin className="location-icon" />
                        {request.location} • {request.distance} away
                      </p>
                      <p className="request-requester">
                        By {request.requesterName} ({request.requesterType === 'ngo' ? 'NGO' : 'Individual'})
                      </p>
                    </div>
                    {request.status === 'open' && (
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={isLoading}
                        className="btn-secondary"
                      >
                        Accept Request
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Toast 
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        type={toast.type}
      />

      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <Logo />
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>

        <div className="dashboard-card">
          <div className="welcome-section">
            <h2 className="welcome-title">👋 Welcome, {user?.name}</h2>
            <p className="welcome-subtitle">Ready to make a difference today?</p>
          </div>

          <div className="cta-buttons">
            <button 
              onClick={() => setCurrentView('donate')}
              className="cta-button primary"
            >
              <Plus className="cta-icon" />
              🥘 Donate Food
            </button>
            <button 
              onClick={() => setCurrentView('requests')}
              className="cta-button secondary"
            >
              <Eye className="cta-icon" />
              📋 View Requests
            </button>
          </div>

          <div className="donations-section">
            <h3 className="section-title">Your Donations</h3>
            <div className="donations-list">
              {donations.length === 0 ? (
                <div className="empty-state">
                  <p>No donations yet. Start by posting your first donation!</p>
                </div>
              ) : (
                donations.map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-header">
                      <h4 className="donation-title">{donation.foodType}</h4>
                      {getStatusBadge(donation.status, donation.aiQuality)}
                    </div>
                    <div className="donation-details">
                      <p className="donation-quantity">{donation.quantity}</p>
                      <p className="donation-expiry">
                        <Clock className="expiry-icon" />
                        Expires: {donation.expiryTime}
                      </p>
                      <p className="donation-location">
                        <MapPin className="location-icon" />
                        {donation.location}
                      </p>
                      {donation.claimedBy && (
                        <p className="donation-claimed">Claimed by {donation.claimedBy}</p>
                      )}
                    </div>
                    {donation.photo && (
                      <div className="donation-photo">
                        <img src={donation.photo} alt={donation.foodType} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;