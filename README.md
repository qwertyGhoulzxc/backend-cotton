TODO:
on the whole app and throtalle
test all backend
statistics for all decks
dto not using "," in category name

.... think about changing complexity and algorithm on server or client implementation

cards per session for every desk
add categories
//TODO:
add entity session
fix last studies

for categories new table

add time for session\

to trigger updatedAt
await prisma.deck.update({
where: { id: deckId },
data: { updatedAt: new Date() },
});

//NOT MVP
achivements

realize favorites maybe in the profile (add like default category)

//client TODO:

- make pagination on categories and like infinity load

- set timer on resend codes
