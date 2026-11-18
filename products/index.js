async function getProducts() {
    const response = await fetch("http://localhost:3000/products");
    const products = await response.json();
    displayProducts(products);
}

function displayProducts(products) {
    console.log(products)

    const productsContainer = document.getElementById("productsContainer")

    productsContainer.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm col-3 mx-2";

        const img = document.createElement("img");
        img.src = product.image;
        img.className = "card-img-top";
        img.style.height = "200px";
        img.style.objectFit = "cover";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const name = document.createElement("h5");
        name.className = "card-title";
        name.textContent = product.name;

        const priceRatingContainer = document.createElement("div")
        priceRatingContainer.className = "d-flex justify-content-between align-items-center"

        const price = document.createElement("h4");
        price.className = "text-primary";
        price.textContent = product.price.toLocaleString("hu-HU") + " Ft";

        const rating = document.createElement("p");
        rating.className = "mb-2";
        rating.textContent = `⭐ ${product.rating}/5`;

        const more = document.createElement("a")
        more.textContent = "Több"
        more.className = "btn btn-link p-0";

        more.addEventListener("click", () => {
            manufacturer.classList.toggle("d-none");
            stock.classList.toggle("d-none");
            features.classList.toggle("d-none");

            more.textContent = manufacturer.classList.contains("d-none")
                ? "Több"
                : "Kevesebb";
        });

        const manufacturer = document.createElement("p");
        manufacturer.className = "text-muted mb-2";
        manufacturer.textContent = `${product.manufacturer.name} (${product.manufacturer.country})`;

        const stock = document.createElement("p");
        stock.className = "mb-2";
        stock.textContent = `Készlet: ${product.stock} db`;

        const features = document.createElement("ul");
        features.className = "list-group list-group-flush mb-3";

        product.features.forEach(feature => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = feature;
            features.appendChild(li);
        });

        manufacturer.className = "text-muted mb-2 d-none";
        stock.className = "mb-2 d-none";
        features.className = "list-group list-group-flush mb-3 d-none";

        const button = document.createElement("button");
        button.className = "btn btn-primary w-100";
        button.textContent = "Kosárba";

        cardBody.appendChild(name);
        priceRatingContainer.appendChild(price);
        priceRatingContainer.appendChild(rating);
        cardBody.appendChild(priceRatingContainer)
        cardBody.appendChild(more)
        cardBody.appendChild(manufacturer);
        cardBody.appendChild(stock);
        cardBody.appendChild(features);
        cardBody.appendChild(button);

        card.appendChild(img);
        card.appendChild(cardBody);

        productsContainer.appendChild(card);
    });
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const toast = document.createElement("div")
    const p = document.createElement("p")

    const name = document.getElementById("name").value
    const price = Number(document.getElementById("price").value)
    const stock = Number(document.getElementById("stock").value)
    const rating = Number(document.getElementById("rating").value)
    const manufacturerName = document.getElementById("manufacturerName").value
    const country = document.getElementById("manufacturerCountry").value
    const image = document.getElementById("image").value
    const features = document.getElementById("features").value
        .split(",")
        .map(feature => feature.trim())
        .filter(feature => feature !== "")

    try {

        if (name.length < 3 || name.length > 50 || !/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s-]+$/.test(name)) {
            throw new Error("A termék neve 3-50 karakter között legyen és csak betűket, számokat, szóközt és kötőjelet tartalmazhat!");
        }

        if (price <= 0 || !Number.isFinite(price)) {
            throw new Error("Az ár csak pozitív szám lehet!");
        }

        if (!Number.isInteger(stock) || stock < 0) {
            throw new Error("A készlet pozitív egész szám legyen!");
        }

        if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
            throw new Error("Az értékelés 0 és 5 közötti szám legyen!");
        }

        if (manufacturerName.length < 2 || manufacturerName.length > 50 || !/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s&.-]+$/.test(manufacturerName)) {
            throw new Error("A gyártó neve 2-50 karakter között legyen!");
        }

        if (country.length < 2 || country.length > 50 || !/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+$/.test(country)) {
            throw new Error("Az ország neve 2-50 karakter között legyen és csak betűket tartalmazhat!");
        }

        if (!/^https?:\/\/.+\..+/.test(image)) {
            throw new Error("Érvénytelen kép URL!");
        }

        if (features.length === 0 || features.some(feature => feature.length < 2 || feature.length > 50)) {
            throw new Error("Legalább egy tulajdonságot meg kell adni, 2-50 karakter között!");
        }

        const product = {
            name,
            price,
            stock,
            rating,
            manufacturer: {
                name: manufacturerName,
                country
            },
            image,
            features

        };

        const response = await fetch("http://localhost:3000/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error("Sikertelen mentés!");
        }

        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-success border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = "Sikeres felvétel!";

        document.getElementById("productForm").reset();
        getProducts()
    }
    catch (err) {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-danger border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = err.message;
    }

    toast.appendChild(p);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
});

