// noinspection HtmlDeprecatedAttribute

let reload = 'main';
let reloadId = 0;
let reloadIdChild = 0;

let categories = parseCategoriesX();
let points = parsePointsX(categories);


function parseCategoriesX() {
    let cat = [];
    $.ajax({
        url: '/api/list_role_parents',
        dataType: 'text',
        type: 'get',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);

            $.each(datax, function appendTable(key, value) {
                cat.push([value.id, value.name, value.color, value.emoji]);
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
    return cat;
}


function parsePointsX(categ) {
    let poi = [];
    $.ajax({
        url: '/api/list_roles',
        dataType: 'text',
        type: 'get',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);
            let cat = [];

            $.each(datax, function appendTable(key, value) {
                poi.push([value.id, value.name, value.description, value.value, value.multiple, value.parent_id, value.owning]);
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
    return poi;
}


function createSubsite(title, context1) {
    let start = `
        <div class="content-section">
  <div class="outer">
    <div class="middle">
      <div class="inner">
       `

    let titleblock = `
        <h1 style="text-align:center;">${title}</h1>
          <hr class="intro-divider">
        <div class="opt">
          <a onclick="showDocs()" class="clickable">
            <i class="fa fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa fa-bug "></i> Zgłoś błąd
          </a>
        </div>
    `

    let mid_emp = `

          <div class="center">
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th width="10%"> Imię/Nazwisko</th>
                  <th width="30%"> Uprawnienia do: </th>
                  <th width="30%"> E-mail </th>
                  <th width="15%"> Akcje </th>
                </tr>
              </thead>
              <tbody id="append">

              </tbody>
            </table>
          </div>
        `

    let mid_dep = `

          <div class="center">
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th width="10%"> Imię/Nazwisko</th>
                  <th width="30%"> Opis </th>
                  <th width="30%"> Liczba uczniów </th>
                  <th width="15%"> Akcje </th>
                </tr>
              </thead>
              <tbody id="append">

              </tbody>
            </table>
          </div>
        `

    let mid_cat = `
          <div class="center">
          <div class="buttons">
          <a class="clickable" id="poz" onclick="showonly('+')" class="popbutton">Pozytywne</a>
          <a class="disabled" id="neu" onclick="showonly('/')" class="popbutton">Wszystkie</a>
          <a class="clickable" id="neg" onclick="showonly('-')" class="popbutton">Negatywne</a>
          </div>
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th width="15%"> Nazwa</th>
                  <th width="20%"> Opis </th>
                  <th width="15%"> Wartość </th>
                  <th width="20%"> Liczba osób które posiadają</th>
                  <th width="15%"> Czy można dodawać wielokrotnie? </th>
                  <th width="15%"> Akcje </th>
                </tr>
              </thead>
              <tbody id="append">

              </tbody>
            </table>
          </div>
        `

    let addbtn = `<div style="text-align: center" onclick="modalNew('${context1}_create')">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Dodaj nowy
                </a>
              </div>`

    let addbtn_par = `<div style="text-align: center; display: flex; justify-content: center;"><span style="text-align: center; margin: 1vh 1vw;" onclick="modalNew('Parent${context1}_create')">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Dodaj nową kategorię
                </a>
              </span><span style="text-align: center; margin: 1vh 1vw;" onclick="modalNew('${context1}_create')">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Dodaj nową podkategorię
                </a>
              </span></div>`

    let ending = `</div></div></div></div></div>`

    let site = ''

    if (context1 === 'Employee') {
        site = start + titleblock + mid_emp + addbtn + ending
    } else if (context1 === 'Department') {
        site = start + titleblock + mid_dep + addbtn + ending
    } else if (context1 === 'Role') {
        site = start + titleblock + mid_cat + addbtn_par + ending
    } else {
        site = `<div id='err'>No i znowu sie rozjehcało 😩😨😱🥵</div>`
    }

    $('.body').append(site);

    let dataa = {'name': context1}
    $.ajax({
        url: '/api/show_count',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: dataa,
        success: function (data, textStatus, jQxhr) {
            if (data == 0) {
                //TYCH TABELEK TO TUTAJ WOGLE BYC NIE POWINNO
                $('.table').remove();
                $('.center').append("Nie ma niczego");
            } else {
                if (context1 == 'Employee') {
                    $.ajax({
                        url: '/api/list_employees',
                        dataType: 'text',
                        type: 'get',
                        success: function (data, textStatus, jQxhr) {
                            let dataa = JSON.parse(data);
                            $.each(dataa, function appendTable(key, value) {
                                let is_pies = '';
                                if (value.is_admin === true) {
                                    is_pies = '<br>👑 Administrator totalny';
                                } else {
                                    is_pies = `Nie moge pobrać tych informacji<br><a hrefh="/admin/u&${value.id}">Zarządzaj uprawnieniami</a>`;
                                }
                                $('.table').append(`<tr>
                                          <td> <input class="undis" type="text" oninput="editemp(${value.id}, 'first_name', this.value);" value='${value.first_name}' id='ddsd'> <input oninput="editemp(${value.id}, 'last_name', this.value)" class="undis" type="text" value="${value.last_name}"> </td>
                                          <td> <!--${value.permissions}--!> ${is_pies} </td>
                                          <td> <input class="undis" type="text" oninput="editemp(${value.id}, 'email', this.value);" value='${value.email}'> </td>
                                          <td id=${value.id}>
                                                <a class="clickable" onclick="removeDb('employee', ${value.id})">
                                                <i class="fa fa-trash"></i> Usuń</a></td>
                                          `)
                            });
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            modalError(jqXhr.responseText);
                        }
                    });
                } else if (context1 == 'Department') {
                    $.ajax({
                        url: '/api/list_departments',
                        dataType: 'text',
                        type: 'get',
                        success: function (data, textStatus, jQxhr) {
                            let dataa = JSON.parse(data);
                            $.each(dataa, function appendTable(key, value) {
                                $('.table').append(`<tr>
                                          <td> ${value.name} </td>
                                          <td> TODO </td>
                                          <td> TODO </td>
                                          <td id=${value.id}><a>
                                          <i class="fa fa-pencil"></i> Edytuj⠀⠀</a>
                                                <a>
                                                <i class="fa fa-trash"></i> Usuń</a></td>
                                          `)
                            });
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            modalError(jqXhr.responseText);
                        }
                    });
                } else if (context1 == 'Role') {

                    let shown = [];
                    let emojix = '';
                    let emojiv = 'fa-seal-question';

                    $.each(categories, function appendTable(key, value) {
                        console.log(key, value)
                        if (value[3] === undefined || value[3] === null) emojix = `<i class='fa-solid fa-seal-question' onclick='iconpicker(${value[0]});'></i>`; else emojix = `<i class='fa-solid ${value[3]}' onclick='iconpicker(${value[0]});'></i>`;
                        emojiv = value[3];

                        $('.table').append(`<tr>
                            <td id="pa_${value[0]}" class="pa" style="background-color: ${value[2]}; opacity: 0.8; color: black;" colspan=6">
                            ${emojix}
                            <input type="text" class="undis uncategory" value="${value[1]}" oninput="editprimcat(${value[0]}, 'name', this.value);">
                            <a style='color: black;' class="unrem" onclick="removeDb('category', '${value[0]}')" ><i class="fa fa-trash"></i> Usuń</a>
                            <input type="color" class="uncolor" value="${value[2]}" onchange="editprimcat(${value[0]}, 'color', this.value);">
                            </td>
                            `)
                        let found = points.filter(element => element[5] == value[0]);
                        if (found.length > 0) {
                            $.each(found, function appendTable(key, value) {
                                console.log(value)
                                shown.push(value[0]);
                                let m;
                                if (value[4] === true) m = 'checked="true"'; else m = '';
                                $('.table').append(`<tr data-value="${value[3]}">
                                <td> <input type="text" class="undis" value="${value[1]}" oninput="editcat({value[0]}, 'name', this.value);"></td>
                                <td> <input type="text" class="undis" value="${value[2]}" oninput="editcat({value[0]}, 'description', this.value);"></td>
                                <td> <input type="text" class="undis" value="${value[3]}" oninput="editcat({value[0]}, 'value', this.value);"> </td>
                                <td> ${value[6]} </td>
                                <td> <input type="checkbox" ${m} oninput="editcat({value[0]}, 'multiple', this.checked);"> </td>
                                <td id=${value.id}>                                
                                <a class="clickable" onclick="changeParent('${value[0]}')"><i class="fa-sharp fa-regular fa-right-left"></i>Inna kat.</a>
                                <a class="clickable" onclick="removeDb('subcategory', '${value[0]}')">
                                <i class="fa fa-trash"></i> Usuń</a></td>
                                `)
                            });


                        } else {
                            $('.table').append(`<tr>
                            <td  colspan=5"> Nie ma nic w tej kategorii</td>
                            `)
                        }

                    });

                    let found2 = points.filter(element => !shown.includes(element[0]));

                    if (found2.length > 0) {
                        $('.table').append(`<tr>
                            <td style="background-color: gray; opacity: 0.8; color: black;" colspan=6"> Bez przypisanej kategorii</td>
                            `)

                        $.each(found2, function appendTable(key, value) {
                            let m;
                            if (value[4] === true) m = 'checked="true"'; else m = '';
                            shown.push(value[0]);
                            $('.table').append(`<tr data-value="${value[3]}">
                                <td> <input type="text" class="undis" value="${value[1]}" oninput="editcat({value[0]}, 'name', this.value);"></td>
                                <td> <input type="text" class="undis" value="${value[2]}" oninput="editcat({value[0]}, 'description', this.value);"></td>
                                <td> <input type="text" class="undis" value="${value[3]}" oninput="editcat({value[0]}, 'value', this.value);"> </td>
                                <td> ${value[6]} </td>
                                <td> <input type="checkbox" ${m} oninput="editcat({value[0]}, 'multiple', this.checked);"> </td>
                                <td id=${value.id}>                                
                                <a class="clickable" onclick="changeParent('${value[0]}')"><i class="fa-sharp fa-regular fa-right-left"></i>Inna kat.</a>
                                <a class="clickable" onclick="removeDb('subcategory', '${value[0]}')">
                                <i class="fa fa-trash"></i> Usuń</a></td>
                                `)
                        });


                    }
                }
                $('.table').append('Wyświetlam: <span id="shown">' + data + '</span> z <span id="total">' + data + '</span>');
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function createDataPanel() {
    let start = `
        <div class="content-section">
  <div class="outer">
    <div class="middle">
      <div class="inner">
       `

    let titleblock = `
        <h1 style="text-align:center;">💾Menadżer danych</h1>
          <hr class="intro-divider">
        <div class="opt">
          <a onclick="showDocs()" class="clickable">
            <i class="fa fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa fa-bug "></i> Zgłoś błąd
          </a>
        </div>
    `

    let mid_dat = `
          <div class="center">
          <h3>👺 Librus</h3>
          <div style="display: flex; margin: 1vh 2vw;">
            <span style="text-align: center; width: 45%; margin: 0 3%;" onclick="createPopUp('📲Import z Librusa', 'large', 'center', 'importLibrus');openPopUp();">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Import z Librusa
                </a>
             </span>
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="modalNew()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Eksport do Librusa
                </a>
             </span>
          </div>
          <hr>
             <h3>📊 Arkusze</h3>
             <div style="display: flex; margin: 1vh 2vw;">
             <span style="text-align: center; width: 45%; margin: 0 3%;" onclick="modalNew()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Generacja arkusza danych
                </a>
             </span>
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="modalNew()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Przeglądanie arkuszy
                </a>
             </span>
             </div>
             <hr>
             <h3>📣 Zgłoszenia</h3>
             <div style="display: flex; margin: 1vh 2vw;">
             <span style="text-align: center; width: 45%; margin: 0 3%;" onclick="modalNew()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Wyświetl listę zgłoszeń
                </a>
             </span>
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="modalNew()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Usuń dotychczasowe zgłoszenia
                </a>
             </span>
             </div>
             <hr>
             <h3>📒 Logi</h3>
             <div style="display: flex; margin: 1vh 2vw;">
             <span style="text-align: center; width: 45%; margin: 0 3%;" onclick="exportData('logs')">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Wyświetl lub pobierz logi
                </a>
             </span>
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="removeData('logs')">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Usuń logi
                </a>
             </span>
             </div>
          </div>
        `

    let ending = `</div></div></div></div></div>`

    let site = ''

    site = start + titleblock + mid_dat + ending

    $('.body').append(site);

}

function createMainPanel() {
    $.ajax({
        url: '/api/get_design', dataType: 'text', type: 'get', contentType: 'application/x-www-form-urlencoded'
    }).done(function (result) {
        console.log(result)
        result = JSON.parse(result);
        $('.intro-header').css("background-image", "url(../static/" + result[3] + ")");
        $('.appname').each(function () {
            $(this).text(result[0]);
        });
        $('.author').each(function () {
            $(this).text(result[1]);
        });
        $('.ver').each(function () {
            $(this).text(result[2]);
        });
        $('.logo').each(function () {
            $(this).attr("href", "../static/" + result[4] + "");
            $(this).attr("src", "../static/" + result[4] + "");
        });


    });

    let mainPanel = `
        <div class="intro-header">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="intro-message scale-up-top">
                            <h1>Panel administratora</h1>
                            <h3>Tylko dla administratorów!</h3>
                            <hr class="intro-divider">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="float-container">
            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-lightbulb"></i> P O R A D A</p>
                <div style="margin-left: 3%;">By wejść na tą stronę można użyć przeglądarki na np. komputerze.</div>
            </div>

            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-brake-warning"></i> Z G Ł O S Z E N I A</p>
                <div id="report"><div id='repcontent'></div><button class='btn'>zobacz więcej</button</div></div>
            </div>
            
            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-head-side"></i> P R O F I L</p>
                <div style="margin-left: 3%;">Pobieranie danych...</div>
                <div id="profile"></div>
                <div id="profile_settings">
                <button class="btn" onclick="modalNew('ProfilePhoto_create')">Zmień zdjęcie profilowe</button>

            </div>
            </div>

            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-square-info"></i> S T A T Y S T Y K I</p>
                <div style="margin-left: 47%;">Ilość:</div>
                <div>Użytkowników: <span id="response1">0</span></div>
                <div>Uczniów: <span id="response2">0</span></div>
                <div>Oddziałów: <span id="response3">0</span></div>

            </div>
            <script>
            function showReportsSite() {
                $.ajax({
                    url: '/api/list_reports',
                    dataType: 'text',
                    type: 'get',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data, textStatus, jQxhr) {
                        let datay = JSON.parse(data);
                        i = 0
                        if (datay.length == 0) {
                            $('#repcontent').append('<div class="saferemove" style="padding: 20px; ">🎉Brak zgłoszeń<div>');
                        }
                        $.each(datay, function showLatest(key, value) {
                            if (i < 3) {
                                let line = '<div id=\\'rep' + key + '\\' class=\\'saferemove\\'>' +  value.description + '<i class=\\'fa fa-trash removeic\\' onclick=\\'removeReport(' + value.id + ');setTimeout($("div.saferemove").remove(), 50); setTimeout(showReportsSite(), 50)\\'></i><hr></div></div>'
                                $('#repcontent').append(line);
                                i++
                            }
                        });
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
            };
            
            showReportsSite();
            
            function loadStatsSite() {

                let data1 = {'name': 'Employee'}
                $.ajax({
                    url: '/api/show_count',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: data1,
                    success: function (data, textStatus, jQxhr) {
                        $('#response1').text(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
                let data2 = {'name': 'Object'}
                $.ajax({
                    url: '/api/show_count',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: data2,
                    success: function (data, textStatus, jQxhr) {
                        $('#response2').text(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
                let data3 = {'name': 'Department'}
                $.ajax({
                    url: '/api/show_count',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: data3,
                    success: function (data, textStatus, jQxhr) {
                        $('#response3').text(data);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
                };
                
                loadStatsSite();
            </script>
        </div>
    `

    $('.body').append(mainPanel);
}

function createPopUp(title, size, position, content) {
    let start = `
     <div id="modal" class="modal">
    
        <div class="modal-top"><p>${title}</p><span id='popclose' class="close">&times;</span></div>
        <div class="modal-body">
        `

    let middle = ''

    if (content == 'reportBug') {
        middle = `<p>Podaj co sie wydarzyło i co cie dręczy</p><input name="opinion" type="text" id="opinion" maxlength="1000"><button id="send" class="popbutton" onclick="sendReport('bug', $('#opinion').val());">📤Wyślij</button>`
    } else if (content == 'editMode') {

    } else if (content == 'empty') {
        middle = '<div id="popdata"></div>'
    } else if (content == 'importLibrus') {
        middle = `<div id="modwrapper"><div id="left"></div>
        <div class="right">
              <div id="first">
                  <h2>Zapraszam do narzędzia importera!</h2>
                    <p>Możesz wysłać plik csv żeby zaimportować dane do aplikacji.</p>
                    <p>Mogą to być dane uczniów ale i nie tylko.</p>
                    <p>Jeśli chcesz zaimportować dane, kliknij przycisk poniżej.</p>
                    <br/>
                  <button id="next" onclick="$('#first').toggle();$('#form').toggle();">Dalej</button>
              </div>
              <div id="form" hidden><form>d</form></div>
        </div>
      <div class="push"></div>
    </div>`
    } else if (content == 'settings') {
        middle = `<div id="modwrapper"><div id="modleft">
             <ul class="choices">
              <li class="choice" onclick="change_setting_page('main')" id="mainsetting"><i class="fa-duotone fa-house"></i> Główne
              <li class="choice" onclick="change_setting_page('appearance')" id="appearances"><i class="fa-duotone fa-palette"></i> Wygląd
              <li class="choice" onclick="change_setting_page('identification')" id="identifications"><i class="fa-duotone fa-passport"></i> Identyfikacja
              <li class="choice" onclick="change_setting_page('account')" id="accounts"><i class="fa-duotone fa-user"></i> Konto
            </ul> 
            </div>
        <div class="modright">
        </div>
    </div>`
    } else {
        middle = `<div id='err'>No i znowu sie rozjehcało 😩😨😱🥵</div>`
    }

    let ending = `</div></div></div>`

    $('#load').append(start + middle + ending);
}

function createCalculator(title) {
    let start = `
        <div class="content-section">
  <div class="outer">
    <div class="middle">
      <div class="inner">
       `

    let titleblock = `
        <h1 style="text-align:center;">${title}</h1>
          <hr class="intro-divider">
         <div class="opt">
          <a onclick="showDocs()" class="clickable">
            <i class="fa fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa fa-bug "></i> Zgłoś błąd
          </a>
        </div>
    `

    let mid = `<div id="calcmain"><div class="grid" id="calcDepart"><div id="add" class="clickable" onclick="modalNew('Depart_create')"><i class="fa fa-user-plus"></i><h3>Dodaj nowy</h3></div></div><div id="howMuch"></div>`

    let ending = `</div></div></div></div>`


    let site = start + titleblock + mid + ending


    $('.body').append(site);

    let dataz = {'name': 'Department'}
    $.ajax({
        url: '/api/show_count',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: dataz,
        success: function (data, textStatus, jQxhr) {
            if (data == 0) {
                //TYCH TABELEK TO TUTAJ WOGLE BYC NIE POWINNO
                $('.center').append("Nie ma niczego");
            } else {
                $.ajax({
                    url: '/api/list_departments',
                    dataType: 'text',
                    type: 'get',
                    success: function (data, textStatus, jQxhr) {
                        let dataz = JSON.parse(data);
                        console.log(dataz)
                        $.each(dataz, function appendTable(key, value) {
                            $('.grid').append(`<div class='clickable cc' data-name='${value[1]}' id='${value[0]}'>
                                          <div class="classicons"><i onclick="removeDb('class', ${value[0]});" class="fa-thin fa-trash remove"></i>
                                          <i onclick="editDb('class, ${value}');" class="fa-thin fa-pen-to-square modify"></i>  </div>                 
                                          <i class="fa fa-users"></i><h3> ${value[1]} </h3></div>

                                          `)
                        });
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });

                $('#howMuch').append('WYświetlam: ' + data + 'z: ' + data + "</div>");

            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });

}

function openPopUp() {
    $('#modal').css('display', 'block');
}

function closePopUp() {
    $('#modal').remove();
}

function checkNav() {
    if ($('.sidenav').width() >= 100) {
        $('.body').css({'width': '80%'});
        $('.outer').css({'width': '80%'});
    }
}

function hideWhatIHave() {
    $('.body').empty();
}

function reportBug() {
    createPopUp('❗ Zgłoś błąd', 'large', 'center', 'reportBug');
    openPopUp();
}

function settings() {
    createPopUp('⚙️Ustawienia', 'large', 'center', 'settings');
    openPopUp();
    change_setting_page('main');
}


//ZAWSZE TO AKTUALIZOWAC
function xReload(site_now) {
    setTimeout(() => {
        hideWhatIHave();
        if (site_now == 'main') {
            createMainPanel();
            $(".botNav li").parent().find('li').removeClass("active");
            $('#panelli').addClass('active');
            $('.body').css({'width': '100%'});
        } else if (site_now == 'data') {
            $(".botNav li").parent().find('li').removeClass("active");
            $('#datali').addClass('active');
            createDataPanel();
        } else if (site_now == 'calc') {
            $(".botNav li").parent().find('li').removeClass("active");
            $('#calculatorli').addClass('active');
            createCalculator('📊Kalkulator');
        } else if (site_now == 'admin') {
            $(".botNav li").parent().find('li').removeClass("active");
            $('#adminli').addClass('active');
            createSubsite('👽Administratorzy', 'Employee');
        } else if (site_now == 'categories') {
            $(".botNav li").parent().find('li').removeClass("active");
            $('#categoryli').addClass('active');
            createSubsite('🗄️Kategorie', 'Role');
        } else if (site_now == 'class') {
            showClassCalculator(reloadId);
        }
        reload = site_now;
        checkNav();
    }, 150);
}

function sendReport(type, str) {
    let xdata = {'type': 'bug', 'desc': str};
    $.ajax({
        url: '/api/send_report',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            closePopUp();
            modalDone();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            closePopUp();
            modalError(jqXhr.responseText);
        }
    });
}

function removeReport(id) {
    let xdata = {'id': id};
    $.ajax({
        url: '/api/remove_report',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            $('.push').text(data);
            closePopUp();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function modalDone() {
    new swal("Wysłano", "udało się", "success", {
        button: "Ok",
    });
}

function modalError(data) {
    new swal("Błąd", data, "error", {
        button: "Ok",
    });
}

function modalNew(type) {
    if (type === 'Employee_create') {
        new swal({
            title: '➕ Dodajesz nowego Administratora',
            html: '<input id="swal-input1" class="swal2-input" value="Imię">' + '<input id="swal-input2" class="swal2-input" value="Nazwisko">' + '<input id="swal-input3" class="swal2-input" value="E-mail">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#swal-input2').val(), $('#swal-input3').val()

                    ])
                })
            },
            onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            new swal(JSON.stringify(result.value[0]))
        }).catch(swal.noop);
    } else if (type === 'Role_create') {
        new swal({
            title: '➕ Dodajesz nową Podkategorię',
            html: '<input id="swal-input1" class="swal2-input" value="Nazwa">' + '<input id="swal-input2" class="swal2-input" value="Opis">' + '<label for="quantity">Podaj wartość</label>' + '<input id="swal-input3" class="swal2-number" type="number" id="quantity" name="quantity" min="-1000000" max="100000">' + '<label for="boo">Czy można dodać tylko raz?</label>' + '<input id="swal-input4" class="swal2-check" type="checkbox" id="boo">' + '<label for="drop">Do jakiej kategorii ma należeć?</label>' + '<select id="items" class="swal2-select" name="items"></select>',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    console.log($('#swal-input4').is(':checked'));
                    resolve([$('#swal-input1').val(), $('#swal-input2').val(), $('#swal-input3').val(), $('#swal-input4').is(':checked'), $('#items').find('option:selected').attr('id')])
                })
            },
            didOpen: function () {
                $.each(categories, function (val, text) {
                    $('#items').append(`<option style="background-color: ${text[2]}; opacity=0.3" 
id="${text[0]}" onMouseOver="this.style.color=${text[2]}" onMouseOut="this.style.color=${text[2]}">${text[1]}</option>`)
                });
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            let xdata = {
                'name': result.value[0],
                'desc': result.value[1],
                'value': result.value[2],
                'times': result.value[3],
                'parent': result.value[4]
            };
            $.ajax({
                url: '/api/create_category',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                    categories = parseCategoriesX();
                    points = parsePointsX();
                    xReload(reload);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else if (type === 'ParentRole_create') {
        new swal({
            title: '➕ Dodajesz nową Kategorię',
            html: '<label for="swal-input1">Podaj nazwę</label>' + '<input id="swal-input1" class="swal2-input" value="Nazwa">' + '<label htmlFor="favcolor">Wybierz kolor:</label>' + '<input type="color" class="swal2-input" style="width: 20%;" id="favcolor" name="favcolor" value="#ff0000">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#favcolor').val()])
                })
            },
            onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            let xdata = {
                'name': result.value[0], 'color': result.value[1],
            };
            $.ajax({
                url: '/api/create_category_parent',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                    categories = parseCategoriesX();
                    points = parsePointsX();
                    xReload(reload);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
        categories = parseCategoriesX();
    } else if (type === 'Depart_create') {
        new swal({
            title: '➕ Dodajesz nową Klasę',
            html: '<input id="swal-input1" class="swal2-input" value="Nazwa">' + '<input id="swal-input2" class="swal2-input" value="Opis">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#swal-input2').val()])
                })
            },
            onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            let xdata = {'name': result.value[0], 'desc': result.value[1]};
            $.ajax({
                url: '/api/create_depart',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                    xReload(reload);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else if (type === 'Object_create') {
        new swal({
            title: '➕ Dodajesz nowego Ucznia', html: `<label for="Imie">Imię:</label>
                 <input id="swal-input1" class="swal2-input" name="Imie">
                 <label for="Nazwisko">Nazwisko:</label>
                 <input id="swal-input2" class="swal2-input" name="Nazwisko">
                 <label for="Opis">Opis:</label>  
                 <input id="swal-input3" class="swal2-input" name="Opis">       
                `, preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#swal-input2').val(), $('#swal-input3').val()])
                })
            }, onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            let xdata = {
                'id': reloadId, 'first_name': result.value[0], 'last_name': result.value[1], 'comment': result.value[2]
            };
            $.ajax({
                url: '/api/add_depart_object',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                    showClassCalculator(reloadId);
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else if (type === 'ProfilePhoto_create') {
        new swal({
            title: 'Zmieniasz zdjęcie profilowe',
            html: '<label htmlFor="file_input">Wybierz zdjęcie:</label>' + '<input type="file" id="file_input" class="swal2-input">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#file_input').val()])
                })
            },
            onOpen: function () {
                $('#file_input').focus();
            }
        }).then(function (result) {
            if (!document.getElementById('file_input').files[0]) {
                return;
            }
            let xdata = document.getElementById('file_input').files[0];
            $.ajax({
                url: '/api/send_profile_photo',
                type: 'post',
                processData: false,
                contentType: false,
                cache: false,
                async: false,
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else if (type === 'BackgroundPhoto_create') {
        new swal({
            title: 'Zmieniasz zdjęcie w tle',
            html: '<label htmlFor="file_input">Wybierz zdjęcie:</label>' + '<input type="file" id="file_input" class="swal2-input">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#file_input').val()])
                })
            },
            onOpen: function () {
                $('#file_input').focus();
            }
        }).then(function (result) {
            if (!document.getElementById('file_input').files[0]) {
                return;
            }
            let xdata = document.getElementById('file_input').files[0];
            $.ajax({
                url: '/api/send_bg_photo',
                type: 'post',
                processData: false,
                contentType: false,
                cache: false,
                async: false,
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else if (type === 'FaviconPhoto_create') {
        new swal({
            title: 'Zmieniasz ikonę strony',
            html: '<label htmlFor="file_input">Wybierz zdjęcie:</label>' + '<input type="file" id="file_input" class="swal2-input">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#file_input').val()])
                })
            },
            onOpen: function () {
                $('#file_input').focus();
            }
        }).then(function (result) {
            if (!document.getElementById('file_input').files[0]) {
                return;
            }
            let xdata = document.getElementById('file_input').files[0];
            $.ajax({
                url: '/api/send_footer_photo',
                type: 'post',
                processData: false,
                contentType: false,
                cache: false,
                async: false,
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    closePopUp();
                    modalDone();
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    closePopUp();
                    modalError(jqXhr.responseText);
                }
            });
        }).catch(swal.noop);
    } else {
        new swal("Błąd", "Ta funkcja nie została jeszcze dodana, lub nie działa w pełni", "error", {
            button: "Ok",
        });
    }

}

function showClassCalculator(classId, className) {
    $('#calcmain').empty();

    reloadId = classId;
    reload = 'class';

    let mid_dep = `

          <div class="center">
          <div class="buttons">
          </div>
          <div id="cl_container">
            <div id="cl_students" style="border-right: 1px solid grey; text-align: center">
              <i class="fa-duotone fa-user-circle fa-2xl"></i>
              <div id="cl_header"><h1 class="cl_points_title">Uczniowie</h1></div>
              <div id="cl_studlist" style=" text-align: left;"></div>
              <div id="cl_newstud"><a onclick="modalNew('Object_create')" class="btn btn-default btn-lg"><i class="fa fa-plus"></i>Dodaj nowy</a></div>
            </div>
            <div id="cl_points">
                <div id="cl_nostud" style="text-align: center">
                   <i id="cl_nostud_icon" class="fa-duotone fa-circle-exclamation fa-2xl"></i>
                   <h1 class="cl_points_title" id="cl_points_title">Wybierz ucznia</h1>
                   <h3 class="cl_points_subtitle" id="cl_points_subtitle"></h3>
                </div>
            </div>
            <div id="cl_additional" style="border-left: 1px solid grey">
                <div style="text-align: center">
                   <i class="fa-duotone fa-circle-info fa-2xl"></i>
                   <h1 class="cl_points_title">O uczniu</h1>
                      <div id="cl_additional_data"></div>
                </div>
            </div>
          </div>
        `

    $('#calcmain').append(mid_dep);

    let xdata = {'id': classId};

    $.ajax({
        url: '/api/get_depart_objects',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);
            let datay = datax[0];
            $.each(datay, function appendTable(key, value) {
                // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                $('#cl_studlist').append(`<div class="studObject" data-value='${value.id}' onclick="selectStud(${value.id}, '${value.first_name}', '${value.last_name}', '${value.comment}', '${className}', ${0})"> <span>${value.last_name} ${value.first_name} </span>
                                          <span> ${value.comment} </span>
                                          </div>
                                          `)
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });

    $.ajax({
        url: '/api/list_role_parents',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);
            $.each(datax, function appendTable(key, value) {
                // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                if (value.emoji == null) {
                    value.emoji = ''
                }
                $('#cl_points').append(`<div class="cl_points" id="cl_points_p${value.id}" hidden> 
                                          <span class="cl_points_parent" style="background-color: ${value.color}"><i class="fa-solid ${value.emoji}"></i> ${value.name} </span>
                                          </div>
                                          `);
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });

    $.ajax({
        //TODO: do jasnej cholery nie pokazuje bez kategorii i nie działa
        url: '/api/list_roles',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);
            $.each(datax, function appendTable(key, value) {
                // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                if (value.multiple === true) {
                    $(`#cl_points_p${value.parent_id}`).append(`
                    <div class="cl_points_child"><span id="cl_points_c${value.id}">${value.name}</span>
                       <span class="cl_points_counter">
                       <input type="button" class="cl_points_counter_seg" value="-" onclick="addpoint(${value.id}, -1)"/>
                       <input type="text" size="25" value="0" class="cl_points_counter_seg cl_points_counter_in"/> <span>razy</span>
                       <input type="button" class="cl_points_counter_seg" value="+" onclick="addpoint(${value.id}, 1)"/>
                       </span>
                   </div>
                    `);
                } else {
                    $(`#cl_points_p${value.parent_id}`).append(`
                    <div class="cl_points_child"><span id="cl_points_c${value.id}">${value.name}</span>
                       <span class="cl_points_counter cl_points_one">
                            <span class="one" onclick="addpoint(${value.id}, 1)">tak</span>
                       </span>
                       <span class="cl_points_counter cl_points_zero">
                            <span class="zero" onclick="addpoint(${value.id}, 0)">nie</span>
                       </span>
                   </div>
                    `);
                }

            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}


function selectStud(id, fname, lname, desc, dep, sum) {
    $(".cl_points").each(function () {
        $(this).removeAttr('hidden');
        $(`#cl_points_title`).html(`${fname.charAt(0).toUpperCase() + fname.slice(1)} ${lname.charAt(0).toUpperCase() + lname.slice(1)}`);
        $('#cl_points_title').data('value', id);
        $(`#cl_points_subtitle`).html(`Mam ${sum} punktów i uczęszczam do klasy ${dep} | ${desc}`);
        $('#cl_nostud_icon').attr('class', 'fa-duotone fa-pen-circle fa-2xl')
        $('#cl_additional_data').html(`<div class="ff">
                <p class="sub"><i class="fa-duotone fa-lightbulb"></i> D A N E</p>
                <div style="width: 100%;"><input type="text" oninput="modifyobject('first_name', this.value)" value="${fname}"><br><input type="text" oninput="modifyobject('last_name', this.value)" value="${lname}"><br><input type="text" oninput="modifyobject('comment', this.value)" value="${desc}"><br><p class="ds">Zmiany są zapisywane automatycznie</p></div>
            </div>`)
        $('#cl_additional_data').append(`<div class="ff">
                <p class="sub"><i class="fa-duotone fa-lightbulb"></i> N O T Y</p>
                <div id="notescu"></div>
                <div style="width: 100%;"><input type="text" id="object-note-input" placeholder="zanotuj coś..."><br><button class="btn" onclick="addobjectnote()">Dodaj</button></div>
            </div>`)
    });
    showcurrentpoints();
}


function exportData(type) {
    if (type === 'logs') {

        let xdata = {};
        $.ajax({
            url: '/api/get_logs',
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: xdata,
            success: function (data, textStatus, jQxhr) {
                let datax = JSON.parse(data);
                createPopUp('🪪Logi', 'large', 'center', 'empty');
                openPopUp();
                $.each(datax, function appendTable(key, value) {
                    // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                    $('#popdata').append(`<tr>
                                              <td> ${value} </td>
                                              `)
                });
            },
            error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        });
    }

}


function removeData(type) {
    if (type === 'logs') {
        new swal({
            title: 'Czy na pewno?',
            text: "Nie ma odwrotu - wszystkie logi zostaną wymazane",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Usuwamy!',
            cancelButtonText: 'Jednak nie',
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            buttonsStyling: false
        }).then(function () {
            $.ajax({
                url: '/api/remove_logs',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data, textStatus, jQxhr) {
                    swal('Usunięto!', 'Logi zostały wymazane', 'success')
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    modalError(jqXhr.responseText);
                }
            });
        })
    }
}

function editMode() {
    $('.editcontent').empty();
    $('.editcontent').show();
    $('.table').hide();
    $('#editmode').addClass('disabled');
    $('#editmode').removeClass('clickable');

    $('#viewmode').removeClass('disabled');
    $('#viewmode').addClass('clickable');

    let xdata = {'id': reloadId};
    $.ajax({
        url: '/api/get_depart_objects',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let datax = JSON.parse(data);
            let datay = datax[0];
            let studs = [];
            let defid = 0;

            $('.table').hide()

            $.each(datay, function appendTable(key, value) {
                studs.push([value.id, value.first_name, value.last_name, value.comment]);
            });
            $('.editcontent').append(`<div class="cat_edit_header"><span id="prev">🔙</span><span class="name">${studs[0][1]} ${studs[0][2]}</span><span id="next">🔜</span></div>`)
            $.ajax({
                url: '/api/show_count',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    if (data == 0) {
                        //TYCH TABELEK TO TUTAJ WOGLE BYC NIE POWINNO
                        $('.table').remove();
                        $('.center').append("Nie ma niczego");
                    } else {
                        let shown = [];
                        $.each(categories, function appendTable(key, value) {
                            $('.table').append(`<tr>
                            <td style="background-color: ${value[2]}; opacity: 0.8; color: black;" colspan=5"> ${value[1]}⠀⠀
                            <a style='color: black;' onclick="editDb('category', '${value}')" ><i class="fa fa-pencil"></i> Edytuj⠀⠀</a>
                            <a style='color: black;' onclick="removeDb('category', '${value[0]}')" ><i class="fa fa-trash"></i> Usuń</a></td></td>
                            `)
                            let found = points.filter(element => element[5] == value[0]);
                            if (found.length > 0) {
                                $.each(found, function appendTable(key, value) {
                                    console.log(value[5])
                                    $(`.editcontent #${value[5]}`).append(`<div class="cat_edit_sub" id="${value[0]}">
                                            <div class="tooltipX" id="${value[0]}">
                                            <span> <i> ${value[2]} </i> </span>
                                            </div>
                                            <span> ${value[1]}</span>
                                            <span> [${value[3]}] </span>
                                            <input type="checkbox" id="${value[0]}"></div>
                                            `)
                                });
                            } else {
                                $('.table').append(`<tr>
                            <td  colspan=5"> Nie ma nic w tej kategorii</td>
                            `)
                            }

                        });

                        let found2 = points.filter(element => !shown.includes(element[0]));

                        if (found2.length > 0) {
                            $('.table').append(`<tr>
                            <td style="background-color: gray; opacity: 0.8; color: black;" colspan=5"> Bez przypisanej kategorii</td>
                            `)

                            $.each(found2, function appendTable(key, value) {
                                shown.push(value[0]);
                                $('.table').append(`<tr>
                                    <td> ${value[1]}</td>
                                    <td> ${value[2]}</td>
                                    <td> ${value[3]} </td>
                                    <td> TODO </td>
                                    <td id=${value.id}><a class="clickable" onclick="editDb('subcategory', ${value})">
                                    <i class="fa fa-pencil"></i> Edytuj⠀⠀</a>
                                    <a class="clickable" onclick="removeDb('subcategory', ${value[0]})">
                                    <i class="fa fa-trash"></i> Usuń</a></td>
                                `)
                            });


                        }
                    }
                    $('.table').append('Wyświetlam: <span id="shown">' + data + '</span> z <span id="total">' + data + '</span>');
                }
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
    $.each(categories, function appendTable(key, value) {
        $('.editcontent').append(`
                            <div class="edit_mode_header" id='${value[0]}' style="background-color: ${value[2]}; opacity: 0.8; color: black;"> ${value[1]}⠀⠀                            `)
        let found = points.filter(element => element[5] == value[0]);


    });
}

function viewMode() {
    $('.editcontent').hide();
    $('.table').show();
    $('#editmode').removeClass('disabled');
    $('#editmode').addClass('clickable');
    $('#viewmode').addClass('disabled');
    $('#viewmode').removeClass('clickable');
}


function editDb(context, id) {
    context = context.toArray()
    if (context[0] == 'class') {
        new swal({
            title: 'Edytujesz klasę',
            text: "Nie ma odwrotu - wszystkie logi zostaną wymazane",
            type: 'info',
            html: `<input id="swal-input1" class="swal2-input" value="${id[1]}">` + `<input id="swal-input2" class="swal2-input" value="${id[2]}">`,
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#swal-input2').val(),

                    ])
                })
            },
            onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            $.ajax({
                url: '/api/edit',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data, textStatus, jQxhr) {
                    swal('Usunięto!', 'Logi zostały wymazane', 'success')
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    modalError(jqXhr.responseText);
                }
            });
        })
    }
    return 0;
}


function removeDb(context, id) {
    let xdata = {'id': id};

    switch (context) {
        case 'class':
            new swal({
                title: 'Czy na pewno?',
                text: "Jeżeli w klasie pozostali jacyś uczniowie to zostaną oni zeksterminowani",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Usuwamy!',
                cancelButtonText: 'Daruję im',
                confirmButtonClass: 'btn btn-success',
                cancelButtonClass: 'btn btn-danger',
                buttonsStyling: false
            }).then(function () {
                $.ajax({
                    url: `/api/remove_${context}`,
                    dataType: 'text',
                    type: 'post',
                    data: xdata,
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data, textStatus, jQxhr) {
                        new swal('Usunięto!', 'Klasa została wymazana z istnienia', 'success')
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
            });
        case 0:
            console.log(0);
            break;

        case 1:
            console.log(1);
            break;
        case 2:
            console.log(2);
            break;
        default:
            $.ajax({
                url: `/api/remove_${context}`,
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: xdata,
                success: function (data, textStatus, jQxhr) {
                    $(`#${id}`).parent().remove();
                    $('#total').text(parseInt($('#total').text()) - 1);
                    $('#shown').text(parseInt($('#shown').text()) - 1);
                    if (context == 'category' || context == 'subcategory') {
                        categories = parseCategoriesX();
                        points = parsePointsX();
                        xReload('categories');
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    modalError(jqXhr.responseText);
                }
            });
    }
}


function v2_noAdmin() {
    createCalculator(`🧮 Witaj w kalkulatorze!`);
}


function change_setting_page(page) {
    $(".choices").parent().find('li').removeClass("active");
    $('.modright').text('🏃🏻ładowanie...');
    let setupname = $('.appname').first().text()
    if (page === 'main') {
        let xdata = {'type': 'allow_register is_dynamic'};
        $.ajax({
            url: `/api/get_value`,
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: xdata,
            success: function (data, textStatus, jQxhr) {
                $('#mainsetting').addClass('active');
                $('.modright').html(`<h2>😶‍🌫️ Witaj w ustawieniach ${setupname}</h2><p>Zarządzaj swoją instancją aplikacji</p><hr>
                <p id="main-s1"></p>
                <button id="main-s2" onclick=""></button><br><hr>
                <p id="main-s3"></p><button id="main-s4" onclick=""></button>`);

                let vdata = JSON.parse(data);
                console.log(vdata)
                if (vdata[0] == 0) {
                    $('#main-s4').text('umożliwiaj rejestrację');
                    $('#main-s3').text('Obecnie tylko Administrator może tworzyć użytkowników z poziomu systemu');
                    $('#main-s4').attr('onclick', `change_setting('allow_register', 1, 'main')`);
                } else {
                    $('#main-s4').text('uniemożliwiaj rejestraocję');
                    $('#main-s3').text('Obecnie każdy może korzystać z formularza Rejestracji');
                    $('#main-s4').attr('onclick', `change_setting('allow_register', 0, 'main')`);
                }
                if (vdata[1] == 1) {
                    $('#main-s1').text('Teraz korzystasz z nowego, lepszego trybu aplikacji. Jest on eksperymentalny ale paradoksalnie działa lepiej niż ten stary');
                    $('#main-s2').text('używaj starego trybu aplikacji')
                    $('#main-s2').attr('onclick', `change_setting('is_dynamic', 0, 'main')`)
                } else {
                    $('#main-s1').text('LEPIEJ TO ZMIEń');
                    $('#main-s2').text('używaj nowego trybu aplikacji')
                    $('#main-s2').attr('onclick', `change_setting('is_dynamic', 1, 'main')`)
                }
            },
            error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        });
    } else if (page === 'appearance') {
        $('#appearances').addClass('active');
        let xdata = {'type': 'bg_photo footer_photo'};
        $.ajax({
            url: `/api/get_value`,
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: xdata,
            success: function (data, textStatus, jQxhr) {
                let vdata = JSON.parse(data);

                $('.modright').html(`<h2>🖌️ Niechaj ${setupname} wygląda dla Ciebie</h2><p>Dostosuj wygląd aplikacji</p><hr>
                <p>Wybierz tryb wyglądu</p>
                <button onclick="change_setting('theme', 0, 'appearance')">jasny</button>
                <button onclick="change_setting('theme', 1, 'appearance')">ciemny</button><br><hr>
                <p>Wybierz kolor akcentu</p>
                <button onclick="change_setting('color', 0, 'appearance')">granatowy</button>
                <button onclick="change_setting('color', 1, 'appearance')">ciemnobeżowy</button>
                <button onclick="change_setting('color', 2, 'appearance')">fioletowy</button><br><hr>
                <p>Wybierz baner na stronie głównej</p>
                <button onclick="modalNew('BackgroundPhoto_create')">wstaw swój</button><button>przywróć domyślny</button><br><hr>
                <p>Wybierz zdjęcie w stopce i favicon</p>
                <button onclick="modalNew('FaviconPhoto_create')">wstaw swój</button><button>przywróć domyślny</button><br><hr>`);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        });
    } else if (page === 'identification') {
        $('#identifications').addClass('active');
        $('.modright').html(`<h2>📋 Jednak nie ${setupname}?</h2><p>Zmień nazwę i nie tylko...</p><hr>
        <p>Wybierz nazwę aplikacji</p><input type="text" id="name_changeable" value="${setupname}"><button onclick="updatename();">zapisz</button><br><hr>
        <h4>Więcej opcji na razie nie dodaje</h4>`);
    } else if (page === 'account') {
        $('#accounts').addClass('active');
        $('.modright').html('<h4>Więcej opcji na razie nie dodaje</h4>zmień dane swojego konta<br>zmień hasło');
    }
}

function change_setting(type, value, page) {
    let xdata = {'type': type, 'value': value};
    $.ajax({
        url: `/api/set_value`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            if (page == 'appearance') {
                render_theme();
            }
            modalDone(data);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
    change_setting_page(page);
}

function render_theme() {
    let xdata = {'type': 'theme color'};
    $.ajax({
        url: `/api/get_value`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            if (vdata[0] == 0) {
                $("body").attr("style", "--bg-color: rgb(240, 240, 240); --bg-color-accent: rgb(220, 220, 220);--fg-color: rgb(0, 0, 0);");
            } else if (vdata[0] == 1) {
                $("body").attr("style", "--bg-color: rgb(0, 0, 0); --bg-color-accent: rgb(30, 30, 30);--fg-color: rgb(220, 220, 220);");
            } else {
                modalError('Błąd strony');
            }
            if (vdata[1] == 0) {
                $("body").attr("style", function () {
                    return $("body").attr("style") + "--main-color:rgb(29, 74, 163); --main-color-glass:rgba(29, 74, 163, 0.7)"
                });
            } else if (vdata[1] == 1) {
                $("body").attr("style", function () {
                    return $("body").attr("style") + "--main-color:rgb(140, 125, 88); --main-color-glass:rgba(140, 125, 88, 0.8)"
                });
            } else if (vdata[1] == 2) {
                $("body").attr("style", function () {
                    return $("body").attr("style") + "--main-color:rgb(130, 75, 150); --main-color-glass:rgba(130, 75, 150, 0.8)"
                });
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function showonly(type) {
    $('#poz').attr('class', 'clickable');
    $('#neg').attr('class', 'clickable');
    $('#neu').attr('class', 'clickable');
    if (type == '+') {
        $('tr').each(function () {
            $('#poz').attr('class', 'disabled');
            if ($(this).attr('data-value') > 0 || $(this).attr('data-value') == undefined) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else if (type == '-') {
        $('#neg').attr('class', 'disabled');
        $('tr').each(function () {
            if ($(this).attr('data-value') < 0 || $(this).attr('data-value') == undefined) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    } else {
        $('#neu').attr('class', 'disabled');
        $('tr').each(function () {
            $(this).show();
        });
    }
}


function showcurrentpoints() {
    $('.cl_active').each(function () {
        $(this).removeClass('cl_active');
    });
    console.log($('#cl_points_title').data('value'));
    let xdata = {'id': $('#cl_points_title').data('value')};
    $.ajax({
        url: `/api/get_object_points_for_view2`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            for (let i = 0; i < vdata.length; i++) {
                let x = $(`#cl_points_c${vdata[i][0]}`).parent().children('.cl_points_counter').children('.cl_points_counter_in')
                console.log(x)
                if (x.length !== 0) {
                    x.val(vdata[i][1]);
                } else {
                    console.log('trigger')
                    if (vdata[i][1] == 1) {
                        $(`#cl_points_c${vdata[i][0]}`).parent().children('.cl_points_one').children('.one').addClass('cl_active');
                    } else {
                        $(`#cl_points_c${vdata[i][0]}`).parent().children('.cl_points_zero').children('.zero').addClass('cl_active');
                    }
                }
            }
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
    //get notes
    $.ajax({
        url: `/api/get_object_notes`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            $('#notescu').empty()
            $.each(vdata, function appendTable(key, value) {
                console.log(vdata)
                $('#notescu').append(`<div class="note">
                                          <span> ${value[1]} </span>
                                          <span> [${value[2]}] </span>
                                          <span><i onclick="removenote(${value[0]})" class="fa-trash fa-duotone"></i></span>
                                          </div>
                                          `)
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })
}

function addpoint(id, value) {
    let xdata = {'user': $('#cl_points_title').data('value'), 'id': id, 'value': value};
    $.ajax({
        url: `/api/add_point`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function modifyobject(type, value) {
    if (value == '' || value == null) {
        value = ' ';
    }
    let xdata = {'id': $('#cl_points_title').data('value'), 'key': type, 'value': value};
    $.ajax({
        url: `/api/update_object`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });

}

function addobjectnote() {
    const ob = document.getElementById('object-note-input');
    let xdata = {'id': $('#cl_points_title').data('value'), 'note': ob.value};
    $.ajax({
        url: `/api/add_object_note`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function removenote(id) {
    let xdata = {'id': id};
    $.ajax({
        url: `/api/remove_object_note`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints();
        }
    });
}

function editemp(id, key, value) {
    console.log('triggered!')
    let xdata = {'id': id, 'key': key, 'value': value};
    $.ajax({
        url: `/api/update_employee`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            //TODO
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function editprimcat(id, key, value) {
    if (key === 'color') {
        $(`#pa_${id}`).css('background-color', value);
    }
    let xdata = {'id': id, 'key': key, 'value': value};
    $.ajax({
        url: `/api/update_category`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            categories = parseCategoriesX();
            points = parsePointsX(categories);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function editcat(id, key, value) {
    console.log(value)
    let xdata = {'id': id, 'key': key, 'value': value};
    $.ajax({
        url: `/api/update_subcategory`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            categories = parseCategoriesX();
            points = parsePointsX(categories);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function iconpicker(id) {
    createPopUp('Wybierz emotkę', 'small', 'center', 'empty');
    openPopUp();
    $('#popdata').append(`<div class="emoji-picker-container">
    <i class="fa-duotone fa-handshake" onclick="editprimcat(${id}, 'emoji', 'fa-handshake')"></i>
    <i class="fa-duotone fa-face-angry" onclick="editprimcat(${id}, 'emoji', 'fa-face-angry')"></i>
    <i class="fa-duotone fa-money-bill" onclick="editprimcat(${id}, 'emoji', 'fa-money-bill')"></i>
    <i class="fa-duotone fa-comments" onclick="editprimcat(${id}, 'emoji', 'fa-comments')"></i>
    <i class="fa-duotone fa-graduation-cap" onclick="editprimcat(${id}, 'emoji', 'fa-graduation-cap')"></i>
    <i class="fa-duotone fa-atom" onclick="editprimcat(${id}, 'emoji', 'fa-atom')"></i>
    <i class="fa-duotone fa-award" onclick="editprimcat(${id}, 'emoji', 'fa-award')"></i>
    <i class="fa-duotone fa-baby" onclick="editprimcat(${id}, 'emoji', 'fa-baby')"></i>
    <i class="fa-duotone fa-city" onclick="editprimcat(${id}, 'emoji', 'fa-city')"></i>
    <i class="fa-duotone fa-bacon" onclick="editprimcat(${id}, 'emoji', 'fa-bacon')"></i>
    <i class="fa-duotone fa-dumpster-fire" onclick="editprimcat(${id}, 'emoji', 'fa-dumpster-fire')"></i>
    <i class="fa-duotone fa-dragon" onclick="editprimcat(${id}, 'emoji', 'fa-dragon')"></i>
    <i class="fa-duotone fa-user-bounty-hunter" onclick="editprimcat(${id}, 'emoji', 'fa-user-bounty-hunter')"></i>
    <i class="fa-duotone fa-user-astronaut" onclick="editprimcat(${id}, 'emoji', 'fa-user-astronaut')"></i>
    <i class="fa-duotone fa-flag-checkered" onclick="editprimcat(${id}, 'emoji', 'fa-flag-checkered')"></i>
    <i class="fa-duotone fa-user-cowboy" onclick="editprimcat(${id}, 'emoji', 'fa-user-cowboy')"></i>
    <i class="fa-duotone fa-user-ninja" onclick="editprimcat(${id}, 'emoji', 'fa-user-ninja')"></i>
    <i class="fa-duotone fa-user-secret" onclick="editprimcat(${id}, 'emoji', 'fa-user-secret')"></i>
    <i class="fa-duotone fa-user-tie" onclick="editprimcat(${id}, 'emoji', 'fa-user-tie')"></i>
    <i class="fa-duotone fa-user-graduate" onclick="editprimcat(${id}, 'emoji', 'fa-user-graduate')"></i>
    <i class="fa-duotone fa-user-md" onclick="editprimcat(${id}, 'emoji', 'fa-user-md')"></i>
    <i class="fa-duotone fa-user-injured" onclick="editprimcat(${id}, 'emoji', 'fa-user-injured')"></i>
    </div>`);
}

function changeParent(id) {

    new swal({
        title: '<i class="fa-duotone fa-pen-circle"></i> Zmieniasz kategorię punktu',
        html: '<label for="drop">Do jakiej kategorii ma należeć?</label>' + '<select id="items" class="swal2-select" name="items"></select>',
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve([$('#items').find('option:selected').attr('id')])
            })
        },
        didOpen: function () {
            $.each(categories, function (val, text) {
                $('#items').append(`<option style="background-color: ${text[2]}; opacity=0.3" 
id="${text[0]}" onMouseOver="this.style.color=${text[2]}" onMouseOut="this.style.color=${text[2]}">${text[1]}</option>`)
            });
        }
    }).then(function (result) {
        let xdata = {'id': id, 'key': 'parent_id', 'value': result.value[0]};
        console.log(xdata)

        $.ajax({
            url: '/api/update_subcategory',
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            data: xdata,
            success: function (data, textStatus, jQxhr) {
                closePopUp();
                modalDone();
                categories = parseCategoriesX();
                points = parsePointsX();
                xReload(reload);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                closePopUp();
                modalError(jqXhr.responseText);
            }
        });
    }).catch(swal.noop);
}

function updatename() {
    let val = $('#name_changeable').val();
    $.ajax({
        url: '/api/send_appname',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: {'name': val},
        success: function (data, textStatus, jQxhr) {
            modalDone();
            $('.appname').text(val);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })
}

$(document).on('click', '#popclose', function () {
    $('#modal').remove();
});

$(document).on('click', '.cc', function (e) {
    if (e.target !== this) return;

    showClassCalculator(e.target.id, $(this).data('name'));
});

$(document).on('mouseenter', '.cat_edit_sub', function (event) {
    console.log(event.target.id)
    $(this).children('.tooltipX').show('slow');
}).on('mouseleave', '.cat_edit_sub', function (event) {
    $(this).children('.tooltipX').hide('blind', function () {
        $('.tooltipX').hide();
    });
});

$(document).on('mousemove', '.cat_edit_sub', function (event) {
    let x = $(this).children('.tooltipX')
    x.css('top', event.clientY + 10)
    x.css('left', event.clientX + 20);
});

