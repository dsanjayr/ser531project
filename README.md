# ser531project
Backend setup

​​docker pull mongo

docker run --name mongodb-container -d -p 27031:27017 -v mongodbdata:/data/db mongo

docker ps

cd backendv2 

node loadData.js 

node server.js


Frontend setup

cs Frontend
npm i
npm start
