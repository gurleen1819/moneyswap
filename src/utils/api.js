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
