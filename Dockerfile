# Gunakan Node.js versi 14 sebagai base image
FROM node:14

# Tetapkan /app sebagai working directory di dalam container
WORKDIR /app

# Salin seluruh source code dari host ke working directory container
COPY . .

# Jalankan aplikasi dalam mode production dan gunakan container item-db sebagai host database
ENV NODE_ENV=production DB_HOST=item-db

# Install dependencies khusus production, lalu build aplikasi
RUN npm install --production --unsafe-perm && npm run build

# Informasikan bahwa aplikasi berjalan di port 8080
EXPOSE 8080

# Jalankan server saat container diluncurkan
CMD ["npm", "start"]
