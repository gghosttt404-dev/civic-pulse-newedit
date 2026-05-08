import handler from '../dist/server/index.js';

export const config = {
  runtime: 'edge',
};

export default async function (request) {
  return handler.fetch(request);
}
