document.addEventListener('DOMContentLoaded', async function () {

  // общий конфиг   
  window.config = await getConfig()

  let tg = window.Telegram.WebApp
  console.log('==== tg', tg)

  // цвет темы
  const theme = window.Telegram.WebApp.theme ? window.Telegram.WebApp.theme : window.config.THEME
  document.body.setAttribute('data-bs-theme', theme);

  // главная кнопка
  tg.MainButton.show();
  tg.MainButton.setText('Отправить');
  tg.MainButton.onClick(() => {
    console.log('==== Главная кнопка Clicked')
    tg.ready();
    tg.sendData(JSON.stringify({ type: 'mainButtonClicked', value: '1', cost: 'data' }));
  });

  checkAndUpdateCache();
});

document.getElementById('submit-button').addEventListener('click', (event) => {
  event.preventDefault();
  sendData();
});

// Выделить все валюты/снять выделение 
document.getElementById('selectAllUsersUse').addEventListener('click', (event) => {
  const users = document.querySelectorAll('input[name="usersUse"]');
  users.forEach(user => user.checked = true);
});

document.getElementById('deselectAllUsersUse').addEventListener('click', (event) => {
  const users = document.querySelectorAll('input[name="usersUse"]');
  users.forEach(user => user.checked = false);
});

// конфиг 
async function getConfig() {
  if (window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const config = {
      SERVER_ID: urlParams.get('sid')
    }
    console.log('==== конфиг из window.location.search', config)
    return config
  } else {
    try {
      const response = await fetch('config.json')
      const data = await response.json()
      console.log('==== конфиг из json', data)
      return data
    } catch (error) {
      console.error('Ошибка при загрузке конфига:', error)
      return null
    }
  }
}

// Получение параметров страницы 
async function fetchParams() {
  try {
    const userId = window.Telegram.WebApp.initDataUnsafe.user ? window.Telegram.WebApp.initDataUnsafe.user.id : window.config.USER_ID
    const url = `https://script.google.com/macros/s/${window.config.SERVER_ID}/exec`
    const body = {
      type: 'getParams',
      userId: userId
    }
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const data = await response.json()
    console.log('==== настройки', data)
    return data
  } catch (error) {
    console.error('Ошибка при загрузке настроек:', error)
    return null
  }
}

// Обновление страницы по параметрам из экселя 
function updatePage(params) {

  try {
    document.title = params.title;

    // Валюты  
    const currList = document.getElementById('curr-list');
    // currList.innerHTML = '';    // чтобы не двоились значения когда подгрузятся новые данные // нет, очищает и само поле ввода  
    params.currs.forEach(curr => {
      // input элемент
      const input = document.createElement('input');
      input.type = 'radio';
      input.classList.add('btn-check');
      input.name = 'curr';
      input.id = input.name + '-' + curr.id;
      input.value = curr.id;

      // label к нему
      const label = document.createElement('label');
      label.classList.add('btn', 'btn-outline-secondary');
      label.htmlFor = input.id;
      label.textContent = curr.title;

      currList.appendChild(input);
      currList.appendChild(label);
    });

    // Заплатил 
    const userPayList = document.getElementById('userPay-list');
    userPayList.innerHTML = '';
    params.users.forEach(user => {
      // input элемент
      const input = document.createElement('input');
      input.type = 'radio';
      input.classList.add('btn-check');
      input.name = 'userPay';
      input.id = input.name + '-' + user.id;
      input.value = user.id;

      // label к нему
      const label = document.createElement('label');
      label.classList.add('btn', 'btn-outline-secondary');
      label.htmlFor = input.id;
      label.textContent = user.title;

      userPayList.appendChild(input);
      userPayList.appendChild(label);
    });

    // Пользовались 
    const usersUseList = document.getElementById('usersUse-list');
    usersUseList.innerHTML = '';
    params.users.forEach(user => {
      // input элемент
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.classList.add('btn-check');
      input.name = 'usersUse';
      input.id = input.name + '-' + user.id;
      input.value = user.id;

      // label к нему
      const label = document.createElement('label');
      label.classList.add('btn', 'btn-outline-secondary');
      label.htmlFor = input.id;
      label.textContent = user.title;

      usersUseList.appendChild(input);
      usersUseList.appendChild(label);
    });

  } catch (error) {
    console.error('Ошибка при формировании страницы:', error);
  }
}

// Проверка и обновления кеша
async function checkAndUpdateCache() {
  const cachedParams = localStorage.getItem('cachedParams');

  // Если есть кешированные данные, отображаем их
  if (cachedParams) {
    updatePage(JSON.parse(cachedParams));
  }

  // return  // TODO: вернуть, чтобы не делал постоянные запросы 

  // Получаем новые данные
  const newParams = await fetchParams();
  if (newParams) {
    const newParamsString = JSON.stringify(newParams);

    // Если данные изменились, обновляем кеш и страницу
    if (!cachedParams || newParamsString !== cachedParams) {
      localStorage.setItem('cachedParams', newParamsString);
      updatePage(newParams);
    }
  }
}

// отправка данных
async function sendData() {
  try {
    const form = document.getElementById('form-payload');
    const formData = new FormData(form);
    const data = formDataToObject(formData)

    const userId = window.Telegram.WebApp.initDataUnsafe.user ? window.Telegram.WebApp.initDataUnsafe.user.id : window.config.USER_ID   // куда-то выделить

    const url = `https://script.google.com/macros/s/${window.config.SERVER_ID}/exec`
    const body = {
      type: 'putData',
      userId: userId,
      payload: data
    }

    console.log('==== body для отправки', body)

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const dataResponse = await response.json()
    console.log('==== отправка данных', dataResponse)
    return dataResponse
  } catch (error) {
    console.error('Ошибка при отправке данных:', error)
    return null
  }
}

function formDataToObject(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    if (obj.hasOwnProperty(key)) {
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
}