
import React, { useState } from 'react';
import { translations, Language } from '@/utils/translations';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface RegistrationFormProps {
  language: Language;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ language }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const t = translations[language];
  const isRTL = language === 'ar';

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = t.requiredField;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.requiredField;
    } else if (!formData.phone.startsWith('+')) {
      newErrors.phone = t.invalidPhone;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting form:', formData);
      
      // Store in localStorage for now
      const submissions = JSON.parse(localStorage.getItem('registrations') || '[]');
      submissions.push({
        ...formData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('registrations', JSON.stringify(submissions));

      // Call the edge function with timeout
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          name: formData.name,
          phone: formData.phone
        }
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        // Show more specific error message
        toast({
          title: error.message || t.errorToast,
          variant: 'destructive',
          duration: 5000,
        });
        return;
      }

      if (data?.ok) {
        toast({
          title: t.successToast,
          duration: 5000,
        });
        
        // Clear form
        setFormData({ name: '', phone: '' });
      } else {
        // Show the specific error from the backend
        const errorMessage = data?.error || 'Unknown error occurred';
        toast({
          title: language === 'ar' ? `❌ ${errorMessage}` : `❌ ${errorMessage}`,
          variant: 'destructive',
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: t.errorToast,
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isFormValid = formData.name.trim() && formData.phone.trim() && formData.phone.startsWith('+');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div>
            <label 
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.fullName}
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                errors.name ? 'border-red-500' : 'border-gray-600'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t.fullName}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              {t.phoneNumber}
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
                errors.phone ? 'border-red-500' : 'border-gray-600'
              } ${isRTL ? 'text-right' : 'text-left'}`}
              placeholder={t.phonePlaceholder}
              disabled={isSubmitting}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="mt-1 text-sm text-red-400">
                {errors.phone}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="Submit registration form"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                {t.registering}
              </div>
            ) : (
              t.registerButton
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
