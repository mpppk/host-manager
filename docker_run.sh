docker build -t mpppk/node-test .
docker run -w /app/src -p 3000:3000 --rm -it mpppk/node-test node index.js
