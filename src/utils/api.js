import axios from "axios";

export const getRates = async (base = "USD") => {
  try {
    const response = await axios.get(`https://open.er-api.com/v6/latest/${base}`);
    return response.data.rates;
  } catch (error) {
    console.error("getRates error:", error);
    return null;
  }
};

/**

 * 
 * @param {string} base 
 * @param {string} symbol -
 * @param {string} startDate 
 * @param {string} endDate
 * @returns {object|null}
 */
export const getRateHistory = async (base = "USD", symbol = "INR", startDate, endDate) => {
  try {
   
    const url = `https://api.frankfurter.app/${startDate}..${endDate}?from=${base}&to=${symbol}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("getRateHistory error:", error);
    return null;
  }

};
