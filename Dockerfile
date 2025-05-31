# Usa la imagen oficial de Node.js como base
FROM node:16

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el archivo package.json y package-lock.json (si existe) para instalar las dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente al contenedor
COPY . .

# Expone el puerto en el que la aplicación estará corriendo (3000)
EXPOSE 3000

# El comando para iniciar la aplicación
CMD ["node", "server.js"]
