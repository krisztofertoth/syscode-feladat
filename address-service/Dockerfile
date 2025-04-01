FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Létrehozzuk a logs könyvtárat
RUN mkdir -p logs && chmod 777 logs

# Környezeti változók
ENV PORT=3001
ENV AUTH_USER=admin
ENV AUTH_PASSWORD=admin123
ENV NODE_ENV=development

EXPOSE 3001

# Fejlesztői módban nem kell build
CMD ["npm", "run", "dev"] 