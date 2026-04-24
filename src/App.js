import React, {
  useEffect,
  useState,
  useMemo,
  useContext
} from "react";
import axios from "axios";
import CurrencyDropdown from "./components/CurrencyDropdown";
import { CurrencyContext } from "./context/CurrencyContext";

function App() {
  const {
    defaultFromCurrency,
    defaultToCurrency
  } = useContext(CurrencyContext);

  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState(defaultFromCurrency);
  const [toCurrency, setToCurrency] = useState(defaultToCurrency);

  const [currencies, setCurrencies] = useState([]);
  const [rate, setRate] = useState(null);
  const [history, setHistory] = useState([]);

  const [darkMode, setDarkMode] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await axios.get(
          "https://open.er-api.com/v6/latest/USD"
        );

        if (res.data.result === "success") {
          setCurrencies(Object.keys(res.data.rates));
        }

        setLoading(false);
      } catch {
        setError("Failed to load currencies.");
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        setError("");

        if (fromCurrency === toCurrency) {
          setRate(1);
          return;
        }

        const res = await axios.get(
          `https://open.er-api.com/v6/latest/${fromCurrency}`
        );

        if (
          res.data.result === "success" &&
          res.data.rates[toCurrency]
        ) {
          const currentRate =
            res.data.rates[toCurrency];

          setRate(currentRate);

          // Save conversion history
          const newHistory = {
            from: fromCurrency,
            to: toCurrency,
            amount,
            result: (amount * currentRate).toFixed(2)
          };

          setHistory((prev) => [
            newHistory,
            ...prev.slice(0, 4)
          ]);
        }

      } catch {
        setError("Failed to fetch exchange rate.");
      }
    };

    fetchRate();
  }, [fromCurrency, toCurrency]);

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const convertedAmount = useMemo(() => {
    if (!rate) return 0;
    return (amount * rate).toFixed(2);
  }, [amount, rate]);

  if (loading) return <h2>Loading currencies...</h2>;

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <div className="converter-card">

        <div className="top-bar">
          <h1>Currency Converter</h1>

          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {error && (
          <p className="error-msg">{error}</p>
        )}

        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <div className="dropdown-container">
          <div className="currency-box">
            <label>From</label>
            <CurrencyDropdown
              currencies={currencies}
              selectedCurrency={fromCurrency}
              onChange={(e) =>
                setFromCurrency(e.target.value)
              }
            />
          </div>

          <button
            className="swap-btn"
            onClick={handleSwap}
          >
            Swap
          </button>

          <div className="currency-box">
            <label>To</label>
            <CurrencyDropdown
              currencies={currencies}
              selectedCurrency={toCurrency}
              onChange={(e) =>
                setToCurrency(e.target.value)
              }
            />
          </div>
        </div>

        <h2 className="result-text">
          {amount} {fromCurrency} =
          {convertedAmount} {toCurrency}
        </h2>

        <p className="rate-text">
          Current Rate: 1 {fromCurrency} =
          {rate} {toCurrency}
        </p>

        <div className="history-section">
          <h3>Recent Conversions</h3>

          {history.length === 0 ? (
            <p>No recent conversions</p>
          ) : (
            history.map((item, index) => (
              <div
                className="history-card"
                key={index}
              >
                {item.amount} {item.from} →
                {item.result} {item.to}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;