
module.exports = {
  hello (event, context) {
    return JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      url: event.extensions.request.url,
      });
  },
};
