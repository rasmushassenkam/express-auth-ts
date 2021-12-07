import { RedisClient } from "redis";

export const healthCheck = (redisClient: RedisClient) => {
  redisClient
    .on("connect", () => {
      console.log("redis connected");
      console.log(`connected ${redisClient.connected}`);
    })
    .on("error", (error) => {
      console.log(error);
    });
};
