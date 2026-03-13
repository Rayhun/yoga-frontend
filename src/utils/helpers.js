import axios from 'axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TIME_ZONES } from './constants';

dayjs.extend(utc);
dayjs.extend(timezone);

export const extractApiErrorMessage = error => {
  return error?.response?.data?.message || error?.message || 'Uncaught error!';
};

export const toastApiError = error => {
  toast.error(extractApiErrorMessage(error));
};

export const extractFormFieldError = error => {
  return error?.response?.status === 400 ? error?.response?.data : {};
};

export const setFormFieldError = (error = {}, fieldNames = [], setFieldError = () => null) => {
  if (error?.response?.status === 400) {
    for (const fieldName of fieldNames) {
      const fieldError = error?.response?.data?.[fieldName];
      if (fieldError) setFieldError(fieldName, fieldError);
    }
  }
};

export const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export const getFileFromURL = async url => {
  const response = await axios({
    url,
    responseType: 'blob',
  });

  const filename = url.substring(url.lastIndexOf('/') + 1);
  const fileType = response.data.type;

  return new File([response.data], filename, { type: fileType });
};

export const getSearchParamsFromObject = obj => {
  const params = new URLSearchParams();

  // Filter out React Query internal properties (signal, queryKey, etc.)
  const filteredObj = { ...obj };
  delete filteredObj.signal;
  delete filteredObj.queryKey;
  delete filteredObj.pageParam;

  Object.entries(filteredObj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    // Skip objects that can't be serialized (like AbortSignal)
    if (typeof value === 'object' && !Array.isArray(value) && value.toString() === '[object Object]') {
      // Only serialize plain objects, skip special objects
      try {
        JSON.stringify(value);
      } catch {
        return; // Skip non-serializable objects
      }
    }

    if (Array.isArray(value)) {
      const filteredValues = value.filter(v => v !== null && v !== undefined);
      if (filteredValues.length > 0) {
        params.append(key, filteredValues.join(','));
      }
    } else {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const downloadCSV = (data, filename = 'experts-list.csv') => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data for CSV export');
    return;
  }

  // Extract CSV headers
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers
        .map(field => {
          const value = row[field];
          // Escape quotes and commas
          return `"${String(value ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Download a blob response (e.g. CSV export) as a file
 * @param {Object} response - Axios response with data (blob) and headers
 * @param {string} defaultFilename - Fallback filename
 * @param {string} successMessage - Toast success message
 */
export const downloadBlobAsCsv = (response, defaultFilename, successMessage) => {
  const { data: blobData, headers } = response;
  const contentType = headers['content-type'] || 'text/csv';
  const blob = new Blob([blobData], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  let filename = defaultFilename;
  const disposition = headers['content-disposition'] || '';
  const filenameMatch =
    disposition.match(/filename\*\s*=\s*([^;]+)/i) ||
    disposition.match(/filename\s*=\s*"([^"]+)"/i) ||
    disposition.match(/filename\s*=\s*([^;]+)/i);
  if (filenameMatch) {
    let rawName = filenameMatch[1].trim();
    if (rawName.includes("''")) {
      const parts = rawName.split("''");
      rawName = decodeURIComponent(parts[1]);
    }
    filename = rawName.replace(/(^"|"$)/g, '');
  }
  filename = filename.replace(/[_\s]+$/g, '');
  if (!filename.includes('.') && contentType) {
    const ext = contentType.split('/')[1]?.split(';')[0];
    if (ext) filename = `${filename}.${ext}`;
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Table pagination utilities
const TABLE_PAGE_SIZE_KEY = 'admin_table_default_page_size';
const DEFAULT_PAGE_SIZE = 5;

export const getDefaultPageSize = () => {
  if (typeof window === 'undefined') return DEFAULT_PAGE_SIZE;
  
  try {
    const stored = localStorage.getItem(TABLE_PAGE_SIZE_KEY);
    if (stored) {
      const pageSize = parseInt(stored, 10);
      // Validate that the page size is one of the allowed values
      if ([5, 10, 20, 50, 100].includes(pageSize)) {
        return pageSize;
      }
    }
  } catch (error) {
    console.error('Error reading page size from localStorage:', error);
  }
  
  return DEFAULT_PAGE_SIZE;
};

export const setDefaultPageSize = (pageSize) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Validate that the page size is one of the allowed values
    if ([5, 10, 20, 50, 100].includes(pageSize)) {
      localStorage.setItem(TABLE_PAGE_SIZE_KEY, pageSize.toString());
    }
  } catch (error) {
    console.error('Error saving page size to localStorage:', error);
  }
};

/**
 * Convert timezone value from TIME_ZONES constant to IANA timezone format
 * @param {string} timezoneValue - The timezone value (e.g., 'Pacific Standard Time')
 * @returns {string} IANA timezone name (e.g., 'America/Los_Angeles') or the original value if not found
 */
export const getIANATimezone = (timezoneValue) => {
  if (!timezoneValue) return 'UTC';
  
  // If it's already an IANA timezone (contains '/'), return as is
  if (timezoneValue.includes('/')) {
    return timezoneValue;
  }
  
  // Find the timezone in TIME_ZONES constant
  const timezoneObj = TIME_ZONES.find(zone => zone.value === timezoneValue);
  
  if (timezoneObj) {
    // If utc array has entries, use those
    if (timezoneObj.utc && timezoneObj.utc.length > 0) {
      // Prefer major cities over generic timezones
      const majorCities = timezoneObj.utc.filter(tz => 
        tz.startsWith('America/') || 
        tz.startsWith('Asia/') || 
        tz.startsWith('Europe/') ||
        tz.startsWith('Australia/')
      );
      return majorCities.length > 0 ? majorCities[0] : timezoneObj.utc[0];
    }
    
    // If utc array is empty, extract offset from label/text (e.g., "(UTC-02:00)")
    const offsetMatch = (timezoneObj.text || timezoneObj.label || '').match(/UTC([+-]\d{2}):(\d{2})/);
    if (offsetMatch) {
      const hours = parseInt(offsetMatch[1], 10);
      const minutes = parseInt(offsetMatch[2], 10);
      
      // For whole-hour offsets, use Etc/GMT (INVERTED signs: UTC-2 = Etc/GMT+2)
      if (minutes === 0) {
        return `Etc/GMT${hours <= 0 ? '+' : '-'}${Math.abs(hours)}`;
      }
      
      // For fractional offsets, dynamically find another TIME_ZONES entry 
      // with the same offset that HAS a non-empty utc array
      const targetOffset = hours + (hours < 0 ? -minutes : minutes) / 60;
      const matchingZone = TIME_ZONES.find(zone => {
        const zoneOffset = zone.isdst ? zone.offset + 1 : zone.offset;
        return Math.abs(zoneOffset - targetOffset) < 0.01 
          && zone.utc && zone.utc.length > 0 
          && zone.value !== timezoneValue;
      });
      
      if (matchingZone) {
        const majorCities = matchingZone.utc.filter(tz =>
          tz.startsWith('America/') || 
          tz.startsWith('Asia/') || 
          tz.startsWith('Europe/') ||
          tz.startsWith('Australia/')
        );
        return majorCities.length > 0 ? majorCities[0] : matchingZone.utc[0];
      }
    }
  }
  
  // If not found, return UTC as fallback
  return 'UTC';
};

/**
 * Get user's current timezone and convert a given time to user's timezone (Calendly-style)
 * Works like Calendly: if event is 1pm PST, user in Pakistan will see it in their local time (e.g., 2am PKT next day)
 * 
 * @param {string|Date|dayjs.Dayjs} time - The time to convert (can be ISO string, Date object, or dayjs object)
 * @param {string} sourceTimezone - The source timezone (can be IANA format like 'America/Los_Angeles' or TIME_ZONES value like 'Pacific Standard Time')
 * @returns {Object} An object containing:
 *   - userTime: The time converted to user's timezone (dayjs object)
 *   - userTimezone: The user's current timezone string (e.g., 'Asia/Karachi')
 *   - userTimezoneOffset: The UTC offset for user's timezone (e.g., '+05:00')
 *   - sourceTimezone: The original source timezone (IANA format)
 *   - sourceTimezoneOffset: The UTC offset for source timezone (e.g., '-08:00')
 *   - formattedTime: The formatted time string in user's timezone (YYYY-MM-DD HH:mm:ss)
 *   - formattedTimeWithTZ: The formatted time string with timezone abbreviation (e.g., '2024-01-15 02:00:00 PKT')
 *   - formattedTimeDisplay: User-friendly formatted time (e.g., 'January 15, 2024 at 02:00 AM')
 *   - timeDifference: The time difference in hours between source and user timezone
 * 
 * @example
 * // Event at 1pm PST, user in Pakistan
 * const result = getUserTimeAndTimezone('2024-01-15T13:00:00', 'Pacific Standard Time');
 * // or
 * const result = getUserTimeAndTimezone('2024-01-15T13:00:00', 'America/Los_Angeles');
 * // Returns: { 
 * //   userTime: dayjs object (2am next day),
 * //   userTimezone: 'Asia/Karachi',
 * //   userTimezoneOffset: '+05:00',
 * //   sourceTimezone: 'America/Los_Angeles',
 * //   sourceTimezoneOffset: '-08:00',
 * //   formattedTime: '2024-01-16 02:00:00',
 * //   formattedTimeWithTZ: '2024-01-16 02:00:00 PKT',
 * //   formattedTimeDisplay: 'January 16, 2024 at 02:00 AM',
 * //   timeDifference: 13
 * // }
 */
export const getUserTimeAndTimezone = (time, sourceTimezone) => {
  try {
    // 1. Get user's current timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi';
    
    // 2. Resolve source timezone string
    const tz = sourceTimezone ? getIANATimezone(sourceTimezone) : 'UTC';
    
    let sourceTime;
    
    if (dayjs.isDayjs(time)) {
      // If it's already a dayjs object, convert it to source timezone
      sourceTime = time.tz(tz, true); // true = keepLocalTime
    } else {
      // Parse the time string - treat it as being in the source timezone
      const timeString = typeof time === 'string' ? time : time.toString();
      
      // Remove 'Z' if present - we want to interpret the time in source timezone, not UTC
      const cleanTime = timeString.replace(/[Zz]$/, '');
      
      // Parse the time as if it's in the source timezone
      // This means: if source timezone is UTC+2 and time is "13:00", 
      // we interpret it as 1pm in UTC+2, not 1pm UTC
      sourceTime = dayjs.tz(cleanTime, tz);
    }
    
    // 3. Convert to user's timezone
    // This will automatically calculate the correct time difference
    const userTime = sourceTime.tz(userTimezone);
    
    /**
     * FIX: Calculate time difference using minutes (.utcOffset())
     * parseFloat("05:30") results in 5.3, which is mathematically wrong for 5.5 hours.
     */
    const sourceOffsetMinutes = sourceTime.utcOffset();
    const userOffsetMinutes = userTime.utcOffset();
    const timeDifference = (userOffsetMinutes - sourceOffsetMinutes) / 60;
    
    return {
      userTime,
      userTimezone,
      userTimezoneOffset: userTime.format('Z'),
      sourceTimezone: tz,
      sourceTimezoneOffset: sourceTime.format('Z'),
      formattedTime: userTime.format('YYYY-MM-DD HH:mm:ss'),
      formattedTimeWithTZ: userTime.format('YYYY-MM-DD HH:mm:ss z'),
      formattedTimeDisplay: userTime.format('MMMM DD, YYYY [at] hh:mm A'),
      // Accurate to decimal hours (e.g., 5.5 for PKT vs GMT)
      timeDifference: Math.round(timeDifference * 100) / 100, 
    };
  } catch (error) {
    console.error('Error converting time to user timezone:', error);
    const fallbackTime = dayjs(time);
    return {
      userTime: fallbackTime,
      userTimezone: 'UTC',
      userTimezoneOffset: '+00:00',
      sourceTimezone: sourceTimezone || 'UTC',
      sourceTimezoneOffset: '+00:00',
      formattedTime: fallbackTime.format('YYYY-MM-DD HH:mm:ss'),
      formattedTimeDisplay: fallbackTime.format('MMMM DD, YYYY [at] hh:mm A'),
      timeDifference: 0,
    };
  }
};
