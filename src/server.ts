import app from './app';
import db from './config/db';
import config from './config/env';
import "./config/zod"


app.listen(config.port,async() => {
  try{
    await db.execute("SELECT 1")
    console.log('database connected')
    console.log(`Server running on port ${config.port}`);
  }catch(error){
    const message = {
      message: "connect fail",
      error: error
    }
    console.log(message)
  }
});