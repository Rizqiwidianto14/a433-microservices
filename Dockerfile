# Gunakan Node.js 18 berbasis Alpine (ringan) sebagai base image
FROM node:18-alpine

# Tetapkan /app sebagai working directory di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json lebih dulu agar layer dependency bisa di-cache
COPY package*.json ./

# Install dependency persis sesuai package-lock.json, tanpa devDependencies
RUN npm ci --omit=dev

# Salin seluruh source code (termasuk .env) ke working directory
COPY . .

# Jalankan aplikasi dalam mode production
ENV NODE_ENV=production

# Informasikan port yang digunakan aplikasi
EXPOSE 3001

# Jalankan aplikasi langsung dengan node agar sinyal SIGINT/SIGTERM diterima aplikasi
CMD ["node", "index.js"]
