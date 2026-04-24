import React, { createContext, useState } from "react";

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [defaultFromCurrency, setDefaultFromCurrency] = useState("USD");
  const [defaultToCurrency, setDefaultToCurrency] = useState("INR");

  return (
    <CurrencyContext.Provider
      value={{
        defaultFromCurrency,
        defaultToCurrency,
        setDefaultFromCurrency,
        setDefaultToCurrency
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};