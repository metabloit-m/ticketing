import { jest } from "@jest/globals";

// export const natswrapper = {
//   client: {
//     jetstream: jest.fn().mockImplementation(() => {
//       return {
//         publish: jest.fn().mockImplementation((subject, data) => {
//           return {};
//         }),
//       };
//     }),
//   },
//   streamName: "stream_name",
// };
//

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
