import { App } from 'app';

document.addEventListener('DOMContentLoaded', () => {
  // do your setup here
  console.log('Initialized app');

  let container = document.getElementById('app');
  let body = App().render(container);

  document.body.appendChild(container);

});
