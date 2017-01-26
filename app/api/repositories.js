const baseURL = 'https://api.github.com/search/';

let fetchNumber = (language) => {
  return fetch(`${baseURL}repositories?q=+language:${language}`)
    .then((response) => {
      return response.json()
        .then((json) => { return json['total_count'] });
    });
}

let cachedNumber = (language) => {
  return localStorage.getItem(`repo_viz_numbers_${language}`);
}

let saveCachedNumber = (language, number) => {
  localStorage.setItem(`repo_viz_numbers_${language}`, number);
}

// returns a promise with a value
export function numberOfRepositories(language){
  if(cachedNumber(language)){
    return new Promise((resolve) => {
      return resolve(cachedNumber(language));
    });
  }
  let number = fetchNumber(language);

  number.then((n) => saveCachedNumber(language, n));

  return number;
}
