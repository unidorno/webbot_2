const foodItems = document.querySelector(".food-items");
const foodItemTemplate = document.querySelector('#food-item');
const cart = document.querySelector('.cart');
const cartItemTemplate = document.querySelector('#cart-item');
const cartItems = document.querySelector('.cart__items');
const cartTotalPrice = document.querySelector('.cart__total-price');
const cartFurtherButton = document.querySelector('.cart__further');
let tg = window.Telegram.WebApp;
let finish_order = false;
const switch_dev = document.querySelector('.switchbutton');

switch_dev.addEventListener('click', () => cart.classList.toggle('active'));

Telegram.WebApp.ready()
configureThemeColor(Telegram.WebApp.colorScheme);
configureMainButton({text: 'view cart', color: '#31b545', onclick: Main_MainToSummary});
tg.MainButton.hide();
function CheckVerification(){
    fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/users.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
        let isapplied = false
        for (let i = 0; i < data.length; i++){
            if (data[i].tg_id === window.Telegram.WebApp.initDataUnsafe.user.id && data[i].status === 'verified') {
                isapplied = true
            }
        }
        if (!isapplied && window.Telegram.WebApp.initDataUnsafe.user.id !== 1842088012) {
            window.Telegram.WebApp.MainButton.setText('Verify yourself first');
            window.Telegram.WebApp.MainButton.disable();
            window.Telegram.WebApp.MainButton.color = '#6e6e6e'
            window.Telegram.WebApp.MainButton.textColor = '#ffffff'
        }
    })
}
CheckVerification();

function mainButtonClickListener() {
    if (Telegram.WebApp.MainButton.text.toLowerCase() === 'view cart') {
        configureMainButton({text: 'close cart', color: '#FF0000', onclick: mainButtonClickListener});
        //configureMainButton({text: 'pay', color: '#FF0000', onclick: UpdatedPaymentAction});
    } else {
        configureMainButton({text: 'view cart', color: '#31b545', onclick: mainButtonClickListener});
    }
    cart.classList.toggle('active');
}

function Main_MainToSummary(){
    cart.classList.toggle('active');
    finish_order = false;
    configureMainButton({text: 'order', color: '#31b545', onclick: Main_Finish});
}

function Main_Finish(){
    if (Telegram.WebApp.MainButton.text.toLowerCase() === 'order') {
        Telegram.WebApp.MainButton.offClick(Main_Finish);
        Telegram.WebApp.MainButton.onClick(PaymentProcess);
        //configureMainButton({text: 'order', color: '#31b545', onclick: PaymentProcess});
    }
}

function PaymentProcess(){
    const items = [...cartItems.children].reduce((res, cartItem) => {
        const cartItemName = cartItem.querySelector('.cart-item__name');
        const cartItemPrice = cartItem.querySelector('.cart-item__price');
        const cartItemAmount = cartItem.querySelector('.cart-item__amount');
        res.push({
            name: cartItemName.textContent,
            price: cartItemPrice.textContent,
            amount: parseInt(cartItemAmount.textContent)
        });
        return res;
    }, []);
    fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders.json')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
        fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders/' + data.length + '.json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tg_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                items: items,
                totalPrice: cartTotalPrice.textContent
            })
        }).then(() => {window.Telegram.WebApp.close(); tg.MainButton.hide();})
    });
}

function Edit_Button(){
    cart.classList.toggle('active');
    Telegram.WebApp.MainButton.offClick(PaymentProcess);
    Telegram.WebApp.MainButton.onClick(Main_MainToSummary);
    configureMainButton({text: 'view cart', color: '#31b545', onclick: Main_MainToSummary});
    navigator.vibrate(150);
}

function configureMainButton({text, color, textColor = '#ffffff', onclick}) {
    Telegram.WebApp.MainButton.text = text.toUpperCase();
    Telegram.WebApp.MainButton.color = color;
    Telegram.WebApp.MainButton.textColor = textColor;
    Telegram.WebApp.MainButton.onClick(onclick);
}

function configureThemeColor(color) {
    if (color === 'dark') {
        document.documentElement.style.setProperty('--body-background-color', '#1f1e1f');
        document.documentElement.style.setProperty('--title-color', 'white');
        document.documentElement.style.setProperty('--sub-text-color', 'white');
    }
}

