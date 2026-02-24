// Ensure the "still" database exists by switching to it and writing a temp document.
db = db.getSiblingDB('still')
db.createCollection('init')
db.getCollection('init').drop()
