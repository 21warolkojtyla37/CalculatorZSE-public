from flask import abort, render_template, Response, request
import xlsxwriter
from . import magic
from .. import db
from ..models import Department, Employee, Role, RoleUser, PermissionUser, Object
from flask_login import current_user, login_required
import io
import numpy as np
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
import matplotlib 
import matplotlib.pyplot as plt
import tabula
from ..util import handleException, check_admin, LogEx
from datetime import datetime

@magic.route('a')
@login_required
def homepage():
    return render_template('magic/view.html', title='Tajne rzeczy')

@magic.route('b')
@login_required
def worksheet():
    workbook = xlsxwriter.Workbook('Expenses01.xlsx')
    worksheet = workbook.add_worksheet()

    employees = Object.query.all()
    conn = RoleUser.query.all()
    role = Role.query.all()
    departments = Department.query.all()

    row = 1
    col = 0

    worksheet.write(row, col, "Nazwa")
    worksheet.write(row, col + 1, "Opis")
    worksheet.write(row, col + 2, "Liczba osob")

    for d in departments:
        worksheet.write(row, col, d.name)
        worksheet.write(row, col + 1, d.description)
        worksheet.write(row, col + 2, d.employees.count())
        row += 1

    workbook.close()
    return render_template('magic/view.html', title='Arkusze')

@magic.route('c&<int:id>')
@login_required
def worksheet2(id):
    workbook = xlsxwriter.Workbook('Expenses01.xlsx')
    worksheet = workbook.add_worksheet()

    employees = Object.query.filter_by(department_id=id).all()
    conn = RoleUser.query.all()
    role = Role.query.all()

    row = 1
    col = 0
    s = 0

    worksheet.write(row - 1, col, "Nazwa")
    worksheet.write(row - 1, col + 1, "Opis")
    worksheet.write(row - 1, col + 2, "Liczba osob")

    for e in employees:
        worksheet.write(row, col, (e.first_name + e.last_name))
        worksheet.write(row, col + 1, e.comment)
        col += 2
        for c in conn:
            if e.id == c.userid:
                for r in role:
                    if c.roleid == r.id:
                        worksheet.write(row, col + s, r.value)
                        col += 1
        row += 1
        col = 0

    workbook.close()
    return render_template('magic/view.html', title='Wyświetl')

@magic.route('d')
@login_required
def history():
    pass

@magic.route('e/<string:data1>/<string:title>/')
@login_required
def plot(data1, title):
    if data1 == "studentsByDep":
        employees = Object.query.all()
        conn = RoleUser.query.all()
        role = Role.query.all()
        did = []
        die = []
        departments = Department.query.all()

        if current_user.is_admin:
            for dp in departments:
                did.append(dp.name)
                u = 0
                for employee in employees:
                    if employee.department_id == dp.id:
                        u = u + 1
                die.append(u)

        labels = did
        means = die
        
    elif data1 == "bestStudents":
        employees = Object.query.all()
        conn = RoleUser.query.all()
        role = Role.query.all()
        did = []
        die = []
        
        if current_user.is_admin:
            for st in employees:
                did.append(st.first_name)
                u = 0
                for r in conn:
                    if r.userid == st.id:
                        for rl in role:
                            if r.roleid == rl.id:
                                u = u + (rl.value)
                die.append(u)
                
        print(die)
    
        newdid = []
        newdie = []
        
        for i in range(5):
            x = did.index(max(did))
            print(x)
            max_value = die[x]
            max_name = did[x]
            newdid.append(max_name)
            newdie.append(max_value)
            did.pop(x)
            die.pop(x)
            
        labels = newdid
        means = newdie
    
    else:
        abort(404)

    x = np.arange(len(labels))
    width = 1

    fig, ax = plt.subplots()
    rects1 = ax.bar(x - width, means, width / 2, label='dd')

    ax.set_ylabel('Scores')
    ax.set_title(title)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.legend()


    def autolabel(rects):
        """Attach a text label above each bar in *rects*, displaying its height."""
        for rect in rects:
            height = rect.get_height()
            ax.annotate('{}'.format(height),
                        xy=(rect.get_x() + rect.get_width() / 2.5, height),
                        xytext=(0, 3),  
                        textcoords="offset points",
                        ha='center', va='bottom')


    autolabel(rects1)

    fig.tight_layout()
    
    output = io.BytesIO()
    FigureCanvas(fig).print_png(output)
    return Response(output.getvalue(), mimetype='image/png')

