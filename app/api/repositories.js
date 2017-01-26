const baseURL = 'https://api.github.com/search/';

export function numberOfRepositories(language){
  return fetch(`${baseURL}repositories?q=+language:${language}`)
    .then((response) => {
      return response.json()
        .then((json) => { return json['total_count'] });
    });
}
