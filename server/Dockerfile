# Use the official Node.js image as base
FROM oven/bun:1.0.7

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN bun install --omit=dev

# Copy the entire project
COPY . .

# Expose the port that the app runs on
EXPOSE 5000

# Start the app
CMD ["bun", "index.js"]
