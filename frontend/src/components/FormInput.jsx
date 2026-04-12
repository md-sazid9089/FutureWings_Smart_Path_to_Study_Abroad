import { useState, useCallback } from 'react';

/**
 * Enhanced FormInput Component with Real-time Validation
 * Supports email, password, phone, URL validation and error feedback
 */
export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  required = false,
  placeholder = '',
  error,
  helperText,
  disabled = false,
  autoComplete,
  validation, // Custom validation function
  showPasswordStrength = false, // For password fields
  characterLimit = null,
  className = '',
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Handle validation on change
  const handleChange = useCallback(
    (e) => {
      const val = e.target.value;
      onChange?.(e);

      // Clear error on change
      setValidationError('');

      // Custom validation
      if (validation && typeof validation === 'function') {
        const result = validation(val);
        if (result && typeof result === 'string') {
          setValidationError(result);
        }
      }

      // Password strength calculation
      if (showPasswordStrength && type === 'password') {
        calculatePasswordStrength(val);
      }
    },
    [onChange, validation, type, showPasswordStrength]
  );

  // Handle blur event
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Handle focus event
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  // Get strength indicator color
  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return 'No password';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const hasError = error || validationError;
  const shouldShowCharCount = characterLimit && value?.length > 0;

  return (
    <div className={`form-group ${className}`}>
      <div className="flex justify-between items-end mb-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {shouldShowCharCount && (
          <span className={`text-xs ${value.length > characterLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{characterLimit}
          </span>
        )}
      </div>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={characterLimit}
        className={`form-input w-full px-4 py-2 border rounded-lg transition-all duration-200
          ${
            isFocused
              ? 'border-blue-500 ring-2 ring-blue-100 focus:outline-none'
              : 'border-gray-300'
          }
          ${hasError ? 'border-red-500 bg-red-50' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white'}
        `}
      />

      {/* Password Strength Indicator */}
      {showPasswordStrength && type === 'password' && value && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${(passwordStrength / 4) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 font-medium">{getStrengthLabel()}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L12 16.172V4a1 1 0 00-2 0v12.172L3.314 11.516a1 1 0 00-1.414 1.414l9.9 9.9a1 1 0 001.414 0l9.9-9.9z" clipRule="evenodd" />
          </svg>
          {validationError || error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !hasError && (
        <p className="mt-1 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}
