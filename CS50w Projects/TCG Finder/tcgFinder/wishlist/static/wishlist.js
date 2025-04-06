document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.getElementById("card-container");




    const decks = window.cardData;

    decks.forEach(deck => {
        const deckSection = document.createElement("section");
        deckSection.classList.add("deck-section");

        // Deck header
        const deckHeader = document.createElement("h2");
        deckHeader.textContent = `Deck: ${deck.deck_id}`;
        deckSection.appendChild(deckHeader);

        // Card grid container
        const grid = document.createElement("div");
        grid.classList.add("card-grid");

        deck.cards.forEach(card => {
            const cardDiv = document.createElement("div");
            cardDiv.classList.add("card");

            cardDiv.innerHTML = `
                <img src="/media/${card.local_image_path}" alt="${card.name}">
                <h4>${card.name}</h4>
                ${card.type ? `<p>Type: ${formatChoice(card.type)}</p>` : ""}
                ${card.stage ? `<p>Stage: ${formatChoice(card.stage)}</p>` : ""}
            `;

            grid.appendChild(cardDiv);
        });

        deckSection.appendChild(grid);
        cardContainer.appendChild(deckSection);
    });
});

function show_wishlist() {
    
    fetch('/wishlist')
    .then((response) => response.json())
    .then((deck) => {

        
    });
}

function formatChoice(choice) {
    // Converts "POKÉMON" → "Pokémon"
    const mapping = {
        "POKÉMON": "Pokémon",
        "TRAINER": "Trainer",
        "BASIC": "Basic",
        "STAGE1": "Stage 1",
        "STAGE2": "Stage 2",
        "OTHERS": "Others"
    };
    return mapping[choice] || choice;
}
