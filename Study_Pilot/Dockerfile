FROM node:22-alpine
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
# Lietotne darbojas kā parasts lietotājs (ne root)
USER node
CMD ["sh", "-c", "npm run migrate && npm start"]
