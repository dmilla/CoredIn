# cored.in

cored.in is a professional SocialFi app empowered with self-sovereign identity.

## Quick Start Notes

1.  Run `yarn && yarn build` to install all the dependencies and `yarn prepare` to setup Typia validation library (only first time)
2.  Run `yarn back-dev` to start your BackEnd dev environment (make sure to copy packages/backend/secrets-backend-local.json.example as secrets-backend-local.json)
3.  Run `yarn front-dev` to start your FrontEnd dev environment (make sure to copy packages/frontend/.env.example as .env.json)
OR
2. Run `yarn dev` to start both back and front dev environments

## Database
This project uses a posgreSQL DB, one sample instance could be run with `docker compose up -d postgres` inside packages/backend.

It can then be accessed directly with `psql -U dev_user -h localhost -p 5432 -d coredin_dev_db`.

Migrations can be generated from backend package with `yarn typeorm:generate db/migrations/<Migration description>` and ran with `yarn typeorm:migrate`.

## Technologies

This project is built with the following open source libraries, frameworks and languages. It uses typescript.
| Tech | Description |
| --------------------------------------------- | ------------------------------------------------------------------ |
| ------ | ------ React Frontend Environment ------ |
| [Vite JS](https://vitejs.dev/) | Next Generation Frontend Tooling |
| ------ | ------ Backend Framework ------ |
| [Nest JS](https://nestjs.com/) | A progressive Node.js framework for building efficient, reliable and scalable server-side applications |
| [TypeORM](https://typeorm.io/) | Typescript-first Object Relational Mapper (ORM) module for NestJS to easily work with PostgreSQL |
| [Nestia](https://github.com/samchon/nestia) | Simple and efficient data typing and input validation library |
| ------ | ------ CSS Framework ------ |
| [Chakra](https://chakra-ui.com/) | A simple, modular and accessible component library that gives you the building blocks you need to build your React applications |
| ------ | ------ CosmWASM Development Environment ------ |
| [CosmWASM](https://cosmwasm.com/) | RUST contract for smarts contracts development in COREUM |

## Adding packages

```
yarn workspace @coredin/backend add (package-name)

yarn workspace @coredin/frontend add (package-name)
```

## Building docker images

```
yarn docker
```

## Vault Setup

```
1. Run the openbao vault with the docker compose in packagaes/backend
2. Initialize the vault with `bao operator init -key-shares=1 -key-threshold=1` (run directly inside the running container, if you get a permission denied issue run `chmod -R 777 /vault` first)
3. Store the generated root access token and unseal key
4. Add the root access token to secrets_backend_local.json
5. Unseal the vault with `bao operator unseal` inside the running docker
6. Log into the vault with `bao login token=..`
7. Enable transit secrets engine with `bao secrets enable transit`
```