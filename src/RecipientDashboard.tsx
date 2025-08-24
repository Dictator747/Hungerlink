import React, { useState, useEffect } from 'react';
import { Plus, Eye, Clock, MapPin, ArrowLeft, Users } from 'lucide-react';
import Logo from './Logo';
import Toast from './Toast';

interface RecipientDashboardProps {
  user: any;
  onLogout: () => void;
}

interface Request {
  id: string;
  foodNeeded: string;
  quantity: string;
  location: string;
  ngoId?: string;
  status: 'pending' | 'accepted' | 'fulfilled';
  acceptedBy?: string;
  createdAt: string;
}

interface Donation {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  distance: string;
  donorName: string;
  aiQuality: 'fresh' | 'check' | 'not-suitable';
  status: 'available' | 'claimed';
  photo?: string;
  createdAt: string;
}

const RecipientDashboard: React.FC<RecipientDashboardProps> = ({ user, onLogout }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'request' | 'donations'>('dashboard');
  const [requests, setRequests] = useState<Request[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  // Request form state
  const [requestForm, setRequestForm] = useState({
    foodNeeded: '',
    quantity: '',
    location: user?.location?.address || '',
    ngoId: user?.role === 'ngo' ? user?.ngoDetails?.registrationId || '' : ''
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    loadRequests();
    loadDonations();
  }, []);

  const loadRequests = async () => {
    // Mock data - replace with actual API call
    const mockRequests: Request[] = [
      {
        id: '1',
        foodNeeded: 'Rice or Chapati',
        quantity: '50 meals',
        location: 'Hope Shelter, Brigade Road',
        ngoId: user?.role === 'ngo' ? 'NGO123456' : undefined,
        status: 'accepted',
        acceptedBy: 'Green Bowl Cafe',
        createdAt: '2024-01-15T12:00:00Z'
      },
      {
        id: '2',
        foodNeeded: 'Any vegetarian food',
        quantity: '30 meals',
        location: 'Hope Shelter, Brigade Road',
        ngoId: user?.role === 'ngo' ? 'NGO123456' : undefined,
        status: 'pending',
        createdAt: '2024-01-15T14:30:00Z'
      }
    ];
    setRequests(mockRequests);
  };

  const loadDonations = async () => {
    // Mock data - replace with actual API call
    const mockDonations: Donation[] = [
      {
        id: '1',
        foodType: 'Vegetable Biryani',
        quantity: '40 plates',
        expiryTime: 'Today 6:30 PM',
        location: 'Green Bowl Cafe, MG Road',
        distance: '1.5 km',
        donorName: 'Green Bowl Cafe',
        aiQuality: 'fresh',
        status: 'available',
        createdAt: '2024-01-15T14:20:00Z'
      },
      {
        id: '2',
        foodType: 'Mixed Vegetables',
        quantity: '25 portions',
        expiryTime: 'Today 8:00 PM',
        location: 'Spice Garden Restaurant',
        distance: '2.3 km',
        donorName: 'Spice Garden',
        aiQuality: 'fresh',
        status: 'available',
        createdAt: '2024-01-15T15:45:00Z'
      },
      {
        id: '3',
        foodType: 'Bread and Curry',
        quantity: '15 portions',
        expiryTime: 'Today 7:00 PM',
        location: 'Home Kitchen, Koramangala',
        distance: '3.1 km',
        donorName: 'Priya\'s Kitchen',
        aiQuality: 'check',
        status: 'available',
        createdAt: '2024-01-15T16:10:00Z'
      }
    ];
    setDonations(mockDonations);
  };

  const handleRequestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestForm(prev => ({
      ...prev,
      [name]: value
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
      setRequestForm(prev => ({
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

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRequest: Request = {
        id: Date.now().toString(),
        foodNeeded: requestForm.foodNeeded,
        quantity: requestForm.quantity,
        location: requestForm.location,
        ngoId: requestForm.ngoId || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setRequests(prev => [newRequest, ...prev]);

      setToast({
        show: true,
        message: '✅ Request posted successfully.',
        type: 'success'
      });

      // Reset form
      setRequestForm({
        foodNeeded: '',
        quantity: '',
        location: user?.location?.address || '',
        ngoId: user?.role === 'ngo' ? user?.ngoDetails?.registrationId || '' : ''
      });

      setCurrentView('dashboard');

    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to post request. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimDonation = async (donationId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDonations(prev => 
        prev.map(donation => 
          donation.id === donationId 
            ? { ...donation, status: 'claimed' as const }
            : donation
        )
      );

      const donation = donations.find(d => d.id === donationId);
      setToast({
        show: true,
        message: `🎉 You claimed ${donation?.foodType}. Arrange pickup.`,
        type: 'success'
      });

    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to claim donation. Please try again.',
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
    
    if (status === 'pending') return <span className="status-badge pending">Pending</span>;
    if (status === 'accepted') return <span className="status-badge accepted">Accepted</span>;
    if (status === 'fulfilled') return <span className="status-badge fulfilled">Fulfilled</span>;
    if (status === 'available') return <span className="status-badge available">Available</span>;
    if (status === 'claimed') return <span className="status-badge claimed">Claimed</span>;
    
    return null;
  };

  if (currentView === 'request') {
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
            <h2 className="dashboard-title">🍽 Request Food</h2>
            
            <form onSubmit={handleRequestSubmit} className="donation-form">
              <div className="form-group">
                <input
                  type="text"
                  name="foodNeeded"
                  placeholder="Food needed (e.g., Rice or Chapati)"
                  value={requestForm.foodNeeded}
                  onChange={handleRequestInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="quantity"
                  placeholder="Quantity (e.g., 50 meals)"
                  value={requestForm.quantity}
                  onChange={handleRequestInputChange}
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
                    value={requestForm.location}
                    onChange={handleRequestInputChange}
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

              {user?.role === 'ngo' && (
                <div className="form-group">
                  <input
                    type="text"
                    name="ngoId"
                    placeholder="NGO Registration ID"
                    value={requestForm.ngoId}
                    onChange={handleRequestInputChange}
                    className="form-input ngo-input"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Posting...' : 'Post Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'donations') {
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
            <h2 className="dashboard-title">🥘 Available Donations</h2>
            
            <div className="donations-list">
              {donations.filter(d => d.status === 'available').length === 0 ? (
                <div className="empty-state">
                  <p>No donations available at the moment.</p>
                </div>
              ) : (
                donations.filter(d => d.status === 'available').map(donation => (
                  <div key={donation.id} className="donation-card">
                    <div className="donation-header">
                      <h3 className="donation-title">{donation.foodType}</h3>
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
                        {donation.location} • {donation.distance} away
                      </p>
                      <p className="donation-donor">By {donation.donorName}</p>
                    </div>
                    {donation.photo && (
                      <div className="donation-photo">
                        <img src={donation.photo} alt={donation.foodType} />
                      </div>
                    )}
                    <button
                      onClick={() => handleClaimDonation(donation.id)}
                      disabled={isLoading}
                      className="btn-secondary"
                    >
                      Claim Food
                    </button>
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
            <p className="welcome-subtitle">
              {user?.role === 'ngo' ? 'Helping communities access food' : 'Find food assistance nearby'}
            </p>
          </div>

          <div className="cta-buttons">
            <button 
              onClick={() => setCurrentView('request')}
              className="cta-button primary"
            >
              <Plus className="cta-icon" />
              🍽 Request Food
            </button>
            <button 
              onClick={() => setCurrentView('donations')}
              className="cta-button secondary"
            >
              <Eye className="cta-icon" />
              🥘 View Donations
            </button>
          </div>

          <div className="requests-section">
            <h3 className="section-title">Your Requests</h3>
            <div className="requests-list">
              {requests.length === 0 ? (
                <div className="empty-state">
                  <p>No requests yet. Start by posting your first request!</p>
                </div>
              ) : (
                requests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4 className="request-title">{request.foodNeeded}</h4>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="request-details">
                      <p className="request-quantity">{request.quantity}</p>
                      <p className="request-location">
                        <MapPin className="location-icon" />
                        {request.location}
                      </p>
                      {request.acceptedBy && (
                        <p className="request-accepted">Accepted by {request.acceptedBy}</p>
                      )}
                      {request.ngoId && (
                        <p className="request-ngo">
                          <Users className="ngo-icon" />
                          NGO ID: {request.ngoId}
                        </p>
                      )}
                    </div>
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

export default RecipientDashboard;