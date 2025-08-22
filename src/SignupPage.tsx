import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, Upload, CheckCircle } from 'lucide-react';
import Logo from './Logo';
import Toast from './Toast';

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

type UserRole = 'donor' | 'recipient' | 'ngo';

const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    role: 'donor' as UserRole,
    location: '',
    ngoId: '',
    certificate: null as File | null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      certificate: file
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
      
      // Simulate reverse geocoding
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      setFormData(prev => ({
        ...prev,
        location: `GPS: ${mockAddress}`
      }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        location: 'Unable to get your location. Please enter manually.'
      }));
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone is required';
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.role === 'ngo' && !formData.ngoId.trim()) {
      newErrors.ngoId = 'NGO accounts must provide a valid government ID.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      let response;
      if (formData.role === 'ngo' && formData.certificate) {
        // Use FormData for NGO with certificate upload
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('emailOrPhone', formData.emailOrPhone);
        fd.append('password', formData.password);
        fd.append('role', formData.role);
        fd.append('location', formData.location);
        fd.append('ngoId', formData.ngoId);
        fd.append('certificate', formData.certificate);
        response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          body: fd
        });
      } else {
        // Use JSON for donor/recipient
        response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            emailOrPhone: formData.emailOrPhone,
            password: formData.password,
            role: formData.role,
            location: formData.location,
            ngoId: formData.role === 'ngo' ? formData.ngoId : undefined
          })
        });
      }
      const data = await response.json();
      if (response.ok && data.success) {
        setToast({
          show: true,
          message: data.message || `🎉 Account created successfully. Welcome, ${formData.name}!`,
          type: 'success'
        });
        setTimeout(() => {
          onNavigateToLogin();
        }, 2000);
      } else {
        setToast({
          show: true,
          message: data.message || 'Failed to create account. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to create account. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Toast 
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        type={toast.type}
      />
      
      <div className="auth-wrapper">
        <Logo />
        
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              {errors.name && <p className="error-message">{errors.name}</p>}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="emailOrPhone"
                placeholder="Email or Phone"
                value={formData.emailOrPhone}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              {errors.emailOrPhone && <p className="error-message">{errors.emailOrPhone}</p>}
            </div>
            
            <div className="form-group">
              <div className="password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            
            <div className="form-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="donor">Donor</option>
                <option value="recipient">Recipient (Family)</option>
                <option value="ngo">NGO</option>
              </select>
            </div>
            
            <div className="form-group">
              <div className="location-group">
                <input
                  type="text"
                  name="location"
                  placeholder="Your Location"
                  value={formData.location}
                  onChange={handleInputChange}
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
              {errors.location && <p className="error-message">{errors.location}</p>}
            </div>
            
            {formData.role === 'ngo' && (
              <div className="ngo-section">
                <div className="form-group">
                  <input
                    type="text"
                    name="ngoId"
                    placeholder="Government Registration ID *"
                    value={formData.ngoId}
                    onChange={handleInputChange}
                    className="form-input ngo-input"
                    required
                  />
                  {errors.ngoId && <p className="error-message">{errors.ngoId}</p>}
                </div>
                
                <div className="form-group">
                  <label className="file-label">
                    Upload Registration Certificate (Optional)
                  </label>
                  <label className="file-upload-label">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="file-upload-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.certificate ? (
                      <>
                        <CheckCircle />
                        <span className="file-upload-text selected">
                          {formData.certificate.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload />
                        <span className="file-upload-text">Choose file</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-link">
            <button onClick={onNavigateToLogin}>
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;