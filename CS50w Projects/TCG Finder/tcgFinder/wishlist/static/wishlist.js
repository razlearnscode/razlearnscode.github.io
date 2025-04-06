document.addEventListener("DOMContentLoaded", () => {
    const cardContainer = document.getElementById("card-container");
    show_wishlist();
    
});

function show_wishlist() {
    
    fetch("/wishlist")
        .then(response => response.json())
        .then(decks => {
            const container = document.getElementById("card-container");
            container.innerHTML = "";  // Clear previous content

            decks.forEach(deck => {
                const section = document.createElement("section");
                section.classList.add("deck-section");

                const header = document.createElement("h2");
                header.textContent = `Deck: ${deck.deck}`;
                section.appendChild(header);

                const grid = document.createElement("div");
                grid.classList.add("card-grid");

                deck.cards.forEach(card => {
                    // Only show cards in the wishlist
                    if (!card.wishlist) return;

                    const cardEl = document.createElement("div");
                    cardEl.classList.add("card");

                    cardEl.innerHTML = `
                        <img src="/media/${card.local_image_path}" alt="${card.name}">
                        <h4>${card.name}</h4>
                        ${card.type ? `<p>Type: ${formatChoice(card.type)}</p>` : ""}
                        ${card.stage ? `<p>Stage: ${formatChoice(card.stage)}</p>` : ""}
                    `;

                    grid.appendChild(cardEl);
                });

                // Only show deck if it has wishlist cards
                if (grid.children.length > 0) {
                    section.appendChild(grid);
                    container.appendChild(section);
                }
            });
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
