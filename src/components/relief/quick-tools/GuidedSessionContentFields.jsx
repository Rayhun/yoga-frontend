'use client';

import { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { useQuery } from '@tanstack/react-query';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import FormikField from '@/components/common/form/formik/FormikField';
import FormikSelect from '@/components/common/form/formik/FormikSelect';
import { getSessionsList } from '@/services/private/lms/session';
import { SESSION_TYPE } from '@/utils/enums';

const GUIDED_CONTENT_TYPE_OPTIONS = [
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Guides / Lessons', value: 'image' },
];

const SESSION_TYPE_BY_CONTENT = {
  video: SESSION_TYPE.video,
  audio: SESSION_TYPE.audio,
  image: SESSION_TYPE.image,
};

export default function GuidedSessionContentFields() {
  const { values, setFieldValue } = useFormikContext();
  const isSessionSource = values.guided_content_source === 'session';
  const sessionApiType = SESSION_TYPE_BY_CONTENT[values.guided_content_type];

  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery({
    queryKey: ['reliefQuickToolSessions', sessionApiType],
    queryFn: () => getSessionsList({ type: sessionApiType }),
    enabled: isSessionSource && Boolean(sessionApiType),
    select: response => response?.data || [],
  });

  const sessionOptions = useMemo(() => {
    const sessions = sessionsResponse || [];
    return sessions
      .filter(session => session.status === 'Published')
      .map(session => ({
        label: session.title,
        value: session.id,
      }));
  }, [sessionsResponse]);

  const handleSourceChange = (_, nextSource) => {
    if (!nextSource) return;
    setFieldValue('guided_content_source', nextSource);
    if (nextSource === 'session') {
      setFieldValue('guided_content_link', '');
    } else {
      setFieldValue('guided_session_id', null);
    }
  };

  const handleContentTypeChange = value => {
    setFieldValue('guided_content_type', value);
    if (isSessionSource) {
      setFieldValue('guided_session_id', null);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <h3 className="mb-1 text-lg font-semibold text-gray-900">Guided Session Modal</h3>
      <p className="mb-4 text-sm text-gray-600">
        When the user taps Start, this media opens in a modal. Choose an existing session or
        provide a custom link.
      </p>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Content Source</p>
        <ToggleButtonGroup
          exclusive
          value={values.guided_content_source}
          onChange={handleSourceChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="session">Session</ToggleButton>
          <ToggleButton value="custom">Custom Content</ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormikSelect
          name="guided_content_type"
          label="Content Type"
          options={GUIDED_CONTENT_TYPE_OPTIONS}
          onChange={handleContentTypeChange}
        />

        {isSessionSource ? (
          <FormikSelect
            name="guided_session_id"
            label="Session"
            placeholder="Select session"
            options={sessionOptions}
            loading={sessionsLoading}
            disabled={!sessionApiType}
            required
          />
        ) : (
          <FormikField
            name="guided_content_link"
            label="Content Link"
            placeholder="https://..."
          />
        )}
      </div>
    </div>
  );
}
