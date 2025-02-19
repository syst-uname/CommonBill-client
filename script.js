document.addEventListener('DOMContentLoaded', function () {

  let tg = window.Telegram.WebApp
  console.log('==== tg', tg)

  // главная кнопка
  tg.MainButton.show();
  tg.MainButton.setText('Отправить');
  tg.MainButton.onClick(() => {
    console.log('==== Главная кнопка Clicked')
    tg.ready();
    tg.sendData(JSON.stringify({ type: 'mainButtonClicked', value: '1', cost: 'data' }));
  });

  document.getElementById('testButton2').addEventListener('click', function () {
    tg.sendData(JSON.stringify({ type: 'secondButtonClicked', value: '2', cost: 'data new' }));
    // tg.close()
  });

  checkAndUpdateCache();

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
  const config = await getConfig()
  try {
    const url = `https://script.google.com/macros/s/${config.SERVER_ID}/exec`
    const body = {
      type: 'getParams',
      userId: 20
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
    // Очищаем список перед добавлением новых данных
    const dataList = document.getElementById('task-list');
    dataList.innerHTML = '';

    // Добавляем данные в список
    params.currs.forEach(curr => {
      const currencyCard = document.createElement('div');
      currencyCard.classList.add('col-md-4');
      currencyCard.innerHTML = `
          <div class="card">
            <div class="card-body">
              <p class="card-title">${curr.id}: ${curr.title}</p>
            </div>
          </div>
        `;
      dataList.appendChild(currencyCard);
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

// Проверка и обновления кеша
async function checkAndUpdateCache() {
  const cachedParams = localStorage.getItem('cachedParams');

  // Если есть кешированные данные, отображаем их
  if (cachedParams) {
    updatePage(JSON.parse(cachedParams));
  }

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