@magic.route('f', methods=['GET', 'POST'])
@login_required
def data_import():
    isthisFile = request.files.get('file')
    isthisFile.save('./' + isthisFile.filename)
    tables = tabula.read_pdf(isthisFile.filename, pages='all', multiple_tables=False)
    for i, table in enumerate(tables):
        LogEx("GOODIMP", current_user.id, f"Zaimportowano klasę z {isthisFile.filename} przez <{current_user.email}>")
        for index, row in table.iterrows():
            i = row['Nazwisko, imię'].split() if row['Nazwisko, imię'] else ['', '']
            j = row['Klasa'].split() if row['Klasa'] else ['', '']
            k = str(row['PESEL']).zfill(11) if row['PESEL'] else None
            l = datetime.strptime(row['Data Urodzenia'], '%Y-%m-%d').date() if row['Data Urodzenia'] else None
            m = row['Adres'] if row['Adres'] else None
            n = row['Telefon'] if row['Telefon'] else None
            o = row['Urodzony w(e)'] if row['Urodzony w(e)'] else None
            x = Department.query.filter_by(name=j[0]).first()
            if not x:
                y = Department(name=j[0], description=f'Klasa zaimportowana przez {current_user.first_name} {current_user.last_name}')
                p = PermissionUser(permissionid=y.id, userid=current_user.id)
                try:
                    db.session.add(y)
                    db.session.commit()
                    db.session.add(p)
                    db.session.commit()
                    x = y
                except Exception as e:
                    handleException(e)
            o = Object(first_name=i[1], last_name=i[0], department_id=x.id, PESEL=k, birth=l, address=m, phone=n, birthplace=o)
            db.session.add(o)
            db.session.commit()
    return 'OK', 200

'''
@magic.route('f', methods=['GET', 'POST'])
@login_required
def data_import():
    isthisFile = request.files.get('file')
    isthisFile.save('./' + isthisFile.filename)
    tables = tabula.read_pdf(isthisFile.filename, pages='all', multiple_tables=False)

    for i, table in enumerate(tables):
        LogEx("GOODIMP", current_user.id, f"Zaimportowałem {isthisFile.filename} <{current_user.email}>")

        for index, row in table.iterrows():
            i = row.get('Nazwisko, imię', '').split()
            j = row.get('Klasa', '').split()
            k = str(row.get('PESEL', '')).zfill(11) if 'PESEL' in row else None
            l = datetime.strptime(row.get('Data Urodzenia', ''), '%Y-%m-%d') if 'Data Urodzenia' in row else None
            m = row.get('Adres', '')
            n = row.get('Telefon', '')
            o = row.get('Urodzony w(e)', '')

            x = Department.query.filter_by(name=j[0]).first()
            if x:
                o = Object.query.filter_by(first_name=i[1], last_name=i[0], department_id=x.id).first()
                if o:
                    o.PESEL = k
                    o.birth = l
                    o.address = m
                    o.phone = n
                    o.birthplace = o

                    db.session.commit()
                else:
                    o = Object(
                        first_name=i[1],
                        last_name=i[0],
                        department_id=x.id,
                        PESEL=k,
                        birth=l,
                        address=m,
                        phone=n,
                        birthplace=o,
                    )

                    db.session.add(o)
                    db.session.commit()
            if not x:
                y = Department(name=j[0],
                               description=f'Klasa zaimportowana przez {current_user.first_name} {current_user.last_name}')
                p = PermissionUser(permissionid=y.id, userid=current_user.id)
                try:
                    db.session.add(y)
                    db.session.commit()
                    db.session.add(p)
                    db.session.commit()
                    x = y
                except Exception as e:
                    handleException(e)

                o = Object(
                    first_name=i[1],
                    last_name=i[0],
                    department_id=x.id,
                    PESEL=k,
                    birth=l,
                    address=m,
                    phone=n,
                    birthplace=o,
                )

                db.session.add(o)
                db.session.commit()

    return 'OK', 200
'''

'''
generate pdf with objects which are in class and have some role
'''
@magic.route('/whohas', methods=['GET', 'POST'])
@login_required
def whohas():
    if request.form['class_id']:
        l = request.form['class_id']
    else:
        return 'ERR', 400

    check_admin('Point Group List', request.form['class_id'])

    if request.form['role_id']:
        t = request.form['role_id']
    else:
        return 'ERR', 400

    LogEx("GOODWH", current_user.id, f"Wygenerowałem arkusz dla klasy {l} <{current_user.email}>")

    data = RoleUser.query.filter_by(roleid=t).all()
    objects = Object.query.filter_by(department_id=l).all()
    res_objects = []
    for x in objects:
        for y in data:
            if x.id == y.userid:
                res_objects.append([x.id, x.first_name, x.last_name, y.value])

    response = Response()
    response.status_code = 200
    output = io.StringIO()
    workbook = xlsxwriter.Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet('Dane')
    worksheet.write(0, 0, 'ID')
    worksheet.write(0, 1, 'Imię')
    worksheet.write(0, 2, 'Nazwisko')
    worksheet.write(0, 3, 'Rola')
    row = 1
    col = 0
    for x in res_objects:
        worksheet.write(row, col, x[0])
        worksheet.write(row, col + 1, x[1])
        worksheet.write(row, col + 2, x[2])
        worksheet.write(row, col + 3, x[3])
        row += 1
    workbook.close()
    output.seek(0)
    response = Response(
        output.getvalue(),
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        headers={'Content-Disposition': f'attachment; filename={l}_{t}.xlsx'}
    )
    return response