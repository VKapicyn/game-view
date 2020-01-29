function _debugger() {
    let text = clear($('#scText').val());
    let err = ''
    let _symbols = text.split('');
    let open = 0, close = 0;
  
    //Считаем скобки
    for (let i = 0; i < _symbols.length; i++) {
      if (_symbols[i] == ')') 
        ++open;
      if (_symbols[i] == '(')
        ++close;
    }
    if (open !== close)
      err = `Мало скобок, добавьте: ${open>close?'")"':'"("'}<br>`
    else
      err = ''
  
    //Есть текст #КОНТРАКТ
    let contr = text.indexOf('КОНТРАКТ#');
    err += contr !== -1 ? '' : `Не найден раздел "КОНТРАКТ#"<br>`
    if (contr > -1) {
      let start = contr+9;
      let end = text.indexOf('РЕЗУЛЬТАТ#') == -1 ? text.length : text.indexOf('РЕЗУЛЬТАТ#');
      let items = text.slice(start, end), perems = 0, doll = 0, brktsOp = 0, brktsCl = 0, close = 0, dvoe = 0;
      items.split('');
      for(i=0; i<items.length; i++){
        if (items[i] == '_')
          ++perems
        if (items[i] == '$')
          ++doll;
        if (items[i] == '{')
          ++brktsOp;
        if (items[i] == '}')
          ++brktsCl;     
        if (items[i] == ';')
          ++close;   
        if (items[i] == ':')
          ++dvoe;                       
      }
      if (perems == doll && perems == brktsOp && perems == brktsCl && perems == close && perems == dvoe && perems != 0) {
        try{
          let words = items.split(';'), words_res = [];
          words.map(x => {
            words_res.push(x.slice(x.indexOf('_'), x.indexOf(':')));
          });
          if ((()=>{
            let result = [];
            for (let str of words_res) {
              if (!result.includes(str)) {
                result.push(str);
              }
            }
            return result;
          })().length !== words_res.length)
            err+= 'Повторяются названия переменных!<br>';
        } catch(e) {console.log(e)}
      } else {
        err += 'Не соблюдены правила записи переменных, верный формат:<br>';
        err += '<b>_</b>наименованиеПеременной<b>: $</b>типДанных <b>{</b>увроеньДоступа<b>}</b><b>;</b><br>';
      }
      //Проверяем типы, переменные, доступы
    }
    //Есть текст #РЕЗУЛЬТАТ
    //FIXME: подсчет ;
    let rez = text.indexOf('РЕЗУЛЬТАТ#');
    err += rez !== -1 ? '' : `Не найден раздел "РЕЗУЛЬТАТ#"<br>`
    if (rez > -1) {
      let start = rez+10;
      let end = text.length;
      let ysl = calc(text.slice(start, end), '^УСЛ');
  
      //TODO: внутренняя проверка скобок?
      if (ysl > 0) {
        let sep = calc(text.slice(start, end), '|')
        if (ysl != sep)
          if (sep < ysl)
            err+= 'При использовании условного оператора "^УСЛ()", необходимо указать результаты обоих исходов через "|"<br>'
          else
            err+= 'Избыточное применениие символа "|"<br>'
      }
      
      //TODO: Проверяем скобки у математики
    }
    
    document.getElementById('debId').innerHTML = err
  }
  function clear(text){
    text = text.split('');
    for (let i=0; i<text.length; i++) {
      if (text[i] == ' ' ||
          text[i] == ' ' ||
          text[i] == '\n' ||
          text[i] == '\r' ||
          text[i] == '\t' ||
          text[i] == '\b' ||
          text[i] == '\f' ||
          text[i] == '\v'
      ) {
          text.splice(i, 1);
          --i;
      }
    }
    return text = text.join('');
  }
  function calc(text, find) {
    let items = 0;
    let index = text.indexOf(find);
    while( index != -1 && items<=50) {
      text = text.slice(index+find.length, text.length);
      index = text.indexOf(find);
      ++items;
    }
    return items;
  }