'use client';
import React from 'react';
import { 
  FiEdit3, 
  FiTrash2, 
  FiUser,
  FiUsers,
  FiMail,
  FiPhone,
  FiCreditCard
} from 'react-icons/fi';

const EmployeeList = ({ employees, onEdit, onDelete }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <FiUser className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No employees yet
        </h3>
        <p className="text-gray-600 text-lg">
          Add your first employee to get started with team management.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
            <FiUsers className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Your Employees ({employees.length})
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee, index) => (
            <div 
              key={employee.id} 
              className="group bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {employee.profile_image ? (
                      <img
                        className="h-12 w-12 rounded-full border-2 border-white shadow-md"
                        src={employee.profile_image}
                        alt={`${employee.first_name} ${employee.last_name}`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center border-2 border-white shadow-md">
                        <FiUser className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {employee.first_name} {employee.last_name}
                    </h4>
                    {employee.employee_id && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        ID: {employee.employee_id}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => onEdit(employee)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Edit employee"
                  >
                    <FiEdit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(employee.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Remove employee"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm truncate">{employee.user_email}</span>
                </div>
                {employee.mobile_number && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiPhone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{employee.mobile_number}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
