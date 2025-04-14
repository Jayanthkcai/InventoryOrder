const config = {
  uri: "mongodb://admin:Password123@localhost:27017/databaseName?authSource=admin&retryWrites=true",
  options: {
    //useNewUrlParser: true,
    // useUnifiedTopology: true,
    user: "username",
    pass: "password",
    authSource: "admin",
    retryWrites: true,
  },
};

export default config;