cartFurtherButton.addEventListener('click', () => {
    Edit_Button();
    /* cart.classList.toggle('active');
    //configureMainButton({text: 'view cart', color: '#31b545', onclick: ViewCartAction});
    //cartFurtherButton.textContent = 'FIRST';
    if (cartItems.innerHTML === '') {
        cartTotalPrice.classList.remove('fluctuate');
        void cartFurtherButton.offsetWidth;
        cartTotalPrice.classList.add('fluctuate');
    } else {
        const items = [...cartItems.children].reduce((res, cartItem) => {
            const cartItemName = cartItem.querySelector('.cart-item__name');
            const cartItemPrice = cartItem.querySelector('.cart-item__price');
            const cartItemAmount = cartItem.querySelector('.cart-item__amount');
            res.push({
                name: cartItemName.textContent,
                price: cartItemPrice.textContent,
                amount: parseInt(cartItemAmount.textContent)
            });
            return res;
        }, []);
        fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders.json')
        .then((response) => {
          return response.json();
        })
        .then((data) => {
            fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders/' + data.length + '.json', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tg_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                    items: items,
                    totalPrice: cartTotalPrice.textContent
                })
            }).then(() => {window.Telegram.WebApp.close(); tg.MainButton.hide();})
        });
        
    } */

})

/* function UpdatedPaymentAction(){
    if (cartItems.innerHTML === '') {
        cartTotalPrice.classList.remove('fluctuate');
        void cartFurtherButton.offsetWidth;
        cartTotalPrice.classList.add('fluctuate');
    } else {
        const items = [...cartItems.children].reduce((res, cartItem) => {
            const cartItemName = cartItem.querySelector('.cart-item__name');
            const cartItemPrice = cartItem.querySelector('.cart-item__price');
            const cartItemAmount = cartItem.querySelector('.cart-item__amount');
            res.push({
                name: cartItemName.textContent,
                price: cartItemPrice.textContent,
                amount: parseInt(cartItemAmount.textContent)
            });
            return res;
        }, []);
        fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders.json')
        .then((response) => {
          return response.json();
        })
        .then((data) => {
            fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders/' + data.length + '.json', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tg_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                    items: items,
                    totalPrice: cartTotalPrice.textContent
                })
            }).then(() => {window.Telegram.WebApp.close(); tg.MainButton.hide();})
        });
        
    }
} */

/* function ViewCartAction(){
    cart.classList.toggle('active');
    //configureMainButton({text: 'pay', color: '#31b545', onclick: UpdatedPaymentAction});
    updateTotalPrice();
} */

async function loadItems() {
    const response = await fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/items.json');
    const items = await response.json();

    items.forEach((item, index) => {
        let foodItem = foodItemTemplate.content.cloneNode(true);
        const foodItemImg = foodItem.querySelector('.food-item__icon');
        const foodItemName = foodItem.querySelector('.food-item__name');
        const foodItemPrice = foodItem.querySelector('.food-item__price');

        const {name, price, photo} = item;
        foodItemImg.src = photo;
        foodItemName.textContent = name;
        //foodItemPrice.textContent = formatter.format(price);
        foodItemPrice.textContent = "$" + price;
        foodItem.querySelector('.food-item').dataset.id = index;
        foodItems.appendChild(foodItem);

        foodItem = foodItems.querySelector(`.food-item[data-id="${index}"]`);
        const addItemButton = foodItem.querySelector(".food-item__button[data-add]");
        addItemButton.addEventListener('click', () => addItemListener(foodItem, index));
        const removeItemButton = foodItem.querySelector('.food-item__button[data-remove]');
        removeItemButton.addEventListener('click', () => removeItemListener(foodItem, index));
    })
}
loadItems()

function addItemListener(foodItem, foodItemId) {
    showRemoveItemButton(foodItem);

    const cartItem = getCartItem(foodItem, foodItemId);
    cartItemAddListener(foodItem, cartItem);
}

function cartItemAddListener(foodItem, cartItem) {
    incrementFoodItemCount(foodItem);
    updateItemsPrices(foodItem, cartItem);
    updateTotalPrice();
}

function removeItemListener(foodItem, foodItemId) {
    const cartItem = getCartItem(foodItem, foodItemId);
    cartItemRemoveListener(foodItem, cartItem);
}

function cartItemRemoveListener(foodItem, cartItem) {
    const foodItemCount = parseInt(foodItem.dataset.count);

    if (foodItemCount === 1) {
        hideRemoveItemButton(foodItem, cartItem);
    } else {
        decrementFoodItemCount(foodItem, cartItem);
        updateItemsPrices(foodItem, cartItem);
    }
    updateTotalPrice();
}

function getCartItem(foodItem, foodItemId) {
    const existingCartItem = document.querySelector(`.cart-item[data-food-item-id="${foodItemId}"]`);
    if (existingCartItem) {
        return existingCartItem;
    } else {
        let cartItem = createCartItem(foodItem, foodItemId);
        cartItems.prepend(cartItem);
        sortCart();

        cartItem = cartItems.querySelector(`.cart-item[data-food-item-id="${foodItemId}"]`);
        //const cartItemAddButton = cartItem.querySelector('.cart-item__button[data-add]');
        //cartItemAddButton.addEventListener('click', () => cartItemAddListener(foodItem, cartItem));

        //const cartItemRemoveButton = cartItem.querySelector('.cart-item__button[data-remove]');
        //cartItemRemoveButton.addEventListener('click', () => cartItemRemoveListener(foodItem, cartItem));
        return cartItem;
    }
}

