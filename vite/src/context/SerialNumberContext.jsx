import React, { createContext, useState, useContext } from 'react';

const SerialNumberContext = createContext();

export const useSerialNumber = () => useContext(SerialNumberContext);

export const SerialNumberProvider = ({ children }) => {
  const [serialNumber, setSerialNumber] = useState('');

  return (
    <SerialNumberContext.Provider value={{ serialNumber, setSerialNumber }}>
      {children}
    </SerialNumberContext.Provider>
  );
};

export default useSerialNumber;