const foodItems = document.querySelector(".food-items");
const shopclosed = document.querySelector(".shop-closed");
const openhours = document.querySelector(".shopclosed_hours");
const foodItemTemplate = document.querySelector('#food-item');
const cart = document.querySelector('.cart');
const cartItemTemplate = document.querySelector('#cart-item');
const cartItems = document.querySelector('.cart__items');
const cartDeliveryFee = document.querySelector('.cart__total-price');
const cartFurtherButton = document.querySelector('.cart__further');
const loc_button = document.querySelector('.loc_button');
const custom_location = document.querySelector('.custom_location');
let tg = window.Telegram.WebApp;
let finish_order = false;
let min_price = 0;
let delivery_fee = 0;
let location_info = []

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
            window.Telegram.WebApp.MainButton.setText('VERIFY YOURSELF FIRST');
            window.Telegram.WebApp.MainButton.show();
            window.Telegram.WebApp.MainButton.disable();
            window.Telegram.WebApp.MainButton.color = '#6e6e6e'
            window.Telegram.WebApp.MainButton.textColor = '#ffffff'
        }
    })
}

fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/presets.json')
.then((response) => {
    return response.json();
})
.then((data) => {
    min_price = data.min_price;
    delivery_fee = data.delivery_fee;
})

const switch_dev = document.querySelector('.switchbutton');
switch_dev.addEventListener('click', () => cart.classList.toggle('active'));
Telegram.WebApp.ready();
configureThemeColor(Telegram.WebApp.colorScheme);
configureMainButton({text: 'view cart', color: '#31b545', onclick: Main_MainToSummary});
tg.MainButton.hide();
//tg.BackButton.onClick(Edit_Button);
//tg.BackButton.hide();
tg.expand();
console.log(tg.version);
fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/open_hours.json')
.then((response) => {
    return response.json();
})
.then((data) => {
    let unix_timestamp = window.Telegram.WebApp.initDataUnsafe.auth_date;
    var date = new Date(unix_timestamp * 1000);
    let utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    let timeOfffset = -7
    let time_now = new Date(utcTime + (3600000 * timeOfffset))
    /*var hours = time_now.getHours();
    var minutes = "0" + time_now.getMinutes();
    var seconds = "0" + time_now.getSeconds();
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    console.log(formattedTime); */
    let now = time_now.getHours() + "." + time_now.getMinutes();
    let weekdays = [
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
        data[6]
    ];
    let day = weekdays[time_now.getDay()];
    if (now > day[1] && now < day[2] || now > day[3] && now < day[4]) {
        console.log("We're open right now!");
        CheckVerification();
    }
    else {
        shopclosed.classList.toggle('active');
        if (day.length === 4) openhours.textContent = 'Open Hours: ' + day[3];
        if (day.length === 6) openhours.textContent = 'Open Hours: ' + day[5];
        
        tg.MainButton.hide();
    }
})

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
    //tg.HapticFeedback.impactOccurred("heavy");
    updateTotalPrice();
}

function Main_Finish(){
    if (Telegram.WebApp.MainButton.text.toLowerCase() === 'order') {
        //Telegram.WebApp.BackButton.show();
        Telegram.WebApp.MainButton.offClick(Main_Finish);
        Telegram.WebApp.MainButton.onClick(PaymentProcess);
        //configureMainButton({text: 'order', color: '#31b545', onclick: PaymentProcess});
        //tg.HapticFeedback.impactOccurred("medium");
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
        //tg.HapticFeedback.notificationOccurred("success");
        fetch('https://upperrestaurant-default-rtdb.europe-west1.firebasedatabase.app/durgerking/orders/' + data.length + '.json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tg_id: window.Telegram.WebApp.initDataUnsafe.user.id,
                items: items,
                totalPrice: parseFloat(Telegram.WebApp.MainButton.text) /* cartDeliveryFee.textContent */
            })
        }).then(() => {window.Telegram.WebApp.close(); tg.MainButton.hide();})
    });
}

function Edit_Button(){
    cart.classList.toggle('active');
    Telegram.WebApp.MainButton.offClick(PaymentProcess);
    Telegram.WebApp.MainButton.onClick(Main_MainToSummary);
    configureMainButton({text: 'view cart', color: '#31b545', onclick: Main_MainToSummary});
    updateTotalPrice();
    //tg.HapticFeedback.impactOccurred("medium");
    //Telegram.WebApp.BackButton.hide();
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
})

loc_button.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        console.log("Geolocation is not supported by this browser.");
    }
})

function showPosition(position) {
    loc_button.textContent = '✅ LOCATION SENT';
    console.log("Latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);
    location_info[window.Telegram.WebApp.initDataUnsafe.user.id] = position.coords.latitude + ',' + position.coords.longitude;
    updateTotalPrice();
}

custom_location.addEventListener('change', (event) => {
    console.log(event.target.value);
    location_info[window.Telegram.WebApp.initDataUnsafe.user.id] = event.target.value;
    updateTotalPrice();
});

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
        if (foodItemName.textContent.length > 10) foodItemName.style.fontSize = '12px';
        if (foodItemName.textContent.length > 25) foodItemName.style.fontSize = '10px';
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
    //cartItemAmount.textContent = foodItem.dataset.count + 'x';
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
    //cartItemAmount.textContent = foodItem.dataset.count + 'x';
    cartItemAmount.textContent = foodItem.dataset.count + ' x';
}

function updateTotalPrice() {
    let total = 0;
    for (const item of cartItems.children) {
        total += parseFoodItemPrice(item.querySelector('.cart-item__price').textContent);
    }
    //configureMainButton({text: 'pay ' + formatter.format(total), color: '#31b545', onclick: UpdatedPaymentAction});
    //cartTotalPrice.textContent = 'Total: ' + formatter.format(total);
    cartDeliveryFee.textContent = '🚚 Delivery Fee: $' + delivery_fee;
    if (total === 0) tg.MainButton.hide();
    if (total > 0) {
        tg.MainButton.show();
        let button_textt = Telegram.WebApp.MainButton.text.toLowerCase();
        if (button_textt.includes('view cart')) {
            Telegram.WebApp.MainButton.text = 'VIEW CART $' + total;
            if (total < min_price) {
                tg.MainButton.text = 'ORDER TOTAL SHOULD BE AT LEAST ' + min_price;
                tg.MainButton.disable();
            }
            if (total >= min_price) tg.MainButton.enable();
        }
        if (button_textt.includes('order')) {
            if (location_info[window.Telegram.WebApp.initDataUnsafe.user.id] === null || location_info[window.Telegram.WebApp.initDataUnsafe.user.id] === undefined) {
                Telegram.WebApp.MainButton.text = 'SHARE YOUR LOCATION';
                Telegram.WebApp.MainButton.disable();
            }
            else {
                Telegram.WebApp.MainButton.text = 'ORDER $' + (total + delivery_fee);
                Telegram.WebApp.MainButton.enable();
            }
        }
    }

    //tg.HapticFeedback.selectionChanged();
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