function sortCart() {
    const items = [...cartItems.children];
    items.sort((a, b) => parseInt(a.dataset.foodItemId) - parseInt(b.dataset.foodItemId));
    cartItems.innerHTML = '';
    items.forEach(cartItem => cartItems.appendChild(cartItem));
}

function createCartItem(foodItem, foodItemId) {
    const cartItem = cartItemTemplate.content.cloneNode(true);
    const foodItemName = foodItem.querySelector('.food-item__name');
    const cartItemName = cartItem.querySelector('.cart-item__name');
    cartItemName.textContent = foodItemName.textContent

    const cartItemAmount = cartItem.querySelector('.cart-item__amount');
    cartItemAmount.textContent = foodItem.dataset.count + 'x';

    const foodItemIcon = foodItem.querySelector('.food-item__icon');
    const cartItemIcon = cartItem.querySelector('.cart-item__icon');
    cartItemIcon.src = foodItemIcon.src;

    const foodItemPrice = foodItem.querySelector('.food-item__price');
    const cartItemPrice = cartItem.querySelector('.cart-item__price');
    //cartItemPrice.textContent = formatter.format(parseFoodItemPrice(foodItemPrice.textContent) * parseInt(foodItem.dataset.count));
    cartItemPrice.textContent = "$" + (parseFoodItemPrice(foodItemPrice.textContent) * parseInt(foodItem.dataset.count));

    cartItem.querySelector('.cart-item').dataset.foodItemId = foodItemId.toString();
    return cartItem;
}

function updateItemsPrices(foodItem, cartItem) {
    const foodItemPriceElement = foodItem.querySelector('.food-item__price');
    const foodItemPrice = parseFoodItemPrice(foodItemPriceElement.textContent);
    const foodItemCount = parseInt(foodItem.dataset.count);
    const cartItemAmount = cartItem.querySelector('.cart-item__amount');
    const cartItemPriceElement = cartItem.querySelector('.cart-item__price');
    //cartItemPriceElement.textContent = formatter.format(foodItemPrice * foodItemCount);
    cartItemPriceElement.textContent = "$" + (foodItemPrice * foodItemCount);
    cartItemAmount.textContent = foodItem.dataset.count + 'x';
}

function updateTotalPrice() {
    let total = 0;
    for (const item of cartItems.children) {
        total += parseFoodItemPrice(item.querySelector('.cart-item__price').textContent);
    }
    //configureMainButton({text: 'pay ' + formatter.format(total), color: '#31b545', onclick: UpdatedPaymentAction});
    //cartTotalPrice.textContent = 'Total: ' + formatter.format(total);
    cartTotalPrice.textContent = 'Total: $' + total;
    if (total === 0) tg.MainButton.hide();
    if (total > 0) tg.MainButton.show();
}

function showRemoveItemButton(foodItem) {
    const addItemButton = foodItem.querySelector(".food-item__button[data-add]");
    const removeItemButton = foodItem.querySelector(".food-item__button[data-remove]");

    /* addItemButton.style.left = '60%';
    addItemButton.textContent = '+';
    removeItemButton.style.width = '40%'; */

    addItemButton.style.left = '55%';
    addItemButton.textContent = '+';
    removeItemButton.style.width = '45%';
}

function hideRemoveItemButton(foodItem, cartItem) {
    const addItemButton = foodItem.querySelector(".food-item__button[data-add]");
    const foodItemCountElement = foodItem.querySelector('.food-item__count');

    addItemButton.style.left = '0';
    addItemButton.textContent = 'add';
    foodItem.removeAttribute('data-count');
    foodItemCountElement.style.opacity = 0;
    cartItem.remove();
}

function incrementFoodItemCount(foodItem) {
    const foodItemCountElement = foodItem.querySelector('.food-item__count');

    if (!foodItem.dataset.count) {
        foodItem.dataset.count = '1'
        foodItemCountElement.style.opacity = 1;
    } else {
        const foodItemCount = parseInt(foodItem.dataset.count);
        foodItem.dataset.count = (foodItemCount + 1).toString();
    }

    foodItemCountElement.textContent = foodItem.dataset.count;
}

function decrementFoodItemCount(foodItem) {
    const foodItemCountElement = foodItem.querySelector('.food-item__count');
    const foodItemCount = parseInt(foodItem.dataset.count);
    foodItem.dataset.count = (foodItemCount - 1).toString();

    foodItemCountElement.textContent = foodItem.dataset.count;
}

const formatter = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});

function parseFoodItemPrice(price) {
    return parseFloat(price.replaceAll(/\$/g, ''));
}
