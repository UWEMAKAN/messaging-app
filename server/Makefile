DB_URL=postgresql://postgres:password@localhost:5432/cs_messaging?sslmode=disable

postgres:
	docker run --name pg1 -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres

createdb:
	docker exec -it pg1 createdb --username=postgres --owner=postgres cs_messaging

dropdb:
	docker exec -it pg1 dropdb --username=postgres cs_messaging

.PHONY: postgres createdb dropdb
