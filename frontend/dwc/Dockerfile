# 1. Select a base image. In this case, we're using a Node.js image.
FROM node:20.17.0-alpine

# 2. Set a working directory in the container
WORKDIR /app

# 3. Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# 4. Install the application dependencies.
RUN npm install

# 5. Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# 6. Build the Next.js app
RUN npm run build

# Set environment variables for the production environment
ENV NODE_ENV=production

# 7. Expose the port that your app runs on
EXPOSE 3000

# 8. The command to run your application
CMD [ "npm", "start" ]