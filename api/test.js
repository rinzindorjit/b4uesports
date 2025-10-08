async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  return response.status(200).json({
    message: "Serverless function is working!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: request.method,
    url: request.url
  });
}
export {
  handler as default
};
