import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const FormError = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
      <ExclamationCircleIcon className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};

export default FormError;