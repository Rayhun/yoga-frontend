'use client';

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormikOTP from '@/components/common/form/formik/FormikOTP';
import JoinOnboardResendOTP from './JoinOnboardResendOTP';
import { fillSubtitleTemplate, getResendDurationSeconds } from './onboardUtils';
import {
  ONBOARD_PRIMARY_BUTTON_CLASS,
  ONBOARD_SUBTITLE_CLASS,
  ONBOARD_TITLE_CLASS,
} from './onboardStyles';

const JoinOnboardStep2 = ({
  stepData,
  activeTab,
  contactValue,
  onSubmit,
  onResend,
  isSubmitting,
}) => {
  const channelLabel = activeTab === 'phone' ? 'SMS' : 'email';
  const subtitle = fillSubtitleTemplate(
    stepData?.header?.subtitle,
    channelLabel,
    contactValue
  );
  const resendDuration = getResendDurationSeconds(stepData?.resend_handler?.timer);
  const otpLength = stepData?.otp_input?.expected_length || 6;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="mb-6 sm:mb-8">
        <h1 className={ONBOARD_TITLE_CLASS}>{stepData?.header?.title}</h1>
        {subtitle ? <p className={ONBOARD_SUBTITLE_CLASS}>{subtitle}</p> : null}
      </div>

      <Formik
        initialValues={{ otp: '' }}
        validationSchema={Yup.object({
          otp: Yup.string()
            .length(otpLength, `Enter the ${otpLength}-digit code`)
            .required('Required!'),
        })}
        onSubmit={onSubmit}
      >
        {({ isSubmitting: formSubmitting }) => (
          <Form className="flex flex-1 flex-col">
            <div className="space-y-6">
              <FormikOTP name="otp" numberOfDigits={otpLength} required />

              <JoinOnboardResendOTP
                duration={resendDuration}
                promptText={stepData?.resend_handler?.text}
                actionLabel={stepData?.resend_handler?.action_label}
                onResend={onResend}
              />
            </div>

            <div className="mt-auto pt-8 sm:pt-10">
              <button
                type="submit"
                disabled={isSubmitting || formSubmitting}
                className={ONBOARD_PRIMARY_BUTTON_CLASS}
              >
                {isSubmitting || formSubmitting
                  ? 'Verifying...'
                  : stepData?.footer_actions?.primary_button?.label || 'Verify & Join'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default JoinOnboardStep2;
