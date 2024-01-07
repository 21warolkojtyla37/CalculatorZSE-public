from flask import abort, render_template, Response, request, send_file
import xlsxwriter
from . import magic
from .. import db
from ..models import Department, Employee, Role, RoleUser, PermissionUser, Object, Setting
from flask_login import current_user, login_required
import io
import os
import numpy as np
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib.pyplot as plt
import tabula
from ..util import handleException, check_admin, LogEx
from datetime import datetime
import tempfile
import shutil
import csv

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
    st = Setting.query.filter_by(name='user_import').first()
    if st.value == '0':
        return 'ERR', 403
    isthisFile = request.files.get('file')
    isthisFile.save('./' + isthisFile.filename)
    tables = tabula.read_pdf(isthisFile.filename, pages='all', multiple_tables=False)
    for i, table in enumerate(tables):
        LogEx("GOODIMP", current_user.id, f"Zaimportowano klasę z {isthisFile.filename} przez <{current_user.email}>")
        for index, row in table.iterrows():
            i = row.get('Nazwisko, imię', '').split()
            j = row.get('Klasa', '').split()
            k = str(row.get('PESEL', '')).zfill(11) if 'PESEL' in row else None
            l = datetime.strptime(row.get('Data Urodzenia', ''), '%Y-%m-%d') if 'Data Urodzenia' in row else None
            m = row.get('Adres', '')
            n = row.get('Telefon', '')
            o = row.get('Urodzony w(e)', '')
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
        class_id = request.form['class_id']
    else:
        return 'ERR', 400

    check_admin('Point Group List', request.form['class_id'])

    if request.form['role_id']:
        role_id = request.form['role_id']
    else:
        return 'ERR', 400

    LogEx("GOODWH", current_user.id, f"Wygenerowałem arkusz dla klasy {class_id} <{current_user.email}>")

    data = RoleUser.query.filter_by(roleid=role_id).all()
    objects = Object.query.filter_by(department_id=class_id).all()
    res_objects = []

    for obj in objects:
        for role_user in data:
            if obj.id == role_user.userid:
                res_objects.append([obj.id, obj.first_name, obj.last_name, role_user.value])

    output = io.BytesIO()

    with xlsxwriter.Workbook(output, {'in_memory': True}) as workbook:
        worksheet = workbook.add_worksheet('Dane')
        worksheet.write(0, 0, 'ID')
        worksheet.write(0, 1, 'Imię')
        worksheet.write(0, 2, 'Nazwisko')
        worksheet.write(0, 3, 'Rola')
        row = 1
        col = 0
        for obj_data in res_objects:
            worksheet.write(row, col, obj_data[0])
            worksheet.write(row, col + 1, obj_data[1])
            worksheet.write(row, col + 2, obj_data[2])
            worksheet.write(row, col + 3, obj_data[3])
            row += 1

    output.seek(0)

    # Save the file to disk
    filename = f'{class_id}_{role_id}.xlsx'
    output_path = os.path.join(os.path.dirname(__file__), '..', 'static', 'user_content', 'spreadsheets', filename)
    with open(output_path, 'wb') as file:
        file.write(output.getvalue())

    # Send the file as a response
    return send_file(output_path, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True, download_name=filename)


@magic.route('/export_data', methods=['POST'])
@login_required
def export_data():
    check_admin()
    export_type = request.form.get('type')

    if export_type == 'zip':
        try:
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, 'data.zip')

            with zipfile.ZipFile(zip_path, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
                export_table_to_csv(zip_file, 'pracownicy.csv', Employee)
                export_table_to_csv(zip_file, 'kategorie.csv', Role)
                export_table_to_csv(zip_file, 'kategorie_nadrzedne.csv', RoleParent)
                export_table_to_csv(zip_file, 'obiekty.csv', Object)
                export_table_to_csv(zip_file, 'notatki.csv', Note)
                export_table_to_csv(zip_file, 'uprawnienia.csv', PermissionUser)
                export_table_to_csv(zip_file, 'punkty.csv', RoleUser)
                export_table_to_csv(zip_file, 'logi.csv', Log)
                export_table_to_csv(zip_file, 'raporty.csv', Info)
                export_table_to_csv(zip_file, 'ustawienia.csv', Setting)
                export_table_to_csv(zip_file, 'departamenty.csv', Department)
                export_table_to_csv(zip_file, 'personalne_ustawienia.csv', PersonalSettingOverride)

            return send_file(
                zip_path,
                mimetype='application/zip',
                as_attachment=True,
                download_name='data.zip',
                conditional=True
            )
        except Exception as e:
            print(f"Error: {e}")
            return "Error occurred while exporting data", 500
        finally:
            shutil.rmtree(temp_dir)  # Clean up temporary directory after use

    elif export_type == 'sql':
        db_file_path = os.path.join(os.path.dirname(__file__), '..', '..', 'instance', 'main.db')
        return send_file(db_file_path, as_attachment=True, download_name='main.db')

    else:
        return "Invalid export type", 400

def export_table_to_csv(zip_file, filename, model):
    with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_csv:
        csv_writer = csv.writer(temp_csv)
        header = [column.name for column in model.__table__.columns]
        csv_writer.writerow(header)
        for row in model.query.all():
            csv_writer.writerow([getattr(row, column) for column in header])
        temp_csv.seek(0)
        zip_file.write(temp_csv.name, filename)


@magic.route('/fill_mails', methods=['POST'])
@login_required
def fill_mails():
    check_admin()
    try:
        s = Setting.query.filter_by(name='mail_template').first()
        s = str(s.value)
        d = request.form.get('d')
        ob = Object.query.filter_by(department_id=d).all()
        for o in ob:
            polish_chars = 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ'
            english_equivalents = 'acelnoszzACELNOSZZ'
            translation_table = str.maketrans(polish_chars, english_equivalents)
            x = o.first_name.lower().translate(translation_table)
            y = o.last_name.lower().translate(translation_table)
            o.email = s.format(first_name=x,last_name=y)
            db.session.commit()
        return 'OK', 200
    except Exception as e:
        print(f"Error: {e}")
        return "Error occurred while filling mails", 500