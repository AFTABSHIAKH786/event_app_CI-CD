Fix the docker images build 


to build the images run 

docker build -t name dockerfile 

to run the frontend 
docker run -p 5173:80 event_app

to run the server
doocker run -p 5000:5000 event_app_server