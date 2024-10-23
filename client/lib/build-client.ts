import axios from 'axios';

export default (headers?) => {
  if (typeof window === 'undefined') {
    return axios.create({
      headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
};
