# 1. Use official Node.js image
FROM node:16

# 2. Set working directory in container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy all backend files
COPY . .

# 6. Expose backend port
EXPOSE 5000

# 7. Start backend
CMD ["npm", "start"]
