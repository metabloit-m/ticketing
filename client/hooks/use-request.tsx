import axios from "axios";

export default ({ url, method, body, onSuccess }) => {
  const doRequest = async () => {
    try {
      const response = await axios[method](url, body);
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { doRequest };
};
