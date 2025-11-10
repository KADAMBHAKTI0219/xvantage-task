'use client';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="absolute inset-0 rounded-full h-12 w-12 border-t-2 border-transparent opacity-30"></div>
      </div>
      <div className="ml-4 text-gray-600">
        <p className="text-lg font-medium">Loading contacts...</p>
        <p className="text-sm text-gray-500">Please wait a moment</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;