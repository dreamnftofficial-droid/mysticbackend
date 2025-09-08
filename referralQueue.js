// // referralQueue.js
// import { Queue, Worker } from 'bullmq';
// import IORedis from 'ioredis';
// import { adjustTeamsForUser, adjustLevelsForUser, distributeProfitsForUser } from './controllers/user.controller.js'; 

// const connection = new IORedis(process.env.REDIS_URL,{
//     maxRetriesPerRequest: null,   // ✅ required by BullMQ
//     enableReadyCheck: false  
// }); // Ensure this env is set

// const referralQueue = new Queue('referral-tasks', { connection });

// // Worker runs inside index.js
// const worker = new Worker('referral-tasks', async job => {
//   const { userId, task } = job.data;

//   if (task === 'adjustteams') {
//     await adjustTeamsForUser(userId);
//   } else if (task === 'adjustlevels') {
//     await adjustLevelsForUser(userId);
//   } else if (task === 'distribute') {
//     await distributeProfitsForUser(userId);
//   }
// }, { connection });

// export { referralQueue };
