FROM node:18-alpine

WORKDIR /app

# Telepítjük a TypeScript-t és nodemon-t globálisan
RUN npm install -g typescript nodemon

# Másoljuk a package.json és package-lock.json fájlokat
COPY package*.json ./

# Telepítjük a függőségeket
RUN npm install

# Másoljuk a forráskódot
COPY . .

# Build
RUN npm run build

# Létrehozzuk a logs könyvtárat
RUN mkdir -p logs && chmod 777 logs

# Környezeti változók
ENV NODE_ENV=development
ENV PORT=3000
ENV DB_NAME=student_db
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_HOST=db
ENV DB_PORT=5432
ENV ADDRESS_SERVICE_URL=http://host.docker.internal:3001

EXPOSE 3000

# Indítás
CMD ["npm", "start"] 