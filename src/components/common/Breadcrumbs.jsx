import { Fragment } from 'react';
import Link from 'next/link';
import CoreBreadcrumbs from '@mui/material/Breadcrumbs';
import { HiSlash } from 'react-icons/hi2';

const Breadcrumbs = ({ data = [], ...rest }) => {
  return (
    <CoreBreadcrumbs {...rest} separator={<HiSlash size={20} />}>
      {data.map((item, i, arr) => (
        <Fragment key={item.label}>
          {i === arr.length - 1 ? (
            <span className="text-sm md:text-md">{item.label}</span>
          ) : (
            <Link
              className="flex items-center gap-2 font-medium text-black hover:text-primary"
              href={item.href || '#'}
            >
              {item.Icon ? <item.Icon size={18} /> : null}
              <span className="hover:text-primary text-sm md:text-md">{item.label}</span>
            </Link>
          )}
        </Fragment>
      ))}
    </CoreBreadcrumbs>
  );
};

export default Breadcrumbs;
