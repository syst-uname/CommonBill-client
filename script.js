document.addEventListener('DOMContentLoaded', async function () {

  // общий конфиг   
  window.config = await getConfig()

  let tg = window.Telegram.WebApp
  console.log('==== tg', tg)

  // цвет темы
  const theme = window.Telegram.WebApp.colorScheme ?? window.config.THEME
  document.body.setAttribute('data-bs-theme', theme);

  // главная кнопка
  tg.MainButton.show();
  tg.MainButton.setText('Добавить');
  tg.MainButton.onClick(() => {
    sendData();
  });

  // вторая кнопка только в локальном тесте 
  if (window.config.ENV === 'local') {
    document.getElementById('local-submit-button').style.display = 'inline-block'
  }

  checkAndUpdateCache();
});

document.getElementById('local-submit-button').addEventListener('click', (event) => {
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
    return config
  } else {
    try {
      const response = await fetch('config.json')
      const data = await response.json()
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
    showToast(`Ошибка при загрузке настроек: ${error.message}`, 'error')
    console.error('Ошибка при загрузке настроек:', error)
    return null
  }
}

// Обновление страницы по параметрам из excel 
function updatePage(params) {

  try {
    // заголовок
    document.getElementById('form-title').textContent = params.title;

    // удаляем предыдущие элементы-настройки
    document.querySelectorAll('[data-removable]').forEach(el => el.remove());  // относится к dataset.removable

    // Валюты  
    const currList = document.getElementById('curr-list');
    params.currs.forEach(curr => {
      // input элемент
      const input = document.createElement('input');
      input.type = 'radio';
      input.classList.add('btn-check');
      input.name = 'curr';
      input.id = input.name + '-' + curr.id;
      input.value = curr.id;
      input.checked = curr.checked;
      input.dataset.removable = 'true';

      // label к нему
      const label = document.createElement('label');
      label.classList.add('btn', 'btn-outline-secondary');
      label.htmlFor = input.id;
      label.textContent = curr.title;
      label.dataset.removable = 'true';

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
  try {
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
  } catch (error) {
    showToast(`Ошибка при чтении cache: ${error.message}`, 'error')
    // могла быть ошибка с JSON.parse(cachedParams), поэтому нужно затереть параметры
    localStorage.setItem('cachedParams', null);
    console.error(error);
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

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const dataResponse = await response.json()
    console.log('==== отправка данных', dataResponse)

    if (dataResponse.status == 200) {
      showToast(dataResponse.message)
      document.getElementById('cost').value = ''
      document.getElementById('title').value = ''
    }
    return dataResponse
  } catch (error) {
    showToast(`Ошибка при отправке данных: ${error.message}`, 'error')
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
  // TODO это тоже костыль 
  if (!Array.isArray(obj.usersUse)) {
    obj.usersUse = [obj.usersUse]
  }
  return obj;
}

function showToast(message, type='success') {
  document.getElementById('toastText').textContent = message;
  const toast = document.getElementById('toast');
  if (type === 'success') {
    toast.classList.add('text-bg-success');
  } else {
    toast.classList.add('text-bg-danger');
  }
  new bootstrap.Toast(toast).show();
}

function showLog(data) {
  const testArea = document.getElementById('testArea');
  const formattedText = typeof data === 'object'
      ? JSON.stringify(data, null, 2)
      : String(data);

  testArea.textContent += '\n' + formattedText;
  testArea.scrollTop = testArea.scrollHeight;
}