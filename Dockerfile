# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the custom Nginx configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build files from the previous build stage
COPY ./dist /usr/share/nginx/html


EXPOSE 80


# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
