// noinspection HtmlDeprecatedAttribute

let reload = 'main';
let reloadId = 0;
let reloadName = '';
let reloadIdChild = 0;
let currentView = 'default'
let is_admin;

let categories = parseCategoriesX();
let points = parsePointsX(categories);

console.log('init')

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
            <i class="fa-duotone fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa-duotone fa-info-circle "></i> Zgłoś coś
          </a>
        </div>
    `

    let mid_emp = `

          <div class="center">
            <table class="table table-striped table-bordered">
              <thead>
                <tr>
                  <th width="10%"> Zdjęcie </th>
                  <th width="10%"> Imię/Nazwisko</th>
                  <th width="10%"> Nazwa użytkownika</th>
                  <th width="20%"> Uprawnienia do: </th>
                  <th width="20%"> E-mail </th>
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
                  <th width="25%"> Nazwa</th>
                  <th width="20%"> Opis </th>
                  <th width="15%"> Wartość </th>
                  <th width="15%" style="font-size: 1vw !important;"> Liczba osób które posiadają</th>
                  <th width="10%" style="font-size: 1vw !important;"> Czy można dodawać wielokrotnie? </th>
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
                                is_pies = `👑 Administrator totalny<br><a onclick="adminSwitch(${value.id})"><i class="fa-solid fa-user"></i> Zmień na zwykłego</a>`;
                            } else if (Array.isArray(value.is_admin)) {
                                is_pies = '👥 Użytkownik z uprawnieniami do: <br>';
                                for (let i = 0; i < value.is_admin.length; i++) {
                                    is_pies += value.is_admin[i].name + `<a onclick="removePermission(${value.is_admin[i].p})"> <i class="fa-solid fa-trash"></i> Usuń</a><br>`;
                                }
                                is_pies += `
                                <a onclick="addPerm(${value.id})"> <i class="fa-solid fa-plus"></i> Dodaj uprawnienie</a><br>
                                <a onclick="adminSwitch(${value.id})"> <i class="fa-solid fa-crown"></i> Zmień na admina</a>`;
                            } else {
                                is_pies = `👤 Użytkownik bez dostępu do niczego!`;
                                is_pies += `<br>
                                <a onclick="addPerm(${value.id})"> <i class="fa-solid fa-plus"></i> Dodaj uprawnienie</a><br>
                                <a onclick="adminSwitch(${value.id})"> <i class="fa-solid fa-crown"></i> Zmień na admina</a>`;
                            }
                            $('.table').append(`<tr>
                                        <td> <img src="/static/user_content/profile_photo/${value.profile_photo}" width="100px" height="100px"> </td>
                                      <td> <input class="undis" type="text" placeholder='Podaj imię!!!' oninput="editemp(${value.id}, 'first_name', this.value);" value='${value.first_name}' id='ddsd'> <input oninput="editemp(${value.id}, 'last_name', this.value)" placeholder='Podaj nazwisko!!!' class="undis" type="text" value="${value.last_name}"> </td>
                                      <td> <input class="undis" type="text" placeholder='Podaj nazwę użytkownika!!!' oninput="editemp(${value.id}, 'username', this.value);" value='${value.username}'> </td> 
                                      <td> <!--${value.permissions}--!> ${is_pies} </td>
                                      <td> <input class="undis" type="text" placeholder='Podaj e-mail!!!' oninput="editemp(${value.id}, 'email', this.value);" value='${value.email}'> </td>
                                      <td id=${value.id}>
                                            <a class="clickable" onclick="removeDb('employee', ${value.id})">
                                            <i class="fa fa-trash"></i> Usuń</a><a class="clickable" onclick="resetPassword(${value.id})">
                                            <i class="fa fa-key-skeleton"></i> Reset hasła</a></td>
                                      `)
                        });
                          if ($('#append tr').length == 0) {
                              $('.center').append("<h1 style='text-align: center;'>Nie ma niczego</h1>");
                              $('.table').remove();
                          }

                          $('.table').append('<td colspan="2" style="border:none !important;">Wyświetlam: <span id="shown">' + $('#append tr').length + '</span> z <span id="total">' + $('#append tr').length + '</span></td>');
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
                      if ($('#append tr').length == 0) {
                          $('.center').append("<h1 style='text-align: center;'>Nie ma niczego</h1>");
                          $('.table').remove();
                      }

                      $('.table').append('<td colspan="2" style="border:none !important;">Wyświetlam: <span id="shown">' + $('#append tr').length + '</span> z <span id="total">' + $('#append tr').length + '</span></td>');
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
                        <input type="text" placeholder="Podaj nazwę kategorii!!" class="undis uncategory" value="${value[1]}" oninput="editprimcat(${value[0]}, 'name', this.value);">
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
                            <td> <input type="text" class="undis" value="${value[1]}" placeholder="Podaj nazwę!!!" editcat(${value[0]}, 'name', this.value);"></td>
                            <td> <input type="text" class="undis" value="${value[2]}" placeholder="Podaj opis!!!" oninput="editcat(${value[0]}, 'description', this.value);"></td>
                            <td> <input type="text" class="undis" value="${value[3]}" placeholder="Podaj wartość!!!" oninput="editcat(${value[0]}, 'value', this.value);"> </td>
                            <td> ${value[6]} </td>
                            <td> <input type="checkbox" ${m} oninput="editcat(${value[0]}, 'multiple', this.checked);"> </td>
                            <td id=${value.id}>                                
                            <a class="clickable" onclick="changeParent('${value[0]}')"><i class="fa-sharp fa-regular fa-right-left"></i>Inna kat.</a>
                            <a class="clickable" onclick="removeDb('subcategory', '${value[0]}')">
                            <i class="fa fa-trash"></i> Usuń</a></td>
                            `)
                        });


                    } else {
                        $('.table').append(`<tr>
                        <td  colspan=6"> Nie ma nic w tej kategorii</td>
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
                            <td> <input type="text" class="undis" value="${value[1]}" oninput="editcat(${value[0]}, 'name', this.value);"></td>
                            <td> <input type="text" class="undis" value="${value[2]}" oninput="editcat(${value[0]}, 'description', this.value);"></td>
                            <td> <input type="text" class="undis" value="${value[3]}" oninput="editcat(${value[0]}, 'value', this.value);"> </td>
                            <td> ${value[6]} </td>
                            <td> <input type="checkbox" ${m} oninput="editcat(${value[0]}, 'multiple', this.checked);"> </td>
                            <td id=${value.id}>                                
                            <a class="clickable" onclick="changeParent('${value[0]}')"><i class="fa-sharp fa-regular fa-right-left"></i>Inna kat.</a>
                            <a class="clickable" onclick="removeDb('subcategory', '${value[0]}')">
                            <i class="fa fa-trash"></i> Usuń</a></td>
                            `)
                    });
                    }

                  if ($('#append tr').length == 0) {
                      $('.center').append("<h1 style='text-align: center;'>Nie ma niczego</h1>");
                      $('.table').remove();
                  }

                  $('.table').append('<td colspan="2" style="border:none !important;">Wyświetlam: <span id="shown">' + $('#append tr').length + '</span> z <span id="total">' + $('#append tr').length + '</span></td>');
                }
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
            <i class="fa-duotone fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa-duotone fa-info-circle "></i> Zgłoś coś
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
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="createPopUp('📲Eksport do Librusa', 'large', 'center', 'exportLibrus');openPopUp();">
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
             <span style="text-align: center; width: 45%; margin: 0 3%;" onclick="showReports()">
                <a class="btn btn-default btn-lg">
                    <i class="fa fa-plus"></i>
                    Wyświetl listę zgłoszeń
                </a>
             </span>
             <span style="text-align: center; width: 45%; margin: 0 2%;" onclick="removeData('rapports')">
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

async function createMainPanel() {
    $.ajax({
        url: '/api/get_design', dataType: 'text', type: 'get', contentType: 'application/x-www-form-urlencoded'
    }).done(function (result) {
        console.log(result)
        result = JSON.parse(result);
        if (result[6] == 0) {
            $('.intro-header').css("background-image", "url(../static/" + result[3] + ")");
        } else {
            render_theme()
        }
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
                <div style="margin-left: 3%;" id="tipinfo"></div>
                <button class="btn" onclick=tip();>Następna porada</button>
            </div>

            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-brake-warning"></i> Z G Ł O S Z E N I A</p>
                <div id="report"><div id='repcontent'></div><button class='btn' onclick='showReports()'>zobacz więcej</button</div></div>
            </div>
            
            <div class="float-child">
                <p class="sub"><i class="fa-duotone fa-head-side"></i> P R O F I L</p>
                <div id="profile"></div>
                <div id="profile_settings">
                <button class="btn" onclick="modalNew('MyProfile_open')">Otwórz profil</button>

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
            function loadProfileSite() {
                $.ajax({
                    url: '/api/get_my_data',
                    dataType: 'text',
                    type: 'get',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data, textStatus, jQxhr) {
                        let datay = JSON.parse(data);
                        if (datay.is_admin) is_admin = true; else is_admin = false;
                        $('#profile').append('<div class="saferemove" style="padding: 20px; "><i class="fa-duotone fa-user"></i>' + datay.first_name + ' ' + datay.last_name + '<div>');
                        $('#profile').append('<div class="saferemove" style="padding: 20px; "><i class="fa-duotone fa-envelope"></i>' + datay.email + '<div>');
                        showReportsSite();
                    }
                });
                };
                
                loadProfileSite();
                
            function showReportsSite() {
                if (!is_admin) {
                    $('#report').parent().remove();
                    return;
                    }
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
            
            function tip() {
                let tips = [
                    'By wejść na tą stronę można użyć przeglądarki na np. komputerze.',
                    'Aplikacja jest w fazie testów, więc mogą wystąpić błędy.',
                    'Zgłaszaj błędy i propozycje, by pomóc w rozwoju aplikacji.',
                    'By dostać się do aplikacji należy posiadać na niej konto',
                    'Ta aplikacja jest rozwijana już dwa lata a ciągle niewiele działa',
                    'Aplikacja jest rozwijana przez jedną osobę, więc nie ma co się dziwić, że jest tak mało funkcji',
                    'Edytowanie tabel jest tak proste, że nawet dziecko by sobie z tym poradziło',
                    'Dodawanie punktów jest teraz lekkie i przyjemne.'
                ];
                let ind = Math.floor(Math.random()*tips.length);
            
                $('#tipinfo').text(tips[ind]);
            }
            
            tip();
            
            
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

    await $('.body').append(mainPanel);
}

function createPopUp(title, size, position, content) {
    let start = `
     <div id="modal" class="modal">
    
        <div class="modal-top"><p>${title}</p><span id='popclose' class="close">&times;</span></div>
        <div class="modal-body">
        `

    let middle = ''

    if (content == 'reportBug') {
        middle = `<p style="text-align: center;">O czym chcesz nam powiedzieć?</p>
        <div class="buttons">
        <a class="disabled" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('bug');">Zgłaszam błąd</a>
        <a class="clickable" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('info');">Mam pomysł</a>
        <a class="clickable" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('other');">Coś innego</a>
        </div><input name="opinion" type="text" id="opinion" maxlength="1000"><input id="tiptypex" hidden value="bug"><br>
        <button id="send" class="popbutton" onclick="sendReport($('#opinion').val(), $('#tiptypex').val());">📤Wyślij</button>`
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
              <div id="form" hidden><form id="duex">Obecnie możliwy jest tylko import
               z plików PDF które zostały wyeksportowane z Librusa
               <input type="file" id="tbl" name="tbl" accept="application/pdf" onchange="
               $('#form').toggle();
               $('#first').toggle();
               $('#first').text('Gotowe.');
               let formData = new FormData();
               formData.append('file', $('#tbl')[0].files[0]);

               $.ajax({
                  url: '/calculations/f',
                  type: 'POST',
                  data: formData,
                  async: false,
                  cache: false,
                  contentType: false,
                  enctype: 'multipart/form-data',
                  processData: false,
               });
               "/>
               </form></div>
        </div>
      <div class="push"></div>
    </div>`
    } else if (content == 'exportLibrus') {
        middle = `<div id="modwrapper"><div id="left"></div>
    
        <div class="right" style="width: 100%;">
                <div id="first">
                    <h2>Zapraszam do narzędzia eksportera!</h2>
                    <p>Możesz wyeksportować dane z aplikacji do pliku csv.</p>
                    <p>Mogą to być dane uczniów ale i nie tylko.</p>
                    <p>Jeśli chcesz wyeksportować dane, kliknij przycisk poniżej.</p>
                    <br/>
                    <button id="next" onclick="$('#first').toggle();$('#form').toggle();">Dalej</button>
                </div>
                <div id="form" hidden style="width: 100%;">
                    <input id="tiptypex" type="text" value="lib" disabled hidden>
                    <div class="buttons" style="width: 100%;">
                    <a class="clickable" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('zip');xexport('zip');">Zip + CSV</a>
                    <a class="clickable" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('lib');xexport('lib');">Librus</a>
                    <a class="clickable" id="poz" onclick="$('.disabled').removeClass('disabled').addClass('clickable');$(this).addClass('disabled').removeClass('clickable'); $('#tiptypex').val('sql');xexport('sql');">SQL</a>
                    </div>
                    <form><h1>Dla librusa potrzebuje wyglądu danych do eksportu</h1></form>
                    </div>
        </div>    
        <div class="push"></div>
    </div>`


    } else if (content == 'settings') {
        console.log(is_admin)
        if (is_admin === false) return modalError('Niestety na tą chwilę tylko Administratorzy mogą zmieniać wybrane opcje tej aplikacji.'); //TODO
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
    } else if (content == 'docs') {
        middle = `<div class="help-header" style="margin: -9.5vh -20vw;">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="help-message scale-up-top">
                            <h1>Instalacja i pierwsze uruchomienie aplikacji</h1>
                            <h3>To nic trudnego!</h3>
                            <div style="text-align: center">
                                <a class="btn btn-default btn-lg">
                                    <i class="fa fa-book"></i>
                                    Przeczytaj teraz
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="help-header2">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="help-message scale-up-top">
                            <h1>Konfiguracja aplikacji</h1>
                            <h3>W tym zabezpieczenia</h3>
                            <div style="text-align: center">
                                <a class="btn btn-default btn-lg">
                                    <i class="fa fa-book"></i>
                                    Przeczytaj teraz
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="help-header3">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="help-message scale-up-top">
                            <h1>Poradnik dla użytkowników</h1>
                            <h3>Jak korzystać z aplikacji? </h3>
                            <div style="text-align: center">
                                <a class="btn btn-default btn-lg">
                                    <i class="fa fa-book"></i>
                                    Przeczytaj teraz
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
    } else if (content === 'rapports') {
        middle = `<div id='modwrapper'><div id="right"><div id="fillrap"></div></div></div>`
    } else {
        middle = `<div id='err'>No i znowu sie rozjehcało 😩😨😱🥵</div>`
    }

    let ending = `</div></div></div>`

    $('#load').append(start + middle + ending);
    $('.top').css('margin-top', '-8vh');
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
            <i class="fa-duotone fa-book"></i> Zobacz dokumentację
          </a>
          <a onclick="reportBug()" class="clickable">
            <i class="fa-duotone fa-info-circle "></i> Zgłoś coś
          </a>
        </div>
    `

    let mid = `<div id="calcmain"><div class="grid" id="calcDepart"><div id="add" class="clickable" onclick="modalNew('Depart_create')"><i class="fa fa-user-plus"></i><h3>Dodaj nowy</h3></div></div><div id="howMuch"></div>`

    let ending = `</div></div></div></div>`

    let site = start + titleblock + mid + ending


    $('.body').append(site);

    if (is_admin === false) {
        $('#calcDepart').append(`<div class="clickable" onclick="createPopUp('📲Import z Librusa', 'large', 'center', 'importLibrus');openPopUp();"><i class="fa fa-table-cells"></i><h3>Zaimportuj z Librusa</h3></div>`)
    }

    let dataz = {'name': 'Department'}
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
                              <i onclick="editClass(${value[0]});" class="fa-thin fa-pen-to-square modify"></i>  </div>                 
                              <i class="fa fa-users"></i><h3> ${value[1]} </h3></div>

                              `)
            });
            $('#howMuch').append('WYświetlam: ' + $('.cc').length + ' z: ' + $('.cc').length + "</div>");
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
    $('.top').css('margin-top', '0');
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
    createPopUp('<i class="fa-solid fa-brake-warning"></i> Zgłoś coś', 'large', 'center', 'reportBug');
    openPopUp();
}

function showDocs() {
    createPopUp('<i class="fa-solid fa-book"></i> Dokumentacja', 'large', 'center', 'docs');
    openPopUp();
}

function settings() {
    createPopUp('<i class="fa-sharp fa-solid fa-gears"></i> ️Ustawienia', 'large', 'center', 'settings');
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
    }, 100);
}

function sendReport(str, type) {
    let xdata = {'type': type, 'desc': str};
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
            //closePopUp();
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
            html: '<input id="swal-input1" class="swal2-input" placeholder="Imię">' + '<input id="swal-input2" class="swal2-input" placeholder="Nazwisko">' + '<input id="swal-input3" class="swal2-input" placeholder="E-mail">' + '<input id="swal-input4" class="swal2-input" placeholder="Hasło">' + '<input id="swal-input5" class="swal2-input" placeholder="Powtórz hasło">',
            preConfirm: function () {
                return new Promise(function (resolve) {
                    resolve([$('#swal-input1').val(), $('#swal-input2').val(), $('#swal-input3').val(), $('#swal-input4').val()

                    ])
                })
            },
            onOpen: function () {
                $('#swal-input1').focus()
            }
        }).then(function (result) {
            if ($('#swal-input4').val() === $('#swal-input5').val()) {
                let xdata = {
                    'first_name': result.value[0],
                    'last_name': result.value[1],
                    'email': result.value[2],
                    'password': result.value[3]
                };
                $.ajax({
                    url: '/api/create_employee',
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
            } else {
                modalError('Hasła nie są takie same!');
            }
        });
    } else if (type === 'Role_create') {
        new swal({
            title: '➕ Dodajesz nową Podkategorię',
            html: '<input id="swal-input1" class="swal2-input" placeholder="Nazwa">' + '<input id="swal-input2" class="swal2-input" placeholder="Opis">' + '<label for="quantity">Wartość</label>' + '<input id="swal-input3" class="swal2-number" type="number" id="quantity" name="quantity" min="-1000000" max="100000"><br>' + '<div style="display: flex; align-items: center; justify-content: center;"><label for="boo">Czy można dodać tylko raz?</label> <input style="margin-left: 1vw;" id="swal-input4" class="swal2-check" type="checkbox" id="boo"></div><br>' + '<label for="drop">Do jakiej kategorii ma należeć?</label><br>' + '<select id="items" class="swal2-input" name="items"></select>',
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
            html: '<input id="swal-input1" class="swal2-input" placeholder="Nazwa">' + '<input hidden type="color" class="swal2-input" style="width: 20%;" id="favcolor" name="favcolor" value="#ff4444"><p>Kolor i emotikonę wybrać można później.</p>',
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
            html: '<input id="swal-input1" class="swal2-input" placeholder="Nazwa">' + '<input id="swal-input2" class="swal2-input" placeholder="Opis">',
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
            title: '➕ Dodajesz nowego Ucznia', html: `
                 <input id="swal-input1" class="swal2-input" placeholder="Imie"><br>
                 <input id="swal-input2" class="swal2-input" placeholder="Nazwisko"><br>
                 <input id="swal-input3" class="swal2-input" placeholder="Opis">       
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
    } else if (type === 'LoginPhoto_create') {
        new swal({
            title: 'Zmieniasz zdjęcie w tle logowania',
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
                url: '/api/send_login_photo',
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
    } else if (type === 'BackgroundPhoto_restore') {
        new swal({
            title: 'Czy na pewno chcesz przywrócić zdjęcie w tle?',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                let xdata = {'type': 'is_def_bg', 'value': 1};
                $.ajax({
                    url: `/api/set_value`,
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
        });
    } else if (type === 'FaviconPhoto_restore') {
        new swal({
            title: 'Czy na pewno chcesz przywrócić logo?',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                let xdata = {'type': 'is_def_footer', 'value': 1};
                $.ajax({
                    url: `/api/set_value`,
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
        });
    } else if (type === 'LoginPhoto_restore') {
        new swal({
            title: 'Czy na pewno chcesz przywrócić tło logowania?',
            icon: 'warning',
            buttons: true,
            dangerMode: true,
        }).then((willDelete) => {
            if (willDelete) {
                let xdata = {'type': 'is_def_login', 'value': 1};
                $.ajax({
                    url: `/api/set_value`,
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
        });
    } else {
        new swal("Błąd", "Ta funkcja nie została jeszcze dodana, lub nie działa w pełni", "error", {
            button: "Ok",
        });
    }

}

function showClassCalculator(classId, className) {
    $('#calcmain').empty();
    let a;
    if (currentView == 'default') {
        a = ['disabled', 'clickable', 'clickable', 'clickable']
    } else if (currentView == 'filtered') {
        a = ['clickable', 'disabled', 'clickable', 'clickable']
    } else if (currentView == 'browsing') {
        a = ['clickable', 'clickable', 'disabled', 'clickable']
    } else if (currentView == 'managing') {
        a = ['clickable', 'clickable', 'clickable', 'disabled']
    }
    $('#calcmain').append(`<div class="center">
        <div class="buttons">
        <a class="${a[0]}" onclick="currentView = 'default'; showClassCalculator(reloadId);">Edycja uczniów</a>
        <a class="${a[1]}" onclick="currentView = 'filtered'; showClassCalculator(reloadId);">Przeglądanie uczniów</a>
        <a class="${a[2]}" onclick="currentView = 'browsing'; showClassCalculator(reloadId);">Przeglądanie według kategorii</a>
        <a class="${a[3]}" onclick="currentView = 'managing'; showClassCalculator(reloadId);">Zarządzanie danymi uczniów</a></div></div>
    `)

    reloadId = classId;
    reload = 'class';
    reloadName = className;
    if (currentView === 'default' || currentView === 'filtered') {
        let mid_dep = `
              <input class="ttd" style="width: 100%; padding: 1%;" 
              type="text" placeholder="wyszukaj ucznia lub kategorię..." 
              onkeyup="calSearcher(this)">
              <div id="cl_container">
                <div id="cl_students" style="border-right: 1px solid grey; text-align: center">
                  <!--<i class="fa-duotone fa-user-circle fa-2xl"></i>-->
                  <div id="cl_header"><h1 class="cl_points_title">Uczniowie</h1></div>
                  <div id="cl_studlist" style=" text-align: left;"></div>
                  <div id="cl_newstud"><a onclick="modalNew('Object_create')" class="btn btn-default btn-lg"><i class="fa fa-plus"></i>Dodaj nowy</a></div>
                </div>
                <div id="cl_points">
                    <div id="cl_nostud" style="text-align: center">
                       <!--<i id="cl_nostud_icon" class="fa-duotone fa-circle-exclamation fa-2xl"></i>-->
                       <h1 class="cl_points_title" id="cl_points_title">Wybierz ucznia</h1>
                       <h3 class="cl_points_subtitle" id="cl_points_subtitle"></h3>
                    </div>
                </div>
                <div id="cl_additional" style="border-left: 1px solid grey">
                    <div style="text-align: center">
                       <!--<i class="fa-duotone fa-circle-info fa-2xl"></i>-->
                       <h1 class="cl_points_title">O uczniu</h1>
                          <div id="cl_additional_data"></div>
                    </div>
                </div>
            `

        $('.center').append(mid_dep);

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
                    if (value.comment == null) {
                        value.comment = '';
                    }
                    // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                    $('#cl_studlist').append(`<div class="studObject" data-value='${value.id}' onclick="selectStud(${value.id}, '${value.first_name}', '${value.last_name}', '${value.comment}', '${className}')"> <span>${value.last_name} ${value.first_name} </span>
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
                                              <span class="cl_points_parent" style="background-color: ${value.color}"> 
                                              <i onclick="hidePoints(this)" class="fa-solid fa-arrow-circle-down"></i> <i class="fa-solid ${value.emoji}"></i> ${value.name} </span>
                                              <div id="clpc"></div></div>
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
                        $(`#cl_points_p${value.parent_id} > #clpc`).append(`
                        <div class="cl_points_child"><span id="cl_points_c${value.id}">${value.name}</span>
                           <span class="cl_points_counter">
                           <input type="button" class="cl_points_counter_seg" value="-" onclick="addpoint(${value.id}, -1)"/>
                           <input type="text" size="25" value="0" class="cl_points_counter_seg cl_points_counter_in"/> <span>razy</span>
                           <input type="button" class="cl_points_counter_seg" value="+" onclick="addpoint(${value.id}, 1)"/>
                           </span>
                       </div>
                        `);
                    } else {
                        $(`#cl_points_p${value.parent_id} > #clpc`).append(`
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
    } else if (currentView == 'managing') {
            $('.center').append(`
                    <table class="table table-striped table-bordered smol">
                      <thead>
                        <tr>
                          <th width="2%"> Nr </th>
                          <th width="5%"> Imię/Nazwisko</th>
                          <th width="9%"> PESEL</th>
                          <th width="8%"> Data ur. </th>
                          <th width="20%"> Adres </th>
                          <th width="11%"> Nr. tel. </th>
                          <th width="10%"> E-mail </th>
                          <th width="9%"> Punkty/Noty </th>
                          <th width="9%"> Urodził się w </th>
                          <th width="9%"> Nr. tel rodzica </th>
                          <th width="9%"> E-mail rodzica </th>
                          <th width="9%"> Akcja </th>
                        </tr>
                      </thead>
                      <tbody id="append">
        
                      </tbody>
                    </table> <div style="text-align: center" onclick="modalNew('Object_create')">
                        <a class="btn btn-default btn-lg">
                            <i class="fa fa-plus"></i>
                            Dodaj nowego
                        </a>
                      </div>`);
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
                    let id = 1;
                    datay = noNull(datay);
                    $.each(datay, function appendTable(key, value) {
                        if (value.comment == null) {
                            value.comment = '';
                        }
                        if (value.address.includes(';')) {
                            value.address = value.address.replace(';', '&#13;&#10;');
                        }
                        if (value.birth) {
                            value.birth = new Date(value.birth);
                            value.birth = ("0" + value.birth.getUTCDate()).slice(-2) + "/" +
                            ("0" + (value.birth.getUTCMonth() + 1)).slice(-2) + "/" +
                            value.birth.getUTCFullYear().toString().slice(-2);
                        }
                        // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                        $('#append').append(`<tr>
                                              <td>${id}</td>
                                              <td> <input oninput="modifyobject('first_name', this.value, ${value.id})" value="${value.first_name}" class="undis" placeholder="brak imienia">
                                                   <input oninput="modifyobject('last_name', this.value, ${value.id})" value="${value.last_name}" class="undis" placeholder="brak nazwiska"></td>
                                              <td> <input oninput="modifyobject('PESEL', this.value, ${value.id})" value="${value.PESEL}" class="undis" placeholder="b.d."></td>
                                              <td> <input oninput="modifyobject('birth', this.value, ${value.id})" value="${value.birth}" class="undis" placeholder="b.d."></td>
                                              <td> <textarea oninput="modifyobject('address', this.value, ${value.id})" class="undis" placeholder="b.d.">${value.address}</textarea></td>
                                              <td> <input oninput="modifyobject('phone', this.value, ${value.id})" value="${value.phone}" class="undis" placeholder="b.d."></td>
                                              <td> <input oninput="modifyobject('email', this.value, ${value.id})" value="${value.email}" class="undis" placeholder="b.d."></td>
                                              <td> <a>Załaduj punkty</a></td>
                                              <td> <input oninput="modifyobject('birthplace', this.value, ${value.id})" value="${value.birthplace}" class="undis" placeholder="b.d."></td>
                                              <td> <input oninput="modifyobject('parent_phone', this.value, ${value.id})" value="${value.parent_phone}" class="undis" placeholder="b.d."></td>
                                              <td> <input oninput="modifyobject('parent_mail', this.value, ${value.id})" value="${value.parent_mail}" class="undis" placeholder="b.d."></td>
                                              <td><a onclick="modalNew('Object_create')">Edytuj</a></td>
                                          </tr>`);
                        id++;
                    });
                }
            })
    } else if (currentView == 'browsing') {
        $('.center').append(`<div id="cl_points" style="width: 100%;"></div>`);

        let xdata = {'id': classId};

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
                    $('#cl_points').append(`<div class="cl_points" id="cl_points_p${value.id}"> 
                                              <span class="cl_points_parent" style="background-color: ${value.color}; width: 88vw;"> 
                                              <i onclick="hidePoints(this)" class="fa-solid fa-arrow-circle-down"></i> <i class="fa-solid ${value.emoji}"></i> ${value.name} </span>
                                              <div id="clpc"></div></div>
                                              `);
                });
            }, error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        });

        $.ajax({
            url: '/api/list_roles',
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            success: function (data, textStatus, jQxhr) {
                let datax = JSON.parse(data);
                $.each(datax, function appendTable(key, value) {
                    // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                        $(`#cl_points_p${value.parent_id} > #clpc`).append(`
                        <div class="cl_points_child"><span id="cl_points_c${value.id}" onclick="studListThat(${value.id}, undefined, '${value.name}')">${value.name}</span>
                       </div>
                        `);
                });
            }, error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        })
    }
}

function selectStud(id, fname, lname, desc, dep) {
    if ($('#cl_points_title').data('value') === null) {
        $('#cl_points_title').data('value', id);
        $('#cl_points').append('<h1 style="text-align: center;">Nie masz żadnych kategorii</h1>')
        $.ajax({
            url: '/api/list_roles',
            dataType: 'text',
            type: 'post',
            contentType: 'application/x-www-form-urlencoded',
            success: function (data, textStatus, jQxhr) {
                let datax = JSON.parse(data);
                $.each(datax, function appendTable(key, value) {
                    // DAC MOZLIWOSC ZMIANY KOLEJNOSCI
                        $(`#cl_points_p${value.parent_id} > #clpc`).append(`
                        <div class="cl_points_child"><span id="cl_points_c${value.id}" onclick="studListThat(${value.id})">${value.name}</span>
                       </div>
                        `);
                });
            }, error: function (jqXhr, textStatus, errorThrown) {
                modalError(jqXhr.responseText);
            }
        })
    }
    $(".cl_points").each(function () {
            $(this).removeAttr('hidden');
    });
    $(`#cl_points_title`).html(`${fname.charAt(0).toUpperCase() + fname.slice(1)} ${lname.charAt(0).toUpperCase() + lname.slice(1)}`);
    $('#cl_points_title').data('value', id);
    $(`#cl_points_subtitle`).html(`Mam <span id='ser_sum'>???</span> punktów i uczęszczam do klasy ${dep} | ${desc}`);
    $('#cl_nostud_icon').attr('class', 'fa-duotone fa-pen-circle fa-2xl')
    $('#cl_additional_data').html(`<div class="ff">
            <p class="sub"><i class="fa-duotone fa-lightbulb"></i> D A N E</p>
            <div style="width: 100%;"><input type="text" oninput="modifyobject('first_name', this.value)" value="${fname}"><br><input type="text" oninput="modifyobject('last_name', this.value)" value="${lname}"><br><input type="text" placeholder="opis" oninput="modifyobject('comment', this.value)" value="${desc}"><br><p class="ds">Zmiany są zapisywane automatycznie</p></div>
        </div>`)
    $('#cl_additional_data').append(`<div class="ff">
            <p class="sub"><i class="fa-duotone fa-lightbulb"></i> N O T Y</p>
            <div id="notescu"></div>
            <div style="width: 100%;"><input type="text" id="object-note-input" placeholder="zanotuj coś..."><input type="number" id="object-note-val" placeholder="0"><br><button class="btn" onclick="addobjectnote()">Dodaj</button></div>
        </div>`)
    $('#cl_additional_data').append(`<div class="ff">
           <p class="ds" onclick="removeStudent(${id})"><i class="fa-duotone fa-trash"></i> Usuń ucznia</p>
           <p class="ds" onclick="moveStudent(${id})"><i class="fa-duotone fa-arrows"></i> Przenieś ucznia</p>
        </div>`)
    showcurrentpoints(currentView);
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
                $('#popdata').append(`<input class='ttd' 
                style='width: 96%; padding: 1%; margin: 1%' type="text" placeholder="wyszukaj w logach..."
                onkeyup="var value = $(this).val().toLowerCase(); $('#logcount > tr').filter(function() {$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)});">
                <button class='centerx' onclick="download_logs()">Pobierz logi</button>
                </input>`)
                openPopUp();
                $('#popdata').append(`<table id="logcount">`);
                $.each(datax, function appendTable(key, value) {
                    $('#logcount').append(`<tr>
                                              <td>${value}</td>
                                          </tr>`);
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
    } else if (type === 'rapports') {
        new swal({
            title: 'Czy na pewno?',
            text: "Nie ma odwrotu - wszystkie zgłoszenia zostaną wymazane",
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
                url: '/api/remove_rapports',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                success: function (data, textStatus, jQxhr) {
                    swal('Usunięto!', 'Zgłoszenia zostały wymazane', 'success')
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
                            <td  colspan=6"> Nie ma nic w tej kategorii</td>
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
                        xReload('calc');
                        return;
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                        return;
                    }
                });
            });
        case 0:
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
                <button onclick="modalNew('BackgroundPhoto_create')">wstaw swój</button> <button onclick="modalNew('BackgroundPhoto_restore')">przywróć domyślny</button><br><hr>
                <p>Wybierz zdjęcie w stopce i favicon</p>
                <button onclick="modalNew('FaviconPhoto_create')">wstaw swój</button> <button onclick="modalNew('FaviconPhoto_restore')">przywróć domyślny</button><br><hr>
                <p>Wybierz zdjęcie na ekranie logowania</p>
                <button onclick="modalNew('LoginPhoto_create')">wstaw swój</button> <button onclick="modalNew('LoginPhoto_restore')">przywróć domyślny</button><br><hr>`);
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
        $('.modright').html('🥸 Mój Profil');
        $.ajax({
                    url: '/api/get_my_data',
                    dataType: 'text',
                    type: 'get',
                    contentType: 'application/x-www-form-urlencoded',
                    success: function (data, textStatus, jQxhr) {
                        let datay = JSON.parse(data);
                        $('.modright').append('<div class="saferemove" style="padding: 20px; "><i class="fa-duotone fa-user"></i> ' + datay.first_name + ' ' + datay.last_name + '<div>');
                        $('.modright').append('<div class="saferemove" style="padding: 20px; "><i class="fa-duotone fa-envelope"></i> ' + datay.email + '<div>');
                        $('.modright').append(
                            "<div class='saferemove' style='padding: 20px; '><i class='fa-duotone fa-lock-alt'></i> ******** <button onclick='updatepassword(`s`)'>Zmień hasło</button></div>" +
                            "<button class=\"btn\" onclick=\"modalNew('ProfilePhoto_create')\">Zmień zdjęcie profilowe</button> " +
                            "<button className=\"btn\" onClick=\"modalNew('BgPhoto_create')\">Zmień zdjęcie w tle</button>" +
                            "<h6>Administrator może dokonać korekty twoich danych w Panelu.</h6>");
                    }
        });
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
    let xdata = {'type': 'theme color is_def_bg is_def_footer is_def_login'};
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
                if (vdata[2] == 1) {
                    $('.intro-header').css("background-image", "url(../static/img/n2.jpg)");
                }
            } else if (vdata[0] == 1) {
                $("body").attr("style", "--bg-color: rgb(0, 0, 0); --bg-color-accent: rgb(30, 30, 30);--fg-color: rgb(220, 220, 220);");
                if (vdata[2] == 1) {
                    $('.intro-header').css("background-image", "url(../static/img/n1.jpg)");
                }
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


function showcurrentpoints(view = 'default') {
    if (view == 'managing') return;
    $(".cl_points_child").each(function(index, element) {
        $(element).show();

        $(element).children().show();
    });
    let sum = 0;
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
                if (x.length !== 0) {
                    x.val(vdata[i][1]);
                    if (x.val() == 0 && view == 'filtered') {
                        x.parent().parent().hide();
                    }
                } else {
                    if (vdata[i][1] == 1) {
                        $(`#cl_points_c${vdata[i][0]}`).parent().children('.cl_points_one').children('.one').addClass('cl_active');
                    } else {
                        $(`#cl_points_c${vdata[i][0]}`).parent().children('.cl_points_zero').children('.zero').addClass('cl_active');
                        if (view == 'filtered') {
                            $(`#cl_points_c${vdata[i][0]}`).parent().hide();
                        }
                    }
                }
                sum = sum + parseInt(vdata[i][2] * vdata[i][1]);
                $('#ser_sum').text(sum.toString());
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
                sum = sum + parseInt(value[2]);
                $('#ser_sum').text(sum.toString());
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })
    $('#ser_sum').text(sum.toString());
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
            showcurrentpoints(currentView);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function modifyobject(type, value, id = -1) {
    if (type == 'address') {
        value = value.replace('\n', ';')
        value = value.replace('/n', ';')
        value = value.replace('+', ' ')
    }
    if (value == '' || value == null) {
        value = ' ';
    }
    let xdata = {'id': id, 'key': type, 'value': value};
    if (id == -1) {
        xdata['id'] = $('#cl_points_title').data('value');
    }
    $.ajax({
        url: `/api/update_object`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints(currentView);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });

}

function addobjectnote() {
    const ob = document.getElementById('object-note-input');
    const oc = document.getElementById('object-note-val');
    let xdata = {'id': $('#cl_points_title').data('value'), 'note': ob.value, value: oc.value};
    $.ajax({
        url: `/api/add_object_note`,
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            showcurrentpoints(currentView);
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
            showcurrentpoints(currentView);
        }
    });
}

function editemp(id, key, value) {
    if (value == '' || value == null) {
        value = ' ';
    }
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
    if (value == '' || value == null) {
        value = ' ';
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
    if (value == '' || value == null) {
        value = ' ';
    }
    let xdata = {'id': id, 'key': key, 'value': value.toString()};
    console.log(xdata)
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
    <i class="fa-duotone fa-handshake" onclick="editprimcat(${id}, 'emoji', 'fa-handshake');ec();"></i>
    <i class="fa-duotone fa-face-angry" onclick="editprimcat(${id}, 'emoji', 'fa-face-angry');ec();"></i>
    <i class="fa-duotone fa-money-bill" onclick="editprimcat(${id}, 'emoji', 'fa-money-bill');ec();"></i>
    <i class="fa-duotone fa-comments" onclick="editprimcat(${id}, 'emoji', 'fa-comments');ec();"></i>
    <i class="fa-duotone fa-graduation-cap" onclick="editprimcat(${id}, 'emoji', 'fa-graduation-cap');ec();"></i>
    <i class="fa-duotone fa-atom" onclick="editprimcat(${id}, 'emoji', 'fa-atom');ec();"></i>
    <i class="fa-duotone fa-award" onclick="editprimcat(${id}, 'emoji', 'fa-award');ec();"></i>
    <i class="fa-duotone fa-baby" onclick="editprimcat(${id}, 'emoji', 'fa-baby');ec();"></i>
    <i class="fa-duotone fa-city" onclick="editprimcat(${id}, 'emoji', 'fa-city');ec();"></i>
    <i class="fa-duotone fa-bacon" onclick="editprimcat(${id}, 'emoji', 'fa-bacon');ec();"></i>
    <i class="fa-duotone fa-dumpster-fire" onclick="editprimcat(${id}, 'emoji', 'fa-dumpster-fire');ec();"></i>
    <i class="fa-duotone fa-dragon" onclick="editprimcat(${id}, 'emoji', 'fa-dragon');ec();"></i>
    <i class="fa-duotone fa-user-bounty-hunter" onclick="editprimcat(${id}, 'emoji', 'fa-user-bounty-hunter');ec();"></i>
    <i class="fa-duotone fa-user-astronaut" onclick="editprimcat(${id}, 'emoji', 'fa-user-astronaut');ec();"></i>
    <i class="fa-duotone fa-flag-checkered" onclick="editprimcat(${id}, 'emoji', 'fa-flag-checkered');ec();"></i>
    <i class="fa-duotone fa-user-cowboy" onclick="editprimcat(${id}, 'emoji', 'fa-user-cowboy');ec();"></i>
    <i class="fa-duotone fa-user-ninja" onclick="editprimcat(${id}, 'emoji', 'fa-user-ninja');ec();"></i>
    <i class="fa-duotone fa-user-secret" onclick="editprimcat(${id}, 'emoji', 'fa-user-secret');ec();"></i>
    <i class="fa-duotone fa-user-tie" onclick="editprimcat(${id}, 'emoji', 'fa-user-tie');ec();"></i>
    <i class="fa-duotone fa-user-graduate" onclick="editprimcat(${id}, 'emoji', 'fa-user-graduate');ec();"></i>
    <i class="fa-duotone fa-user-md" onclick="editprimcat(${id}, 'emoji', 'fa-user-md');ec();"></i>
    <i class="fa-duotone fa-user-injured" onclick="editprimcat(${id}, 'emoji', 'fa-user-injured');ec();"></i>
    </div>`);
}

function ec() {
    closePopUp();
    xReload('categories');
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

function updatepassword(param) {
    //open swal and ask for a password
    new swal({
        title: 'Zmiana hasła',
        html: `<input id="swal-input2" class="swal2-input" placeholder="Nowe hasło" type="password">` + `<input id="swal-input3" class="swal2-input" placeholder="Powtórz nowe hasło" type="password">`,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve([$('#swal-input2').val(), $('#swal-input3').val()])
            })
        }
    }).then(function (result) {
        if (result.value[0] === result.value[1]) {
            $.ajax({
                url: '/api/update_password',
                dataType: 'text',
                type: 'post',
                contentType: 'application/x-www-form-urlencoded',
                data: {'password': result.value[0]},
                success: function (data, textStatus, jQxhr) {
                    modalDone();
                    window.location.replace('/auth/logout');
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    modalError(jqXhr.responseText);
                }
            });
        } else {
            modalError('Hasła nie są takie same!');
        }
    });
}

function editClass(id) {

    //get class data from api
    $.ajax({
        url: '/api/get_depart_by_id',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: {'id': id},
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            console.log(vdata)
            //open swal and ask for a password
            new swal({
                title: 'Edytujesz klasę',
                text: "Możesz zmienić każdy parametr",
                type: 'info',
                html: `<input id="swal-input1" class="swal2-input" value="${vdata[0]}">` + `<input id="swal-input2" class="swal2-input" value="${vdata[1]}">`,
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
                    url: '/api/update_depart_by_id',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: {'id': id, 'name': result.value[0], 'description': result.value[1]},
                    success: function (data, textStatus, jQxhr) {
                        modalDone();
                        xReload('calc');
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                });
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    });
}

function showReports() {
    createPopUp('Raporty', 'large', 'center', 'rapports');
    openPopUp();
    $.ajax({
        url: '/api/get_rapports', type: 'get', success: function (data, textStatus, jQxhr) {
            for (const x of data) {
                $('#fillrap').append(`<br><p id='rr_${x.id}'>${x.type} - ${x.description} | ${x.time} | UID ${x.uid}<i class="fa-trash fa-duotone" onclick="removeReport(${x.id});$('#rr_${x.id}').remove()"></i></p>`)
            }
        }
    })
}

function resetPassword(id) {
    new swal({
        title: 'Resetuj hasło',
        text: 'Czy na pewno chcesz zresetować hasło użytkownika?',
        type: 'warning',
        html: `<input id="swal-input1" class="swal2-input" placeholder="Nowe hasło" type="password">` + `<input id="swal-input2" class="swal2-input" placeholder="Powtórz nowe hasło" type="password">`,
        preConfirm: function () {
            return new Promise(function (resolve) {
                resolve([$('#swal-input1').val(), $('#swal-input2').val()])
                if ($('#swal-input1').val() !== $('#swal-input2').val()) {
                    modalError('Hasła nie są takie same!');
                } else {
                    $.ajax({
                        url: '/api/update_employee',
                        dataType: 'text',
                        type: 'post',
                        contentType: 'application/x-www-form-urlencoded',
                        data: {id: id, key: 'password', value: $('#swal-input1').val()},
                        success: function (data, textStatus, jQxhr) {
                            modalDone();
                        },
                        error: function (jqXhr, textStatus, errorThrown) {
                            modalError(jqXhr.responseText);
                        }
                    });
                }
            });
        }
    });
}

function removeStudent(id) {
    $.ajax({
        url: '/api/remove_student',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: {id: id},
        success: function (data, textStatus, jQxhr) {
            modalDone();
            showClassCalculator(reloadId);
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })

}

function moveStudent(id) {
    $.ajax({
        url: '/api/list_departments',
        dataType: 'text',
        type: 'get',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            new swal({
                title: 'Przenieś ucznia',
                html: '<label for="drop">Do jakiej klasy ma należeć?</label>' + '<select id="xvitems" class="swal2-select" name="items"></select>',
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        resolve([$('#items').find('option:selected').attr('id')])
                    })
                },
                didOpen: function () {
                    $.each(vdata, function (val, text) {
                        $('#xvitems').append(`<option value="${text[0]}" id="${text[0]}">${text[1]}</option>`)
                    });
                }
            }).then(function (result) {
                console.log(id, result.value[0])
                $.ajax({
                    url: '/api/move_student',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: {id: id, depart: $('#xvitems').val(),},
                    success: function (data, textStatus, jQxhr) {
                        modalDone();
                        showClassCalculator(reloadId);
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                })
            })
        }
    })
}

function download_logs() {
    $.ajax({
        url: '/api/download_logs',
        type: 'get',
        success: function (data, textStatus, jQxhr) {
            modalDone();
            let blob = new Blob([data], { type: 'text/csv' });
            let zlink =window.URL.createObjectURL(blob);
            window.location = zlink
        }
    });
}


function xexport(type) {
    $.ajax({
        url: '/api/export_data',
        type: 'post',
        data: {type: type},
        success: function (data, textStatus, jQxhr) {
            modalDone();
            let blob = new Blob([data], {type: `application/${type}`});
            let zlink = window.URL.createObjectURL(blob);
            window.location = zlink
        }
    })
}

function hidePoints(x) {
    $(x).parent().next().hide();
    $(x).removeClass('fa-arrow-circle-down');
    $(x).addClass('fa-arrow-circle-up');
    $(x).attr('onclick', 'showPoints(this)');
}

function showPoints(x) {
    $(x).parent().next().show();
    $(x).removeClass('fa-arrow-circle-up');
    $(x).addClass('fa-arrow-circle-down');
    $(x).attr('onclick', 'hidePoints(this)');
}

function studListThat(id, rol='?', cln='?') {
    let xdata = {'class_id': reloadId, 'role_id': id}
    $.ajax({
        url: '/api/list_with_category_in_class',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: xdata,
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            console.log(vdata)
            createPopUp('<i class="fa-solid fa-list-1-2"></i> Lista uczniów', 'large', 'center', 'empty');
            openPopUp();
            $('#popdata').append(`
            <p>Oto i jest lista uczniów z Klasy ${rol} posiadających rolę ${cln}. <a onclick="dlStudListThat(${id})">Możesz preferować też jej pobranie.</a></p>
            <table id="studlist" class="table table-striped table-bordered table-hover table-sm">
                <thead>
                <tr>
                    <th>Imię</th>
                    <th>Nazwisko</th>
                    <th>Ile razy?</th>
                </tr>
                </thead>
                <tbody id="studlistbody">
                </tbody>
            </table>`);
            for (const x of vdata) {
                $('#studlistbody').append(`<tr><td>${x[1]}</td><td>${x[2]}</td><td>${x[3]}</td></tr>`)
            }
        }, error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }

    })
}

function calSearcher(x) {
    //search in student list and categories
    let input = $(x).val().toLowerCase();
    let studentlist = $('#cl_studlist').children();
    let categories = $('#clpc');
    //search in student list
    for (let i = 0; i < studentlist.length; i++) {
        if (studentlist[i].innerText.toLowerCase().indexOf(input) > -1) {
            studentlist[i].style.display = "";
        } else {
            studentlist[i].style.display = "none";
        }
    }
    //search in categories
    for (let i = 0; i < categories.length; i++) {
        if (categories[i].innerText.toLowerCase().indexOf(input) > -1) {
            categories[i].style.display = "";
        } else {
            categories[i].style.display = "none";
        }
    }
}

function adminSwitch(id) {
    $.ajax({
        url: '/api/admin_switch',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: {id: id},
        success: function (data, textStatus, jQxhr) {
            modalDone();
            xReload('admin');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })
}

function removePermission(id) {
    $.ajax({
        url: '/api/remove_permission',
        dataType: 'text',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded',
        data: {id: id},
        success: function (data, textStatus, jQxhr) {
            modalDone();
            xReload('admin');
        },
        error: function (jqXhr, textStatus, errorThrown) {
            modalError(jqXhr.responseText);
        }
    })
}

function addPerm(uid) {
    $.ajax({
        url: '/api/list_departments',
        dataType: 'text',
        type: 'get',
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, textStatus, jQxhr) {
            let vdata = JSON.parse(data);
            new swal({
                title: 'Dodaj uprawnienia',
                html: '<label for="drop">Do jakiej klasy ma należeć?</label>' + '<select id="items" class="swal2-select" name="items"></select>',
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        resolve([$('#items').find('option:selected').attr('id')])
                    })
                },
                didOpen: function () {
                    $.each(vdata, function (val, text) {
                        $('#items').append(`<option value="${text[0]}" id="${text[0]}">${text[1]}</option>`)
                    });
                }
            }).then(function (result) {
                $.ajax({
                    url: '/api/add_permission',
                    dataType: 'text',
                    type: 'post',
                    contentType: 'application/x-www-form-urlencoded',
                    data: {user: uid, id: $('#items').val()},
                    success: function (data, textStatus, jQxhr) {
                        modalDone();
                        xReload('admin');
                    },
                    error: function (jqXhr, textStatus, errorThrown) {
                        modalError(jqXhr.responseText);
                    }
                })
            })
        }
    })
}

function dlStudListThat(id) {
    $.ajax({
        url: '/calculations/whohas',
        type: 'POST',
        data: {class_id: reloadId, role_id: id},
        dataType: 'arraybuffer',  // Specify arraybuffer for binary data
        success: function (data) {
            try {
                // Create a Blob from the binary data
                var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                // Create a download link
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the download attribute with the desired file name
                var fileName = 'my_file_' + new Date().toISOString().slice(0, 10) + '.xlsx';
                link.download = fileName;

                // Append the link to the document
                document.body.appendChild(link);

                // Trigger a click on the link to start the download
                link.click();

                // Remove the link from the document
                document.body.removeChild(link);
            } catch (error) {
                console.error('Error handling binary data:', error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error downloading file:', textStatus, errorThrown);
        }
    });
}

function noNull(arr) {
  return arr.map(obj => {
    for (const key in obj) {
      if (obj[key] === null || obj[key] === ' ') {
        obj[key] = '';
      } else if (typeof obj[key] === 'object') {
        obj[key] = noNull([obj[key]])[0];
      }
    }
    return obj;
  });
}

$(document).on('click', '#popclose', function () {
    $('.top').css('margin-top', '0vh');
    $('#modal').css('margin-top', '110vh');
    setTimeout(function () {
        $('#modal').remove();
    }, 2000);

});

$(document).on('click', '.cc', function (e) {
    // if it is on .fa-thin, do nothing
    if (e.target.className.includes('fa-thin')) {
        return;
    }

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

//set timeout for render_theme

$(document).ready(function () {
    console.log('ready script')
    render_theme();
    setTimeout(function () {
        $('.xbody').removeClass('zbody')
    }, 200);
})
