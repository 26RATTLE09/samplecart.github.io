// import "babel-core/register";
// import "babel-polyfill";


// Variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDom = document.querySelector('.product-center');
const totalItem = document.querySelector('.total-item');
// const fetch = require("node-fetch");


//Cart Items
let cart = [];
let buttonDom = [];

//Products
class Products {
    discount;
    price;
    async getProducts(){
        try{
            let result = await fetch("cart.json");
            let data = await result.json();
            // return data;
            let product = data.items;
            product.map(item => {
                // console.log(item);
                const discount = item.discount;
                const name = item.name;
                const actual = item.price.actual;
                const display = item.price.display;
                const image = item.image;
                const id = item.id;
                return {id,discount,name,actual,display,image}
                // console.log(actual);
            });
            return product;
        } catch(error) {
// console.log(error);
        }
    }
}

// UI class
class UI{

    displayProducts = (products) => {
        // console.log(products);
        let result = '';

        products.forEach(product => {
             // console.log(product);
            result += `
            <article class="product">
            <div class="img-container">
                <img src="${product.image}" alt="product" class="product-img">
                <button class="bag-btn" data-id="${product.id}">
                    <i class="fas fa-shopping-cart">Add To Bag</i>
                </button>
                <h3>${product.name}</h3>
                <h4>$${product.price.actual}</h4>
            </div>
        </article>
            `;
        });

        productDom.innerHTML = result;
        // console.log(result);

    };

    getBagButtons = () =>
    {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonDom = buttons;
        // console.log(buttons);
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id == id);
            if(inCart)
            {
                button.innerText = 'In Cart';
                button.disabled = true;
            }

                button.addEventListener("click",event => {
                    event.target.innerText = 'In Cart';
                    event.target.disabled = true;
                    //get product from products
                    let cartItem = {...Storage.getProducts(id), amount: 1};
                    // console.log(cartItem);
                    //add product to the cart
                    cart = [...cart, cartItem];
                    //save cart in local storage
                    Storage.saveCart(cart);
                    //set cart values
                    this.setCartValues(cart);
                    //display cart item
                    this.addCartItem(cartItem);
                    //show the cart
                    this.showCart();
                });
        });
    }

    setCartValues = (cart) =>
    {
        let tempTotal = 0;
        let itemTotal = 0;
        cart.map(item => {
            // console.log(item);
            tempTotal += item.price.actual * item.amount;
            itemTotal += item.amount;

        });
        cartItems.innerText = itemTotal;
        totalItem.innerText = 'Total Item in Cart: ' + itemTotal;
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        // buttonDom.innerText = 'In Cart';
        // console.log(cartTotal,cartItems);
    }

    addCartItem = (item) =>
    {

        let div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="product">
                <h4>${item.name}</h4>
                <h5>${item.price.actual}</h5>
                <span class="remove-item" data-id=${item.id}>Remove</span>
                <div>
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="item-amount">1</p>
                    <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>`;
        cartContent.appendChild(div);

        // console.log(cartContent);
    }

    showCart = () =>
    {
        cartOverlay.classList.add('transparentBcg');
        cartDom.classList.add('showCart');

    }

    setUpApp = () =>
    {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart = (cart) =>
    {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart = () =>
    {
        cartOverlay.classList.remove('transparentBcg');
        cartDom.classList.remove('showCart');
    }

    cartLogic = () =>
    {
        clearCartBtn.addEventListener('click', () =>
        {
            this.clearCart();
        });

        //Cart functionality
        cartContent.addEventListener('click', event => {
            // console.log(event.target);
            if(event.target.classList.contains('remove-item'))
            {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement);
                this.removeItem(id);
            }

            else if(event.target.classList.contains('fa-chevron-up'))
            {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempId = cart.find(item => item.id == id);
                tempId.amount = tempId.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempId.amount;
            }

            else if (event.target.classList.contains('fa-chevron-down'))
            {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount = tempItem.amount - 1;
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
                if(tempItem.amount > 0)
                {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                }
                else
                {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                    // console.log(lowerAmount);
                }
            }
        });
    }

    clearCart = () =>
    {
        let cartItems = cart.map(item => item.id);
        cartItems.map(id => this.removeItem(id));
        while(cartContent.children.length > 0)
        {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem = (id) =>
    {
        cart = cart.filter(item => item.id != id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add To bag`;


    }

    getSingleButton = (id) =>
    {
        return buttonDom.find(button => button.dataset.id == id);
    }
}

//Local storage class

class Storage{
    static saveProducts = (product) =>
    {
        localStorage.setItem('products', JSON.stringify(product));
    }

    static getProducts = (Id) =>
    {

        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id == Id);

    }

    static saveCart = (cart) =>
    {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getCart = () =>
    {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart'))
        : [];
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    // AppSetup

    ui.setUpApp();

    //Get the products

    products.getProducts().then(products =>
    {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});

