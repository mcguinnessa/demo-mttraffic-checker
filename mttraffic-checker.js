const db_tools = require('./mongo_tools');
const {MongoClient} = require('mongodb');

const DAY_S = 24 * 60 * 60;
const DAY_MS = DAY_S * 1000;
const HOUR_MS = 60 * 60 * 1000;
const INTERVAL_S = 60 * 60;
const INTERVAL_MS = INTERVAL_S * 1000;

const max_traffic = 5000000;
const min_traffic = 5000;
const min_variance = -2;
const max_variance = 2;

//nst hourly_weighting = [1,  2, 3, 4, 5, 6,  7,  8,  9   10, 11, 12, 13, 14 ,15, 16, 17, 18,  19,  20, 21, 22, 23, 24]
//const hourly_weighting = [10, 6, 2, 1, 3, 20, 40, 45, 50, 43, 64, 77, 90, 80, 90, 92, 95, 99, 100, 95, 75, 65, 30, 20]
const weekday_weighting = [ 8, 6, 2, 1, 2, 16, 32, 36, 40, 35, 52, 62, 72, 64, 72, 73, 76, 79, 80, 77, 60, 52, 24, 16]
const fri_weighting =     [10,  6, 2, 1, 3, 20, 40, 45, 50, 43, 64, 77, 85, 77, 90, 92, 95, 99, 100, 95, 96, 86, 83, 54]
const sat_weighting =     [20, 12, 7, 1, 3, 20, 40, 45, 50, 43, 64, 77, 90, 80, 99, 100, 99, 99, 100, 95, 97, 87, 80, 60]
const sun_weighting =     [20, 12, 7, 1, 3, 20, 40, 45, 50, 43, 64, 77, 90, 80, 90, 92, 80, 85, 87, 77, 60, 54, 23, 14]

const weekly_weighting = [sun_weighting, weekday_weighting, weekday_weighting, weekday_weighting, weekday_weighting, fri_weighting, sat_weighting]


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getValue(a_timestamp){
  var record_day = a_timestamp.getDay();
  const day = weekly_weighting[record_day]

  var record_hour = a_timestamp.getHours();
  const weighting = day[record_hour];

  const variance = (Math.random() * (max_variance - min_variance) + min_variance)

  mt_traffic = min_traffic +(((max_traffic - min_traffic) / 100) * (weighting + variance));

  if (mt_traffic < min_traffic){ mt_traffic = min_traffic}

  console.log("TIME:" + a_timestamp + " DAY:" + record_day + " HOUR:" + record_hour + " WEIGHTING:" + weighting + " VARIANCE:" + variance + " MT Traffic:" + mt_traffic);
  return mt_traffic;
}

async function run(){

  const uri = await db_tools.get_url();
  console.log("URI");
  console.log(uri);
  const client = new MongoClient(uri);

  try {
    const database = client.db(db_tools.DB_NAME);
    const metric_record = database.collection(db_tools.COLLECTION_NAME);
    var now = new Date();


//    metric_record.deleteMany({"$and": [{timestamp: {"$lt": now }}, { "mtTraffic": {$exists : true } }]} , (err, d_res) => {
//      if (err) throw err;
//      console.log("Delete:" + d_res.deleteCount);
//    })

    const d_res = await metric_record.deleteMany({"$and": [{timestamp: {"$lt": now }}, { "mtTraffic": {$exists : true } }]} )
    console.log("Delete:" + d_res.deletedCount);

//    var yesterday = new Date(now - DAY_MS);
//    var date_record = yesterday;
//    console.log("Yesterday:" + yesterday)

    var last_week = new Date(now - (DAY_MS * 7));
    var date_record = last_week;
    console.log("Last Week:" + last_week)


    while (date_record <= now){

      mt_traffic = await getValue(date_record); 
//      var record_hour = date_record.getHours();
//      weighting = hourly_weighting[record_hour];

 //     const ceiling = (max_cpu / 10) * weighting;
//      var cpu_usage = min_cpu + Math.floor(Math.random() * ceiling);
//      cpu_usage = (max_cpu / 10) * random_num;

      const doc = {
        timestamp: date_record,
        "mtTraffic": mt_traffic,
      }  

      const result = await metric_record.insertOne(doc);
      //console.log(`A document was inserted with the _id: ${result.insertedId}` + " CPU Temp:" + cpu_temp);
      //date_record = new Date(date_record.getTime() + INTERVAL_MS);
	    
      date_record = new Date(date_record.getTime() + INTERVAL_MS);
      //date_record.setMinutes(date_record.getMinutes() + 10);
      //console.log("DATE:" + date_record)
    }

    while (true) {
       console.log("Sleeping for " + INTERVAL_MS)
       await sleep(INTERVAL_MS);
       var right_now = new Date();
       mo_traffic = await getValue(right_now);
       const doc = {
         timestamp: right_now,
         "mtTraffic": mt_traffic,
       }  

       const result = await metric_record.insertOne(doc);
       console.log(`A document was inserted with the _id: ${result.insertedId}` + " MT Traffic:" + mt_traffic);
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
