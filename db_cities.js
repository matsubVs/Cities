const localeCountry = {
    'RU': 'Россия',
    'EN': 'United Kingdom',
    'DE': 'Deutschland'
};


class FindCity {
    constructor(dropdown, def, select, autocomplete, button, input, closeBtn) {
        this.locale = this.getLocale();
        this.fetchData();
        this.data = this.getData();

        this.dropdown = document.querySelector(dropdown);
        this.default = document.querySelector(def);
        this.select = document.querySelector(select);
        this.autocomplete = document.querySelector(autocomplete);
        this.button = document.querySelector(button);
        this.input = document.querySelector(input);
        this.closeBtn = document.querySelector(closeBtn);

        this.generateDropdownMenu('default');
        this.eventHandlers();
    }

    checkInput() {
        return this.input.value === '';
    }

    getData() {
        console.log(localStorage);
        try {
            const storage = JSON.parse(localStorage.getItem('locale'));
            storage.sort((a, b) => {
                if (a['country'] === localeCountry[this.locale]) {
                    return 1;
                }
            });

            return storage.reverse();
        } catch (e) {
            console.log(e);
        }
        

    }

    generateDropdownMenu(menuType, country = null) {
        if (menuType === 'default') {
            const blocks = [];
            this.data.forEach(item => {
                const countryBlock = document.createElement('div');
                countryBlock.classList.add('dropdown-lists__countryBlock');
                const childBlock = this.generateDefaultBlock(countryBlock, item);

                blocks.push(childBlock);
            });

            const innerBlock = this.default.querySelector('.dropdown-lists__col');
            innerBlock.textContent = '';
            blocks.forEach(item => innerBlock.appendChild(item));
        } else if (menuType === 'select') {
            const selectedCountry = this.data.filter(item => item['country'] === country);

            const countryBlock = document.createElement('div');
            countryBlock.classList.add('dropdown-lists__countryBlock');
            const childBlock = this.generateSelectBlock(countryBlock, selectedCountry[0]);

            const innerBlock = this.select.querySelector('.dropdown-lists__col');
            innerBlock.textContent = '';
            innerBlock.appendChild(childBlock); 
        }
    }

    generateSelectBlock(parentNode, block) {
        const totalLine = document.createElement('div');
        totalLine.classList.add('dropdown-lists__total-line');
        totalLine.insertAdjacentHTML('beforeend', `
            <div class="dropdown-lists__country">${block.country}</div>
            <div class="dropdown-lists__count">${block.count}</div>
        `);

        parentNode.appendChild(totalLine);

        block.cities.forEach(city => {
            const cityBlock = document.createElement('div');
            cityBlock.classList.add('dropdown-lists__line');

            cityBlock.insertAdjacentHTML('beforeend', `
                <div class="dropdown-lists__city">${city.name}</div>
                <div class="dropdown-lists__count">${city.count}</div>
            `);

            parentNode.appendChild(cityBlock);
        });

        return parentNode;
    }

    generateDefaultBlock(parentNode, block) {
        const totalLine = document.createElement('div');
        totalLine.classList.add('dropdown-lists__total-line');
        totalLine.insertAdjacentHTML('beforeend', `
            <div class="dropdown-lists__country">${block.country}</div>
            <div class="dropdown-lists__count">${block.count}</div>
        `);

        parentNode.appendChild(totalLine);

        const sortedCities = block['cities'].sort((a, b) => {
            if (+a['count'] > +b['count']) {
                return 1;
            }
        }).reverse();
        const topCities = sortedCities.slice(0, 3);

        topCities.forEach(city => {
            const cityBlock = document.createElement('div');
            cityBlock.classList.add('dropdown-lists__line');

            cityBlock.insertAdjacentHTML('beforeend', `
                <div class="dropdown-lists__city">${city.name}</div>
                <div class="dropdown-lists__count">${city.count}</div>
            `);

            parentNode.appendChild(cityBlock);
        });

        return parentNode;
    }

    eventHandlers() {
        this.button.addEventListener('click', event => {
            if (this.checkInput()) event.preventDefault();
        });

        this.input.addEventListener('focus', () => {
            this.default.style.display = 'block';
        });

        this.input.addEventListener('blur', () => {
            const label = document.querySelector('.label');

            if (!this.checkInput()) {
                label.textContent = '';
            } else {
                label.textContent = 'Страна или город';
            }
        });

        this.input.addEventListener('input', () => {
            if (!this.checkInput()) {
                this.closeBtn.style.display = 'block';
                this.default.style.display = 'none';
                this.select.style.display = 'none';
                this.autocomplete.style.display = 'block';
            } else {
                this.closeBtn.style.display = 'none';
                this.default.style.display = 'block';
                this.select.style.display = 'none';
                this.autocomplete.style.display = 'none';
            }
        });

        this.closeBtn.addEventListener('click', () => {
            const label = document.querySelector('.label');
            this.input.value = '';
            this.closeBtn.style.display = 'none';
            this.select.style.display = 'none';
            this.autocomplete.style.display = 'none';
            label.textContent = 'Страна или город';
        });

        this.dropdown.addEventListener('click', event => {
            const target = event.target;

            if (target.matches('.dropdown-lists__city, .dropdown-lists__country')) {
                this.input.value = target.textContent;
                this.input.focus();
                this.closeBtn.style.display = 'block';
                if (target.matches('.dropdown-lists__city')) {
                    let country = target.closest('.dropdown-lists__countryBlock');
                    country = country.querySelector('.dropdown-lists__country').textContent;
                    
                    const selectedData = this.data.filter(item => 
                        item.country === country)[0]['cities'].filter(item => 
                        item.name === target.textContent)[0]['link'];
                    
                    this.button.href = selectedData;

                    this.select.style.display = 'none';
                    this.default.style.display = 'none';
                    this.autocomplete.style.display = 'none';
                }

            } else if (target.matches('.dropdown-lists__total-line')) {
                if (target.closest('.dropdown-lists__list--select')) {
                    this.select.style.display = 'none';
                    this.default.style.display = 'block';
                } else if (target.closest('.dropdown-lists__list--default')) {
                    this.select.style.display = 'block';
                    this.default.style.display = 'none';
                    this.generateDropdownMenu('select', target.querySelector('.dropdown-lists__country').textContent);
                }
            }
        });
    }

    getLocale() {
        if (document.cookie) {
            return document.cookie.split('=')[1];
        }

        const locale = prompt('Введите ваше местоположение:\n  --> RU\n  --> EN\n  --> DE');
        document.cookie = `locale=${locale}`;
        return locale;
    }

    fetchData() {
        fetch('./db_cities.json')
            .then(data => data.json())
            .then(response => localStorage.setItem('locale', JSON.stringify(response[this.locale])))
            .catch(error => console.log(error));
    }
}


new FindCity('.dropdown', '.dropdown-lists__list--default', '.dropdown-lists__list--select',
    '.dropdown-lists__list--autocomplete', '.button', '#select-cities', '.close-button');
