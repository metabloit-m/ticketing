import axios from 'axios';

export default (headers?) => {
  if (typeof window === 'undefined') {
    return axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://metabloit.xyz',
      headers,
    });
  } else {
    return axios.create({
      baseURL: '/',
    });
  }
};
