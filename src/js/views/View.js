import icons from 'url:../../img/icons.svg'; // Parcel 2

export default class View {
  _data;
  /**
   * Render the recived object to the DOM
   * @param {Object|Object[]} data The data to be render (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | false} A markup string is returned if render=false
   * @this {Object} View instnace
   */
  render(data, render = true) {
    // To prevent that it's only empty array without found results
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.renderError();
    }

    this._data = data;
    const markup = this._generateMarkup();

    // Return the strings for bookmarks (fake render)
    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderwithoutData() {
    const markup = this._generateMarkup();
    console.log(markup);
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  update(data) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();
    this._data = data;
    const newMarkup = this._generateMarkup();

    const newDOM = document.createRange().createContextualFragment(newMarkup);

    const newElements = Array.from(newDOM.querySelectorAll('*'));
    const curElements = Array.from(this._parentElement.querySelectorAll('*'));
    // console.log(curElements, newElements);

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i];
      /*
      console.log('--BG---Check Equal Node-----');
      console.log(newEl.isEqualNode(curEl));
      console.log(curEl);
      console.log(newEl);
      console.log(
        '|',
        typeof newEl.firstChild?.nodeValue,
        '|',
        newEl.firstChild?.nodeValue,
        '|'
      );
      console.log('--ED---Check Equal Node-----');
      */

      // Wrong 1 , textContent 只會抓文字部分，有些CSS會包其他CSS 會被覆蓋掉
      // if (!newEl.isEqualNode(curEl)) {
      // curEl.textContent = newEl.textContent;
      // }

      // 1) Update change TEXT
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
        // Use first child to chnage the whole text content insied nested DOM
      ) {
        curEl.textContent = newEl.textContent;
      }
      // 2) Update change ATTRIBUTE
      if (!newEl.isEqualNode(curEl))
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
    });
  }

  renderSpinner = function () {
    const markup = `
      <div class="spinner">
              <svg>
                <use href="${icons}#icon-loader"></use>
              </svg>
        </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  };

  renderError(messages = this._errorMessage) {
    console.log('error');
    const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${messages}</p>
      </div>;`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  renderMessage(messages = this._message) {
    console.log('--BG---renderMessage-----');
    const markup = `
          <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${messages}</p>
          `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }
}
