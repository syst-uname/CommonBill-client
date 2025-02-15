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

// Получение параметров страницы 
async function fetchParams() {
  try {
    const config = await getConfig();
    const body = {
      type: 'getParams',
      userId: 20
    }
    const response = await fetch(config.BOT_SERVER_URL, {
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

// Данные конфига  
async function getConfig() {
  try {
    const response = await fetch('config.json')
    const config = await response.json()
    console.log('==== config', config)
    return config
  } catch (error) {
    // чтение из env 

    console.log('==== файл не считан',)
    console.log('==== env meta', import.meta)
    console.log('==== env env', import.meta?.env)
    console.log('==== env key', import.meta?.env?.SECRET1)

    // console.error('Ошибка при загрузке настроек:', error)
    // return null
  }
}