'use client';
import React from 'react';
import { 
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';

const SubscriptionHistory = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <FiClock className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Subscription History
        </h3>
        <p className="text-gray-600 text-lg">
          You don't have any subscription history yet.
        </p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case 'inactive':
        return <FiXCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <FiAlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl">
            <FiClock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Subscription History
            </h3>
            <p className="text-gray-600">
              View all your past and current subscriptions
            </p>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <FiClock className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              Subscription Timeline ({history.length} records)
            </h4>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {history.map((subscription, index) => (
              <div 
                key={subscription.id || index} 
                className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-xl ${
                        subscription.status === 'active' ? 'bg-green-100' :
                        subscription.status === 'inactive' ? 'bg-red-100' :
                        subscription.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                      }`}>
                        {getStatusIcon(subscription.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-4">
                        <h5 className="text-lg font-bold text-gray-900">
                          {subscription.title || 'Business Plan'}
                        </h5>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(subscription.status)}`}>
                          {subscription.status?.charAt(0).toUpperCase() + subscription.status?.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-1">Employee Limit</div>
                          <div className="text-xl font-bold text-blue-600">{subscription.employee_limit || 10}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-1">Created</div>
                          <div className="text-sm font-medium text-green-600">
                            {subscription.created_at 
                              ? new Date(subscription.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </div>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="text-sm font-semibold text-purple-800 uppercase tracking-wide mb-1">Expires</div>
                          <div className="text-sm font-medium text-purple-600">
                            {subscription.expires 
                              ? new Date(subscription.expires).toLocaleDateString()
                              : 'N/A'
                            }
                          </div>
                        </div>
                      </div>
                      
                      {subscription.updated_at && (
                        <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          Last updated: {new Date(subscription.updated_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-sm font-semibold text-orange-800 uppercase tracking-wide mb-1">Current</div>
                      <div className="text-xl font-bold text-orange-600">{subscription.current_employees || 0}</div>
                      <div className="text-xs text-orange-600">employees</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiClock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Subscriptions
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {history.length}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiCheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Active Subscriptions
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {history.filter(sub => sub.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <FiAlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Max Employee Limit
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {Math.max(...history.map(sub => sub.employee_limit || 10))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionHistory;
