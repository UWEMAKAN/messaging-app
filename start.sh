#!/bin/sh
#RUN MIGRATION COMMAND HERE
echo "RUN MIGRATIONS"
npm run migrate:up

echo "START SERVER";
npm run start:prod