document.getElementById("productIdFind").addEventListener("click", async () => {
    let productId = document.getElementById("productId").value

    if (productId == "") {
        getProducts()
        return
    }

    productId = Number(productId)

    const productsContainer = document.getElementById("productsContainer")

    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`);
        const product = await response.json();

        productsContainer.innerHTML = "";

        const card = document.createElement("div");
        card.className = "card h-100 shadow-sm col-3 mx-2";

        const img = document.createElement("img");
        img.src = product.image;
        img.className = "card-img-top";
        img.style.height = "200px";
        img.style.objectFit = "cover";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        const name = document.createElement("h5");
        name.className = "card-title";
        name.textContent = product.name;

        const priceRatingContainer = document.createElement("div")
        priceRatingContainer.className = "d-flex justify-content-between align-items-center"

        const price = document.createElement("h4");
        price.className = "text-primary";
        price.textContent = product.price.toLocaleString("hu-HU") + " Ft";

        const rating = document.createElement("p");
        rating.className = "mb-2";
        rating.textContent = `⭐ ${product.rating}/5`;

        const more = document.createElement("a")
        more.textContent = "Több"
        more.className = "btn btn-link p-0";

        more.addEventListener("click", () => {
            manufacturer.classList.toggle("d-none");
            stock.classList.toggle("d-none");
            features.classList.toggle("d-none");

            more.textContent = manufacturer.classList.contains("d-none")
                ? "Több"
                : "Kevesebb";
        });

        const manufacturer = document.createElement("p");
        manufacturer.className = "text-muted mb-2";
        manufacturer.textContent = `${product.manufacturer.name} (${product.manufacturer.country})`;

        const stock = document.createElement("p");
        stock.className = "mb-2";
        stock.textContent = `Készlet: ${product.stock} db`;

        const features = document.createElement("ul");
        features.className = "list-group list-group-flush mb-3";

        product.features.forEach(feature => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = feature;
            features.appendChild(li);
        });

        manufacturer.className = "text-muted mb-2 d-none";
        stock.className = "mb-2 d-none";
        features.className = "list-group list-group-flush mb-3 d-none";

        const button = document.createElement("button");
        button.className = "btn btn-primary w-100";
        button.textContent = "Kosárba";

        cardBody.appendChild(name);
        priceRatingContainer.appendChild(price);
        priceRatingContainer.appendChild(rating);
        cardBody.appendChild(priceRatingContainer)
        cardBody.appendChild(more)
        cardBody.appendChild(manufacturer);
        cardBody.appendChild(stock);
        cardBody.appendChild(features);
        cardBody.appendChild(button);

        card.appendChild(img);
        card.appendChild(cardBody);

        productsContainer.appendChild(card);

    } catch (err) {
        const p = document.createElement("p")
        p.textContent = "Nincs termék ilyen ID-vel!"
        p.className = "text-danger"
        productsContainer.appendChild(p)
    }
})

document.getElementById("showAll").addEventListener("click", async () => {
    document.getElementById("productId").value = ""
    getProducts()
})

document.getElementById("productIdDelete").addEventListener("click", async () => {
    let id = document.getElementById("deleteProductId").value

    const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE",
    });

    const toast = document.createElement("div")
    const p = document.createElement("p")

    if (response.ok) {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-success border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = "Termék sikeresen törölve!";
    } else {
        toast.className = "toast position-fixed top-0 start-0 m-3 p-3 show bg-danger border-0 shadow";
        p.className = "mb-0 fw-semibold text-white";
        p.textContent = "Hiba történt a törlés közben!";
    }

    toast.appendChild(p);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);

    getProducts()
})


getProducts()