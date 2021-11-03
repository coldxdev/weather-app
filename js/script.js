const WEATHER_API_KEY = '5bacda46919a4fec46ab34b6f484bc59';

const forecasts = document.querySelector('.forecasts');
const form = document.querySelector('.main__form');
const searchInput = document.getElementById('search-input');
const error = document.querySelector('.main__form-error');

let receivedCity = [];
let clientCity = localStorage.getItem('city') || '';

form.addEventListener('submit', (e) => {
	e.preventDefault();

	if (searchInput.value) {
		getWeather(searchInput.value);
	} else {
		errorHandler('Field should not be empty', true);
	}
});

function errorHandler(text, active) {
	error.textContent = text;
	active ? error.classList.add('active') : error.classList.remove('active');
}

async function getWeather(city) {
	try {
		await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
		)
			.then((response) => {
				if (response.status === 200) {
					const data = response.json();
					errorHandler('', false);

					return data;
				} else {
					errorHandler('Not found', true);
				}
			})
			.then((data) => {
				if (receivedCity.length > 0) {
					let isDupclicate = false;

					receivedCity.forEach((city) => {
						if (data.name === city) {
							isDupclicate = true;
						} else {
							isDupclicate = false;
						}
					});

					if (!isDupclicate) {
						renderForecast(data);
						errorHandler('', false);
					} else {
						errorHandler('Current city already added', true);
					}
				} else {
					renderForecast(data);
				}
			});
	} catch (err) {}
}

function renderForecast(data) {
	const city = data.name;
	const temp = data.main.temp + '°';
	const windSpeed = data.wind.speed;
	const humidity = data.main.humidity;
	const img = data.weather[0].icon;

	receivedCity.push(city);

	const forecast = document.createElement('div');
	forecast.classList.add('forecast');

	const template = `
				<button class="forecast__close"></button>
				<h3 class="forecast__city">
					${city}
				</h3>
				<div class="forecast__img">
					<img width="200" height="200" src="http://openweathermap.org/img/wn/${img}@4x.png"> 
				</div>
				<div class="forecast__info">
					<p class="forecast__info-text">
						Temp
						<span>
							${temp}
						</span>
					</p>

					<p class="forecast__info-text">
						Wind
						<span>
							${windSpeed} km/h
						</span>
					</p>

					<p class="forecast__info-text">
						Humidity
						<span>
							${humidity}
						</span>
					</p
				</div>
		`;

	forecast.innerHTML = template;

	forecast.addEventListener('click', (e) => {
		if (e.target.classList.contains('forecast__close')) {
			receivedCity.splice(city);
			forecast.classList.add('deleting');
			setTimeout(() => forecast.remove(), 300);
			errorHandler('', false);
		}
	});

	forecasts.insertAdjacentElement('afterbegin', forecast);
}

async function getClientCity({ latitude, longitude }) {
	try {
		await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
		)
			.then((response) => {
				if (response.status === 200) {
					const data = response.json();

					return data;
				}
			})
			.then((data) => {
				localStorage.setItem('city', data.name);
				clientCity = localStorage.getItem('city');
				getWeather(clientCity);
			});
	} catch (err) {
		console.log(err);
	}
}

if (clientCity) {
	getWeather(clientCity);
} else {
	navigator.geolocation.getCurrentPosition(({ coords }) => {
		getClientCity(coords);
	});
}
