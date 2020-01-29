async function getRound() {
    return +(await $.get('/api/v1/status')).round;  
}
(async () => {
    await pushContr();
})();
(async ()=> {
    await pushLog();
})
(async () => {
    let usr = await $.get('/api/v1/mylogin');
    let time = await $.get('/api/v2/time/now');
    let span = document.getElementById('mylogin');
    span.innerHTML = usr.usr ? `Ваш логин (${usr.usr})` : '';
    span.innerHTML += time ? ` | до конца раунда: ${600-time} секунд` : '';
}
)();
async function updLog(arg) {
    let img = document.getElementById('updLogImg');
    img.classList.toggle('rotate');
    setTimeout(()=>{img.classList.toggle('rotate', false);}, 2000);
    if (!arg) 
        pushLog();
}
async function updContract(arg) {
    let img = document.getElementById('updImg');
    img.classList.toggle('rotate');
    setTimeout(()=>{img.classList.toggle('rotate', false);}, 2000);
    if (!arg) 
        pushContr();
}
async function createSc() {
  let pole = document.getElementById('CreateResponse');

  let resp = await $.post('/sc/create', {
      scText: $('#scText').val()
  })

  let errDOM = resp.error !== 0 ?
  (() => {
    let el = document.createElement('div')
    el.id = 'errMsg'
    el.innerHTML = `<p>${resp.error.toString()}</p>`
    el.classList.add(`alert`)
    el.classList.add(`alert-danger`)
    el.width = `100%`
    el.role = 'alert'
    return el;
  })():
  (() => {
    let el = document.createElement('div')
    el.id = 'errMsg'
    el.innerHTML = `<p>Контракт успешно создан</p>`
    $('#scText').val('')
    el.classList.add(`alert`)
    el.classList.add(`alert-success`)
    el.width = `100%`
    el.role = 'alert'
    return el;
  })()

  try{pole.removeChild(document.getElementById('errMsg'))} catch(e){}
  pole.appendChild(errDOM)
  await pushContr(resp);
    updContract(true);
  await pushLog();
    updLog(true);
  //Дозапрос данных по контракту и добавление в таблицу первым + подсветка
}

async function pushContr(target) {
    let round = await getRound();
    let modalsDiv = document.getElementById('modal-sc')
    let scsDiv = document.getElementById('scs-div')
    let scs = await $.get('http://localhost:9000/api/sk/actual/'+round);

    scsDiv.innerHTML = '';
    modalsDiv.innerHTML = '';

    for (let i=scs.length-1; i>=0; --i) {
        let scModalDiv = document.createElement('div');
            scModalDiv.classList.add('modal');
            scModalDiv.id = `codeModal${scs[i]._id}`;
            scModalDiv.tabIndex = '-1';
            scModalDiv.role = 'dialog';

            scModalDiv.innerHTML = `<div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="codeModalLabel">Код контракта №${scs[i]._id}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                    <textarea class="form-control" id="source-code" rows="30" disabled>${scs[i].text}</textarea>
                    </div>
                </div>
            </div>`
        modalsDiv.appendChild(scModalDiv);

        let results = ``;
        scs[i].results.map( res => {
            results += res.user ? `<b>${res.user}</b> = ${res.balance} y.e.<br>` : `<i><span>Недостаточно данных...</span><br></i>`;
        });
        let fields = ``;
        scs[i].fields.map( field => {
            let middle = '';
            if (field.author) {
                middle += `<p><b>${field.value}</b> [<i>Заполнил: ${field.author}</i>]</p>`
            } else {
                middle += `<form action="/sc/field" method="POST">
                    ${ (field.type=="$слово" || field.type=="$буква" || field.type=="$число") ? '<div class="col-7 col-sm-7 col-md-7 col-lg-7"><input name="data" type="text" class="form-control" placeholder="'+field.type+'" /></input></div>':''}
                    ${ field.type=="$время" ? `<div class="col-12 col-sm-12 col-md-12 col-lg-12">`:`<div class="col-5 col-sm-5 col-md-5 col-lg-5">` }
                    <input name="fieldId" type="hidden" value="${field._id}" />
                    <input name="fieldName" type="hidden" value="${field.name}" />
                    <input name="skId" type="hidden" value="${scs[i]._id}" />
                    <button class="btn btn-success btn-block">&#10004;</button>
                    </div>
                </form>
                <div class="col-12">
                    &nbsp;&nbsp;&nbsp;&nbsp;<i>доступен ввод для ${field.sec}</i>
                </div>`;
            }

            fields += `<div class="row">
                    <div class="col-12">
                    <div class="form-group form-row">
                        <div class="col-2 col-sm-2 col-md-2 col-lg-2">
                        <span>${field.name}</span>
                        </div>
                        ${middle}
                    </div>
                    </div>
                </div>`;
        });

        console.log(`TARGET ${JSON.stringify(target)}`)
        let scDiv = document.createElement('div');
            scDiv.classList.add('accordion');
            scDiv.classList.add('overflow-auto');
            scDiv.innerHTML = `
                    <div class="card" id="contractsList">
                    <div class="card-header">
                        <button class="btn btn-block dropdown-toggle" type="button" data-toggle="collapse"
                        data-target="#collapse${i}">
                        id: ${scs[i]._id} <br>
                        (Баланс: ${scs[i].resBalance})<br>
                        Создал-контракт: ${scs[i].author}<br>
                        Подробнее:
                        </button>
                    </div>
                    <div id="collapse${i}" class="collapse ${target ? (target.id == scs[i]._id ? 'show' : '') : ''}" data-parent="#contractsList">
                        <div class="card-body">
                        <div class="row mb-2">
                            <div class="col">
                            <p style="text-align:right;"><span><a target="_blank" href="/sc/${scs[i]._id}" style="color:black">В отдельной вкладке <img src="/img/link.png" width="16px"></a></span><p>
                            <button class="btn btn-block btn-info" data-toggle="modal" data-target="#codeModal${scs[i]._id}">
                                Код
                            </button> 
                            <a class="btn btn-block btn-default" href="/sc/distribute/${scs[i]._id}">
                                Распределить баланс
                            </a> 
                            <a class="btn btn-block btn-default" href="/wallet/${scs[i]._id}" target="_blank">
                                Пополнить
                            </a> 
                            </div>
                        </div>
                            ${fields}
                        <hr>
                        <div class="row">
                            <div class="col-12">
                            Результаты контракта:<br>
                                ${results}
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>`
        scsDiv.appendChild(scDiv)
    }
    console.log('добавлены модульные окна')
}

async function pushLog() {
    let logsDiv = document.getElementById('logs-div')
    let logs = await $.get('/api/v2/logs');

    logsDiv.innerHTML = '';
    for( let i=0; i<logs.length; i++ ) {
        let date = new Date(logs[i].time);
        let _date = ''
        _date = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        let tr = document.createElement('tr');
        tr.innerHTML = `
        <th scope="row">${i}</th>
        <td>${_date}</td>
        <td>${logs[i].round}</td>
        <td>${logs[i].author}</td>
        <td><a target="_blank" href="/sc/${logs[i].action}">${logs[i].action}</a><td>
        <td>${logs[i].data}</td>`
        logsDiv.appendChild(tr)
    }

}