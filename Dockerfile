FROM python:3.11.9-slim-bookworm

RUN apt-get update && apt-get install -y curl \
	&& curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
	&& apt-get install -y nodejs \
	&& npm install -g yarn \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY package.json yarn.lock ./
COPY python/requirements.txt ./python/


RUN yarn install --frozen-lockfile

COPY prisma ./prisma/

RUN npx prisma generate

RUN pip install --no-cache-dir -r ./python/requirements.txt

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]

