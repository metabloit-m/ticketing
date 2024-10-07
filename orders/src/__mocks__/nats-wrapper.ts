import { jest } from "@jest/globals";

const publishMock = jest.fn((subject, data) => {
  // console.log(subject, data);
  return {
    seq: 1,
  };
});

export const natswrapper = {
  client: {
    jetstream: jest.fn().mockImplementation(() => {
      return {
        publish: publishMock,
      };
    }),
  },
  streamName: "stream_name",
};
