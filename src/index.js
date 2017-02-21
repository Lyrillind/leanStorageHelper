import AV from 'leancloud-storage';
import leanConfig from '../leanConfig';

AV.init(leanConfig);

const MAX_DATA_COUNT = 1000;
const isStg = true;
const tempDataClass = 'binding';

let processCount = 0;
let tempObjects = {};

function isDataValid(data) {
  if (!data.userId || data.userId.length <= 0
      || !data.deviceId || data.deviceId.length <= 0) {
    return false;
  }
  const datas = tempObjects[data.userId];
  if (!datas) { return true; }
  for (let i = 0; i < datas.length; i++) {
    const obj = datas[i];
    const deviceId = obj.get('deviceId');
    if (deviceId === data.deviceId) {
      return false;
    }
  }
  return true;
}

let dataCount = 0;
const MapData = AV.Object.extend(`UserDeviceMap${isStg ? '_stg' : ''}`);
function processBindingData(callback) {
  const query = new AV.Query(`${tempDataClass}{isStg ? '_stg' : ''}`);
  query.limit(MAX_DATA_COUNT);
  query.skip(MAX_DATA_COUNT * processCount);
  query.find().then((results) => {
    if (!results || results.length <= 0) { callback && callback(); return; }
    dataCount += results.length;
    for (let i = 0; i < results.length; i++) {
      const data = results[i];
      const userId = data.get('userId');
      const deviceId = data.get('deviceId');
      if (isDataValid({userId, deviceId})) {
        let mapData = new MapData();
        mapData.set('userId', userId);
        mapData.set('deviceId', deviceId);
        if (tempObjects[userId]) {
          tempObjects[userId].push(mapData);
        } else {
          tempObjects[userId] = [mapData];
        }
      }
    }
    processCount++;
    console.log(`处理 ${dataCount} 条数据: ${Date.now() - startTime}ms`);
    processBindingData(callback);
  }, (error) => {
    console.error(error);
  });
}

function findMostRecentTwoRecord(datas) {
  if (!datas || datas.length <= 2) { return datas; }
  const newDatas = datas.slice(0);
  newDatas.sort((a, b) => {
    return b.get('createdAt') - a.get('createdAt');
  });
  return newDatas.slice(0, 2);
}

let startTime = Date.now();
processBindingData(() => {
  let objects = [];
  for (let userId in tempObjects) {
    if (tempObjects.hasOwnProperty(userId)) {
      const datas = tempObjects[userId];
      if (datas.length > 2) {
        objects = objects.concat(findMostRecentTwoRecord(datas));
      } else {
        objects = objects.concat(datas);
      }
    }
  }

  AV.Object.saveAll(objects).then((objs) => {
    console.log(`成功保存了 ${objs.length} 条数据`);
  }, (error) => {
    console.error(error);
  });
});
