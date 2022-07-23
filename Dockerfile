FROM public.ecr.aws/bitnami/node:16-debian-10
RUN mkdir -p /app
WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm i
COPY . .
RUN ls
RUN npm run build
EXPOSE 8081

RUN chmod +x start.sh

ENTRYPOINT ["./start.sh"]