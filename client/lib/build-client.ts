import axios from 'axios';

export default (headers?) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: 'https://metabloit.xyz',
      headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
};
