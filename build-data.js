async function loadData() {
  try {
    // Выполняем GET-запрос к вашему скрипту
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwxXtyCDPISdPIVTnQx5kAhYv233mXYGfI3q1cp1fh1eYRMmjAUNZz7haYV8hqJh3Cu/exec';
    const response = await fetch(scriptUrl);
    const data = await response.json();
    console.log('==== data', data)

    // Очищаем список перед добавлением новых данных
    const dataList = document.getElementById('task-list');
    dataList.innerHTML = '';

    // Добавляем данные в список
    const currency = data.currency;
    currency.forEach(item => {
      const currencyCard = document.createElement('div');
      currencyCard.classList.add('col-md-4');
      currencyCard.innerHTML = `
        <div class="card">
          <div class="card-body">
            <p class="card-title">${item.id}: ${item.name}</p>
          </div>
        </div>
      `;
      dataList.appendChild(currencyCard);
    });
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
}

window.onload = loadData;