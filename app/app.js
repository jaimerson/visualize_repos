import { numberOfRepositories } from 'api';

export function App(){
  return {
    render: (container)=>{
      let languages = ['ruby', 'javascript', 'java'];
      languages.forEach((lang) =>{
        numberOfRepositories(lang).then((number) => {
          let div = document.createElement('div');
          let text = document.createTextNode(`${lang} has ${number} repositories.`)
          div.appendChild(text);

          container.appendChild(div);
        })
      });
    }
  };
}