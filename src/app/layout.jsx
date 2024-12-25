'use client';
import { Slide, ToastContainer } from 'react-toastify';
import ReactQueryProvider from '@/context/ReactQueryProvider';
import UIProvider from '@/context/UIProvider';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'nouislider/dist/nouislider.css';
import 'dropzone/dist/dropzone.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/css/satoshi.css';
import '@/css/simple-datatables.css';
import '@/css/style.css';
import '@/css/utilities.css';
import '@/css/global.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ReactQueryProvider>
          <UIProvider>
            <div className="dark:bg-boxdark-2 dark:text-bodydark">{children}</div>
          </UIProvider>
        </ReactQueryProvider>

        <ToastContainer
          transition={Slide}
          limit={4}
          position="bottom-right"
          theme="colored"
          hideProgressBar
        />
      </body>
    </html>
  );
}
