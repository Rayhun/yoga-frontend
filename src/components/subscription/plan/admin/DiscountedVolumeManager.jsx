'use client';
import { useState } from 'react';
import { FieldArray, useFormikContext } from 'formik';
import Button from '@/components/common/Button';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percentage', value: 'Percentage' },
  { label: 'Fixed', value: 'Fixed' },
];

const DiscountedVolumeManager = () => {
  const { values } = useFormikContext();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Discounted Volume</h3>
          <span className="text-sm text-gray-500">Configure volume-based discounts</span>
        </div>
        <FieldArray name="discounted_volume">
          {({ push }) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => push({ volume: '', type: '', discount: '' })}
              className="px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-lg font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Discounted Volume
            </Button>
          )}
        </FieldArray>
      </div>
      
      <FieldArray name="discounted_volume">
        {({ push, remove }) => (
          <div className="space-y-4">
            {values.discounted_volume?.length === 0 && (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm">No discounted volume entries yet</p>
                <p className="text-gray-400 text-xs mt-1">Click the button to add your first volume discount</p>
              </div>
            )}
            {values.discounted_volume?.map((item, index) => (
              <div key={index} className="flex items-end gap-4 p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex-1">
                  <FormikField
                    name={`discounted_volume.${index}.volume`}
                    label="Volume"
                    placeholder="e.g., 10"
                    type="number"
                    min={1}
                    required
                  />
                </div>
                <div className="flex-1">
                  <FormikSelect
                    name={`discounted_volume.${index}.type`}
                    label="Type"
                    placeholder="Select Type"
                    options={DISCOUNT_TYPE_OPTIONS}
                    required
                  />
                </div>
                <div className="flex-1">
                  <FormikField
                    name={`discounted_volume.${index}.discount`}
                    label="Discount"
                    placeholder="e.g., 20"
                    type="number"
                    min={0}
                    required
                  />
                </div>
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </FieldArray>
    </div>
  );
};

export default DiscountedVolumeManager;
