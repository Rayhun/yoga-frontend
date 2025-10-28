'use client';
import { useState, useMemo } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';

const BusinessSubscriptionForm = ({ planData, referralCode }) => {
  const router = useRouter();
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [employeeCount, setEmployeeCount] = useState(5);
  const [selectedRange, setSelectedRange] = useState(null);
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    privacyPolicy: false,
    recurringCharge: false,
  });

  const initialValues = {
    organizationName: '',
    employeeLimit: 5,
  };

  const validationSchema = Yup.object({
    organizationName: Yup.string().required('Organization name is required'),
    employeeLimit: Yup.number()
      .required('Employee limit is required')
      .min(5, 'Employee limit must be at least 5')
      .max(1000, 'Employee limit cannot exceed 1000')
      .integer('Employee limit must be a whole number'),
  });

  // Check if all agreements are accepted
  const allAgreementsAccepted = agreements.termsOfService && agreements.privacyPolicy && agreements.recurringCharge;

  // Auto-select appropriate discount based on employee count
  const applicableDiscount = useMemo(() => {
    if (!planData?.discounted_volume || planData.discounted_volume.length === 0) {
      return null;
    }
    
    // Find the highest applicable discount based on employee count
    const sortedDiscounts = planData.discounted_volume
      .filter(discount => employeeCount >= discount.volume)
      .sort((a, b) => b.volume - a.volume);
    
    return sortedDiscounts.length > 0 ? sortedDiscounts[0] : null;
  }, [planData?.discounted_volume, employeeCount]);

  // Calculate pricing based on employee limit and applicable discount
  const pricingCalculation = useMemo(() => {
    const basePrice = planData?.rate || planData?.price || 0;
    const subtotal = basePrice * employeeCount;
    
    let discountAmount = 0;
    let discountPercentage = 0;
    const currentDiscount = selectedDiscount || applicableDiscount;
    
    if (currentDiscount) {
      if (currentDiscount.type === 'Percentage') {
        discountPercentage = currentDiscount.discount;
        discountAmount = (subtotal * currentDiscount.discount) / 100;
      } else {
        // Fixed discount
        discountAmount = currentDiscount.discount;
        discountPercentage = (discountAmount / subtotal) * 100;
      }
    }
    
    const total = subtotal - discountAmount;
    
    return {
      basePrice,
      employeeCount,
      subtotal,
      discountAmount,
      discountPercentage,
      total,
      currentDiscount,
    };
  }, [planData?.rate, planData?.price, employeeCount, selectedDiscount, applicableDiscount]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!allAgreementsAccepted) {
        toast.error('Please accept all terms and agreements to continue.');
        return;
      }

      // Import the service function dynamically
      const { createBusinessSubscriptionCheckout } = await import('@/services/private/subscription/business');

      // Create business subscription checkout session
      const checkoutResponse = await createBusinessSubscriptionCheckout({
        id: planData.id,
        organizationName: values.organizationName,
        employeeCount: values.employeeLimit,
        selectedDiscount: pricingCalculation.currentDiscount,
        calculatedPrice: Math.round(pricingCalculation.total),
        referralCode: referralCode
      });

      if (checkoutResponse.data.status === 'success') {
        const { checkout_session_client_secret } = checkoutResponse.data.data;
        
        // Store session data
        localStorage.setItem('stripe_client_secret', checkout_session_client_secret);
        localStorage.setItem('business_subscription_data', JSON.stringify({
          planId: planData.id,
          organizationName: values.organizationName,
          employeeCount: values.employeeLimit,
          selectedDiscount: pricingCalculation.currentDiscount,
          pricing: pricingCalculation,
          agreements
        }));

        // Redirect to checkout page with the plan details
        const currentPath = window.location.pathname;
        const basePath = currentPath.replace('/business-subscription', '');
        router.push(`${basePath}/checkout`);
      } else {
        toast.error(checkoutResponse.data.message || 'Failed to create checkout session.');
      }
    } catch (error) {
      console.error('Business subscription checkout error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Business Subscription
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {planData?.title}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Organization Details</h3>
            </div>
            
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Organization Name *
                    </label>
                    <FormikField
                      name="organizationName"
                      placeholder="Enter your organization name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  
                  {/* Team Size Slider */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-lg font-bold text-gray-800">
                        Team Size *
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 via-orange-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-600">Select your team size</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 rounded-3xl p-8 border-2 border-orange-200 shadow-lg">
                      {/* Current Value Display */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-green-500 rounded-full shadow-xl ring-4 ring-orange-100">
                          <span className="text-3xl font-bold text-white">{employeeCount}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 font-medium">employees</p>
                      </div>
                      
                      {/* Slider Container */}
                      <div className="relative px-4">
                        {/* Range Labels */}
                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                          <span className="font-medium">5</span>
                          <span className="font-medium">100</span>
                          <span className="font-medium">250</span>
                          <span className="font-medium">500</span>
                          <span className="font-medium">1000</span>
                        </div>
                        
                        {/* Slider Track */}
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          {/* Progress Fill */}
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 via-orange-300 to-green-400 rounded-full transition-all duration-300 shadow-inner"
                            style={{ 
                              width: `${((employeeCount - 5) / (1000 - 5)) * 100}%` 
                            }}
                          ></div>
                          
                          {/* Hidden Range Input */}
                          <input
                            type="range"
                            min="5"
                            max="1000"
                            step="1"
                            value={employeeCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              setFieldValue('employeeLimit', value);
                              setEmployeeCount(value);
                            }}
                            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                            style={{ 
                              background: 'transparent',
                              WebkitAppearance: 'none',
                              appearance: 'none'
                            }}
                          />
                          
                          {/* Custom Handle */}
                          <div 
                            className="absolute top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white border-4 border-orange-400 rounded-full shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-2xl z-20 ring-2 ring-orange-100"
                            style={{ 
                              left: `calc(${((employeeCount - 5) / (1000 - 5)) * 100}% - 20px)`,
                              pointerEvents: 'none'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-green-500 rounded-full opacity-30"></div>
                            <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-gradient-to-br from-orange-400 to-green-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Value Display on Track */}
                        <div className="mt-2 text-center">
                          <span className="text-sm font-bold text-orange-600">
                            {employeeCount} employees
                          </span>
                        </div>
                      </div>
                      
                      {/* Quick Select Pills - Based on discounted_volume */}
                      {planData?.discounted_volume && planData.discounted_volume.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-3 justify-center">
                          {planData.discounted_volume
                            .sort((a, b) => a.volume - b.volume)
                            .map((discount, index, array) => {
                                   const colors = [
                                     'from-orange-400 to-orange-500',
                                     'from-orange-500 to-green-400', 
                                     'from-green-400 to-green-500',
                                     'from-orange-300 to-green-500',
                                     'from-green-500 to-orange-400',
                                     'from-orange-500 to-green-600',
                                     'from-green-300 to-orange-500',
                                     'from-orange-600 to-green-400',
                                     'from-green-600 to-orange-500',
                                     'from-orange-400 to-green-600'
                                   ];
                              
                              const color = colors[index % colors.length];
                              
                              // Calculate range
                              const startRange = index === 0 ? 0 : array[index - 1].volume + 1;
                              const endRange = discount.volume;
                              const isLastOption = index === array.length - 1;
                              const rangeLabel = isLastOption ? `${endRange}+` : `${startRange}-${endRange}`;
                              
                              // Check if this range is manually selected
                              const isSelected = selectedRange === discount.volume;
                              
                              return (
                                <button
                                  key={discount.volume}
                                  type="button"
                                  onClick={() => {
                                    setFieldValue('employeeLimit', endRange);
                                    setEmployeeCount(endRange);
                                    setSelectedRange(discount.volume);
                                  }}
                                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                                    isSelected
                                      ? `bg-gradient-to-r ${color} text-white shadow-lg`
                                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                  }`}
                                >
                                  {rangeLabel}
                                </button>
                              );
                            })}
                        </div>
                      )}
                      
                      {/* Motivational Text */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                          {applicableDiscount ? (
                            <span className="text-green-600 font-semibold">
                              🎉 Great choice! You're eligible for {applicableDiscount.discount}% volume discount!
                            </span>
                          ) : planData?.discounted_volume && planData.discounted_volume.length > 0 ? (
                            <span className="text-blue-600 font-semibold">
                              💪 Growing team! Consider our volume pricing for {Math.min(...planData.discounted_volume.map(d => d.volume))}+ employees.
                            </span>
                          ) : (
                            <span className="text-orange-600 font-semibold">
                              🚀 Perfect for getting started!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agreement Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          id="termsOfService"
                          checked={agreements.termsOfService}
                          onChange={(e) => setAgreements(prev => ({ ...prev, termsOfService: e.target.checked }))}
                          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="termsOfService" className="text-sm font-medium text-gray-900 cursor-pointer">
                          I agree to Terms of Service
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          <a href="/terms" className="text-orange-600 hover:text-orange-800 underline">
                            Link to Terms of Service
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          id="privacyPolicy"
                          checked={agreements.privacyPolicy}
                          onChange={(e) => setAgreements(prev => ({ ...prev, privacyPolicy: e.target.checked }))}
                          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="privacyPolicy" className="text-sm font-medium text-gray-900 cursor-pointer">
                          I agree to Privacy Policy
                        </label>
                        <p className="text-sm text-gray-600 mt-1">
                          <a href="/privacy" className="text-orange-600 hover:text-orange-800 underline">
                            Link to your Privacy URL
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          id="recurringCharge"
                          checked={agreements.recurringCharge}
                          onChange={(e) => setAgreements(prev => ({ ...prev, recurringCharge: e.target.checked }))}
                          className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="recurringCharge" className="text-sm font-medium text-gray-900 cursor-pointer">
                          I acknowledge this is a recurring charge
                        </label>
                        {/* <p className="text-sm text-gray-600 mt-1">
                          Card network compliance requirement
                        </p> */}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !allAgreementsAccepted}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Continue to Checkout</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
          
          {/* Pricing Summary Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Pricing Summary</h3>
            </div>
            
            <div className="space-y-6">
              {/* Volume Discount Section - Show only applicable discount */}
              {applicableDiscount && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-green-800">Volume Discount Applied!</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{applicableDiscount.volume}+</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {applicableDiscount.volume}+ Employees
                        </div>
                        <div className="text-xs text-gray-600">
                          {applicableDiscount.type} Discount
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {applicableDiscount.discount}%
                      </div>
                      <div className="text-xs text-gray-500">off</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">Per Employee Price</span>
                  <span className="font-bold text-lg">
                    {planData?.currency_symbol || '$'}{Math.round(planData?.rate || planData?.price || 0)}
                  </span>
                </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Number of Employees</span>
                      <span className="font-bold text-lg text-green-600">{employeeCount}</span>
                    </div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="font-bold text-xl">
                    {planData?.currency_symbol || '$'}{Math.round(pricingCalculation.subtotal)}
                  </span>
                </div>
              </div>
              
              {pricingCalculation.currentDiscount && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-bold text-green-800">Volume Discount Applied!</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Discount ({pricingCalculation.currentDiscount.volume}+ employees)</span>
                      <span className="font-bold text-green-600">
                        -{planData?.currency_symbol || '$'}{Math.round(pricingCalculation.discountAmount)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Savings</span>
                      <span className="font-bold text-green-600">{pricingCalculation.discountPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-3xl font-bold">
                    {planData?.currency_symbol || '$'}{Math.round(pricingCalculation.total)}
                  </span>
                </div>
                <div className="text-green-100 text-sm">
                  Billed {planData?.subscription_tenure_period || 'monthly'}
                </div>
              </div>
              
              {pricingCalculation.currentDiscount && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    You're saving {planData?.currency_symbol || '$'}{Math.round(pricingCalculation.discountAmount)}!
                  </div>
                </div>
              )}
            </div>
            
            {/* Plan Details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Plan Features
              </h4>
              <ul className="space-y-3">
                {planData?.features?.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSubscriptionForm;
