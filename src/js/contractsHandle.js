const contractsListEl = document.getElementById('contractsList');
const contractCodes = {};

$.ajax({
  method: 'GET',
  url: window.apiUrl + '/sk/actual/' + window.round,
})
  .done(() => {

  });


function displayContracts(contracts) {

}

function contractToHTML(contract) {
  contractCodes[contract.id] = contract.text;

  const contractView =
    `
    <div class="card">
      <div class="card-header">
        <button class="btn btn-block dropdown-toggle" type="button" data-toggle="collapse"
          data-target="#collapse${contract.id}">
          id: ${contract.id}
        </button>
      </div>

      <div id="collapse${contract.id}" class="collapse" data-parent="#contractsList">
        <div class="card-body">
          <div class="row mb-2">
            <div class="col">
              <button class="btn btn-block btn-info" data-toggle="modal" data-id="${contract.id}" data-target="#codeModal">Код</button>
            </div>
          </div>
          <div class="row">
            <div class="col-12">
              <div class="form-group form-row">
                ${fieldsToHTML(contract)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return contractView;
}

function fieldsToHTML(fields) {
  const fieldsHTML = '';
  fields.forEach((field) => {
    if (field.type == '$слово') {
      fieldsHTML += `
        <div class="form-group form-row">
          <div class="col-9 col-sm-10 col-md-9 col-lg-10">
            <input type="text" class="form-control" placeholder="???" />
          </div>
          <div class="col-3 col-sm-2 col-md-3 col-lg-2">
            <button class="btn btn-success btn-block">&#10004;</button>
          </div>
        </div>
      `;
    }
  });
}