import React, { useContext, createContext, useState } from 'react';

// Define the context
const VendorContext = createContext();

// Export the provider as a component
export const VendorProvider = ({ children }) => {
  const [selectedVendor, setSelectedVendor] = useState(null);

  // The value that will be given to the context
  const value = { selectedVendor, setSelectedVendor };

  return <VendorContext.Provider value={value}>{children}</VendorContext.Provider>;
};

// Define and export the hook for consuming the context
export const useVendor = () => useContext(VendorContext);