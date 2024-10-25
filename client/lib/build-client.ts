import axios from 'axios';

export default (headers?) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'http://localhost:3000',
      headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
};
