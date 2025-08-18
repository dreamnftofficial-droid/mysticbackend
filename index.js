import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { app } from './app.js';
import { connectdb } from './db/dbconnection.js';
// import './referralQueue.js'; // 👈 this will auto-run the queue worker



const port = process.env.PORT || 8000;

connectdb().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at Port : ${port}`);
  });
}).catch((err) => {
  console.log(`Mongodb connection error :${err}`);
});
