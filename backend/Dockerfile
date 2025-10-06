FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ARG for build-time selection
ARG NODE_ENV=docker
ENV NODE_ENV=${NODE_ENV}

# Copy correct .env file at build time
RUN if [ "$NODE_ENV" = "production" ] && [ -f .env.production ]; then cp .env.production .env; \
    elif [ "$NODE_ENV" = "docker" ] && [ -f .env.docker ]; then cp .env.docker .env; \
    elif [ -f .env.development ]; then cp .env.development .env; \
    fi

EXPOSE 5000
CMD ["npm", "run", "start"]
